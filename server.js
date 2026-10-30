// Khẩu Xà Tâm Phật — server tĩnh + đồng bộ realtime theo "mạng" (cùng IP public / cùng LAN).
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

// Mọi IP nội bộ (LAN / localhost) gom chung một phòng, IP public thì mỗi IP một phòng.
function roomKeyFor(req) {
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
    room = { players: new Map(), clients: new Map() };
    rooms.set(key, room);
  }
  return room;
}

const POSES = ['stand', 'walk', 'sit', 'kneel', 'bow'];

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
  const key = roomKeyFor(req);
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
    const room = getRoom(roomKeyFor(req));
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
      seen: Date.now(),
      lastChat: prev.lastChat || 0,
    });
    json(res, 200, { ok: true });
  });
}

function handleChat(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const text = b && cleanText(b.text, 120);
    if (!id || !text) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req));
    const p = room.players.get(id);
    const now = Date.now();
    if (!p) return json(res, 409, { error: 'not connected' });
    if (now - p.lastChat < 800) return json(res, 429, { error: 'slow down' });
    p.lastChat = now;
    if (hasProfanity(text)) return json(res, 422, { error: 'profanity' });
    broadcast(room, 'chat', { id: id, text: text });
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
    if (room.clients.size === 0 && room.players.size === 0) { rooms.delete(key); return; }
    const list = [];
    room.players.forEach(function (p) {
      list.push({ id: p.id, name: p.name, x: p.x, y: p.y, dir: p.dir, pose: p.pose, days: p.days });
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
