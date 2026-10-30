// Khẩu Xà Tâm Phật — server tĩnh + đồng bộ realtime theo "mạng" (cùng IP public / cùng LAN), mỗi cảnh một phòng.
// Không phụ thuộc thư viện ngoài: Server-Sent Events cho chiều xuống, POST JSON cho chiều lên.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const hasProfanity = require('./public/profanity.js');

const PORT = process.env.PORT || 3000;
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const STALE_MS = 15000;
const TICK_MS = 100;
const MAX_BODY = 4096;
const MAX_PER_ROOM = 60;
const MAX_TASKS_PER_ROOM = 300;
const TASK_TTL_MS = 24 * 60 * 60 * 1000; // task cũ hơn 1 ngày tự xoá

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

// rooms: roomKey -> { players: Map<id, player>, clients: Map<id, res> }
const rooms = new Map();

function clientIp(req) {
  let ip = req.socket.remoteAddress || '';
  if (TRUST_PROXY && req.headers['x-forwarded-for']) {
    // Lấy phần tử cuối (do proxy của mình thêm vào) — phần đầu do client tự khai, không tin được.
    const parts = String(req.headers['x-forwarded-for']).split(',');
    ip = parts[parts.length - 1].trim();
  }
  if (ip.indexOf('::ffff:') === 0) ip = ip.slice(7);
  return ip;
}

// Chỉ có hai cảnh: chùa (mặc định) và công sở.
function cleanScene(s) {
  return s === 'office' ? 'office' : 'temple';
}

// Mọi IP nội bộ (LAN / localhost) gom chung một phòng, IP public thì mỗi IP một phòng;
// mỗi cảnh (chùa / công sở) là một phòng riêng.
function roomKeyFor(req, scene) {
  return networkKey(req) + '|' + cleanScene(scene);
}

function networkKey(req) {
  const ip = clientIp(req);
  const isPrivate =
    ip === '::1' || ip === '127.0.0.1' ||
    /^10\./.test(ip) || /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^169\.254\./.test(ip) || /^f[cd]/i.test(ip) || /^fe80/i.test(ip);
  return isPrivate ? 'lan' : ip;
}

function getRoom(key) {
  let room = rooms.get(key);
  if (!room) {
    room = { players: new Map(), clients: new Map(), tasks: new Map(), nextTaskId: 1 };
    rooms.set(key, room);
  }
  return room;
}

const POSES = ['stand', 'walk', 'sit', 'kneel', 'bow', 'eat'];

function clampNum(v, min, max, def) {
  v = Number(v);
  if (!isFinite(v)) return def;
  return Math.max(min, Math.min(max, v));
}

function cleanId(id) {
  return typeof id === 'string' && /^[a-z0-9]{8,32}$/i.test(id) ? id : null;
}

function cleanText(s, max) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

function send(res, event, data) {
  res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n');
}

function broadcast(room, event, data) {
  room.clients.forEach(function (res) { send(res, event, data); });
}

function readJson(req, cb) {
  let body = '';
  let tooBig = false;
  req.setEncoding('utf8');
  req.on('data', function (chunk) {
    body += chunk;
    if (body.length > MAX_BODY) { tooBig = true; req.destroy(); }
  });
  req.on('end', function () {
    if (tooBig) return cb(null);
    try { cb(JSON.parse(body)); } catch (e) { cb(null); }
  });
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj || {}));
}

function handleEvents(req, res, url) {
  const id = cleanId(url.searchParams.get('id'));
  if (!id) return json(res, 400, { error: 'bad id' });
  const key = roomKeyFor(req, url.searchParams.get('scene'));
  const room = getRoom(key);
  const old = room.clients.get(id);
  if (old) old.end();
  else if (room.clients.size >= MAX_PER_ROOM) return json(res, 503, { error: 'room full' });
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 2000\n\n');
  room.clients.set(id, res);
  if (cleanScene(url.searchParams.get('scene')) === 'office') send(res, 'tasks', taskList(room));
  req.on('close', function () {
    if (room.clients.get(id) === res) {
      room.clients.delete(id);
      room.players.delete(id);
      broadcast(room, 'leave', { id: id });
    }
  });
}

function handleState(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    if (!id) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, b.scene));
    // Chỉ nhận trạng thái từ người đang mở kết nối SSE trong phòng.
    if (!room.clients.has(id)) return json(res, 409, { error: 'not connected' });
    const prev = room.players.get(id) || {};
    room.players.set(id, {
      id: id,
      name: cleanText(b.name, 24) || 'Phật tử',
      x: clampNum(b.x, 0, 2000, 600),
      y: clampNum(b.y, 0, 2000, 700),
      dir: b.dir === -1 ? -1 : 1,
      pose: POSES.indexOf(b.pose) >= 0 ? b.pose : 'stand',
      days: Math.floor(clampNum(b.days, 0, 100000, 0)),
      gender: b.gender === 'f' ? 'f' : 'm',
      food: typeof b.food === 'string' && /^[a-z]{1,12}$/.test(b.food) ? b.food : undefined,
      lotus: b.lotus === true,
      seen: Date.now(),
      lastChat: prev.lastChat || 0,
      lastBadmouth: prev.lastBadmouth || 0,
      lastTask: prev.lastTask || 0,
      lastSlap: prev.lastSlap || 0,
    });
    json(res, 200, { ok: true });
  });
}

function handleChat(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const text = b && cleanText(b.text, 120);
    if (!id || !text) return json(res, 400, { error: 'bad body' });
    const scene = cleanScene(b.scene);
    const room = getRoom(roomKeyFor(req, scene));
    const p = room.players.get(id);
    const now = Date.now();
    if (!p) return json(res, 409, { error: 'not connected' });
    if (now - p.lastChat < 800) return json(res, 429, { error: 'slow down' });
    p.lastChat = now;
    // Ở công sở được nói bậy; ở chùa thì chặn.
    if (scene === 'temple' && hasProfanity(text)) return json(res, 422, { error: 'profanity' });
    broadcast(room, 'chat', { id: id, text: text });
    json(res, 200, { ok: true });
  });
}

// Nói xấu đồng nghiệp (chỉ ở công sở): mọi người trong phòng thấy mặt người bị nói xấu hoá đen.
function handleBadmouth(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const target = b && cleanId(b.target);
    if (!id || !target || id === target) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'office'));
    const p = room.players.get(id);
    const now = Date.now();
    if (!p || !room.players.has(target)) return json(res, 409, { error: 'not connected' });
    if (now - p.lastBadmouth < 2000) return json(res, 429, { error: 'slow down' });
    p.lastBadmouth = now;
    broadcast(room, 'badmouth', { from: id, target: target });
    json(res, 200, { ok: true });
  });
}

// Tát đồng nghiệp (chỉ ở công sở): phải đứng gần; mọi người trong phòng thấy người bị tát.
const SLAP_RANGE = 160; // rộng hơn tầm ở client (90) vì vị trí trên server trễ một chút
function handleSlap(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const target = b && cleanId(b.target);
    if (!id || !target || id === target) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'office'));
    const p = room.players.get(id);
    const q = room.players.get(target);
    const now = Date.now();
    if (!p || !q) return json(res, 409, { error: 'not connected' });
    if (Math.hypot(p.x - q.x, p.y - q.y) > SLAP_RANGE) return json(res, 409, { error: 'too far' });
    if (now - p.lastSlap < 1500) return json(res, 429, { error: 'slow down' });
    p.lastSlap = now;
    broadcast(room, 'slap', { from: id, target: target });
    json(res, 200, { ok: true });
  });
}

// ---------- Giao task (chỉ ở công sở) ----------
// Task: { id, from, fromName, to, toName, text, status: 'todo' | 'review', redo, at }
function taskList(room) {
  return Array.from(room.tasks.values());
}

function handleTask(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const to = b && cleanId(b.to);
    const text = b && cleanText(b.text, 200);
    if (!id || !to || id === to || !text) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'office'));
    const p = room.players.get(id);
    const q = room.players.get(to);
    const now = Date.now();
    if (!p || !q) return json(res, 409, { error: 'not connected' });
    if (now - p.lastTask < 1000) return json(res, 429, { error: 'slow down' });
    if (room.tasks.size >= MAX_TASKS_PER_ROOM) return json(res, 503, { error: 'too many tasks' });
    p.lastTask = now;
    const tid = String(room.nextTaskId++);
    room.tasks.set(tid, { id: tid, from: id, fromName: p.name, to: to, toName: q.name, text: text, status: 'todo', redo: false, at: now });
    broadcast(room, 'tasks', taskList(room));
    json(res, 200, { ok: true });
  });
}

// Người nhận báo đã xong → chờ người giao duyệt.
function handleTaskDone(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const room = getRoom(roomKeyFor(req, 'office'));
    const t = b && room.tasks.get(String(b.task));
    if (!id || !t || t.to !== id || t.status !== 'todo') return json(res, 409, { error: 'bad task' });
    t.status = 'review';
    broadcast(room, 'tasks', taskList(room));
    json(res, 200, { ok: true });
  });
}

// Người giao duyệt: đồng ý → xoá task; không đồng ý → quay lại 'todo' (bắt làm lại).
function handleTaskReview(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const room = getRoom(roomKeyFor(req, 'office'));
    const t = b && room.tasks.get(String(b.task));
    if (!id || !t || t.from !== id || t.status !== 'review') return json(res, 409, { error: 'bad task' });
    if (b.ok === true) room.tasks.delete(t.id);
    else { t.status = 'todo'; t.redo = true; }
    broadcast(room, 'tasks', taskList(room));
    json(res, 200, { ok: true });
  });
}

function pipeFile(stream, res) {
  stream.on('error', function () { res.destroy(); });
  stream.pipe(res);
}

function serveStatic(req, res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (rel.indexOf('\0') !== -1) { res.writeHead(400); return res.end(); }
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (file.indexOf(PUBLIC_DIR + path.sep) !== 0) { res.writeHead(403); return res.end(); }
  fs.stat(file, function (err, st) {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    // Hỗ trợ Range để trình duyệt (đặc biệt iOS Safari) phát/loop audio được.
    const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if (range && (range[1] || range[2])) {
      let start, end;
      if (range[1]) {
        start = parseInt(range[1], 10);
        end = range[2] ? Math.min(parseInt(range[2], 10), st.size - 1) : st.size - 1;
      } else { // bytes=-N: N byte cuối
        start = Math.max(0, st.size - parseInt(range[2], 10));
        end = st.size - 1;
      }
      if (start > end || start >= st.size) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + st.size });
        return res.end();
      }
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + st.size,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
      });
      return pipeFile(fs.createReadStream(file, { start: start, end: end }), res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
    if (req.method === 'HEAD') return res.end();
    pipeFile(fs.createReadStream(file), res);
  });
}

const server = http.createServer(function (req, res) {
  try {
    route(req, res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
});

function route(req, res) {
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch (e) { res.writeHead(400); return res.end(); }
  if (url.pathname === '/api/events' && req.method === 'GET') return handleEvents(req, res, url);
  if (url.pathname === '/api/state' && req.method === 'POST') return handleState(req, res);
  if (url.pathname === '/api/chat' && req.method === 'POST') return handleChat(req, res);
  if (url.pathname === '/api/badmouth' && req.method === 'POST') return handleBadmouth(req, res);
  if (url.pathname === '/api/slap' && req.method === 'POST') return handleSlap(req, res);
  if (url.pathname === '/api/task' && req.method === 'POST') return handleTask(req, res);
  if (url.pathname === '/api/task/done' && req.method === 'POST') return handleTaskDone(req, res);
  if (url.pathname === '/api/task/review' && req.method === 'POST') return handleTaskReview(req, res);
  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(req, res, url);
  res.writeHead(405);
  res.end();
}

// Gửi snapshot phòng định kỳ + dọn người chơi treo.
setInterval(function () {
  const now = Date.now();
  rooms.forEach(function (room, key) {
    room.players.forEach(function (p, id) {
      if (now - p.seen > STALE_MS) room.players.delete(id);
    });
    room.tasks.forEach(function (t, tid) {
      if (now - t.at > TASK_TTL_MS) room.tasks.delete(tid);
    });
    if (room.clients.size === 0 && room.players.size === 0 && room.tasks.size === 0) { rooms.delete(key); return; }
    const list = [];
    room.players.forEach(function (p) {
      list.push({ id: p.id, name: p.name, x: p.x, y: p.y, dir: p.dir, pose: p.pose, days: p.days, gender: p.gender, food: p.food, lotus: p.lotus });
    });
    const msg = 'event: snapshot\ndata: ' + JSON.stringify(list) + '\n\n';
    if (msg === room.lastSnapshot && now - room.lastSnapshotAt < 2000) return;
    room.lastSnapshot = msg;
    room.lastSnapshotAt = now;
    room.clients.forEach(function (res) { res.write(msg); });
  });
}, TICK_MS);

// Giữ kết nối SSE sống qua proxy.
setInterval(function () {
  rooms.forEach(function (room) {
    room.clients.forEach(function (res) { res.write(': ping\n\n'); });
  });
}, 20000);

server.listen(PORT, function () {
  console.log('Khẩu Xà Tâm Phật đang chạy tại http://localhost:' + PORT);
});
