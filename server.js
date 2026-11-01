// Khẩu Xà Tâm Phật — server tĩnh + đồng bộ realtime; mọi người chung một chùa, một văn phòng, một nhà hàng.
// Không phụ thuộc thư viện ngoài: Server-Sent Events cho chiều xuống, POST JSON cho chiều lên.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const hasProfanity = require('./public/profanity.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const STALE_MS = 15000;
const TICK_MS = 100;
const MAX_BODY = 4096;
const MAX_PER_ROOM = 60;                   // mỗi khu (chùa / công ty / nhà hàng) tối đa 60 người
const MAX_TASKS_PER_ROOM = 300;
const TASK_TTL_MS = 24 * 60 * 60 * 1000; // task cũ hơn 1 ngày tự xoá
const BOSS_WALK_MS = 20000;                // sếp đi ngang văn phòng trong 20 giây
const BOSS_GAP_MS = [45000, 90000];        // nghỉ 45–90 giây giữa hai lần đi tuần
const OFFERING_TTL_MS = 30 * 1000;         // lễ vật trên bàn thờ giữ 30 giây
const MAX_OFFERINGS = 12;
const OFFERING_IDS = ['nen', 'tra', 'hoa', 'den', 'qua'];
const RACK_SIZE = 60;                      // kệ dép ngoài cửa chùa
const SHOE_IDS = ['deptoong', 'depda', 'haivang'];
// Nhà hàng: món trong menu (giá tính ở client, trả bằng lương), 2 bàn ăn.
const MENU_IDS = ['comtrang', 'trungran', 'raumuong', 'dauphu', 'nemran', 'canhchua', 'thitkho', 'cakho', 'suonxao', 'galuoc', 'bunhen', 'lauriebo', 'laurieubau', 'banhxeo', 'lauthai', 'nomchanvit', 'banhtrang', 'sushi', 'vangdau'];
const REST_TABLES = [{ x: 420, y: 720 }, { x: 980, y: 720 }];
const DISH_PREP_MS = 4000;                 // phục vụ mang món ra trong 4 giây
const MAX_DISHES_PER_TABLE = 10;         // tối đa 10 món một bàn (được gọi trùng món)

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

// Chỉ có hai cảnh: chùa (mặc định) và công sở.
function cleanScene(s) {
  return s === 'office' || s === 'restaurant' ? s : 'temple';
}

// Mọi người (ở mạng nào cũng vậy) chung một chùa và một văn phòng.
function roomKeyFor(req, scene) {
  return 'all|' + cleanScene(scene);
}

function getRoom(key) {
  let room = rooms.get(key);
  if (!room) {
    room = { players: new Map(), clients: new Map(), tasks: new Map(), nextTaskId: 1, offerings: [], reviews: new Map(),
      rack: new Array(RACK_SIZE).fill(null), dishes: [], nextDishId: 1 };
    rooms.set(key, room);
  }
  return room;
}

const POSES = ['stand', 'walk', 'sit', 'kneel', 'bow', 'eat', 'sleep', 'drink', 'bbq'];
const ITEM_ID = /^[a-z]{1,12}$/;

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
  if (cleanScene(url.searchParams.get('scene')) === 'office') {
    send(res, 'tasks', taskList(room));
    send(res, 'reviews', reviewsFor(room, id));
    if (bossActive(room, Date.now())) send(res, 'boss', { elapsed: Date.now() - room.boss.start, dur: room.boss.dur });
  } else if (cleanScene(url.searchParams.get('scene')) === 'restaurant') {
    send(res, 'dishes', dishView(room));
  } else {
    send(res, 'offerings', room.offerings);
    send(res, 'rack', room.rack);
  }
  req.on('close', function () {
    if (room.clients.get(id) === res) {
      room.clients.delete(id);
      room.players.delete(id);
      broadcast(room, 'leave', { id: id });
      const slot = room.rack.findIndex(function (s) { return s && s.owner === id; });
      if (slot >= 0) {
        room.rack[slot] = null;
        broadcast(room, 'rack', room.rack);
      }
      const kept = room.dishes.filter(function (d) { return d.buyer !== id; });
      if (kept.length !== room.dishes.length) {
        room.dishes = kept;
        broadcast(room, 'dishes', dishView(room));
      }
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
      stress: Math.round(clampNum(b.stress, 0, 100, 0)),
      caught: b.caught === true,
      heating: b.heating === true,
      face: ['d', 'u', 'l', 'r'].indexOf(b.face) >= 0 ? b.face : 'd', // hướng mặt: xuống/lên/trái/phải
      grill: typeof b.grill === 'string' && ITEM_ID.test(b.grill) ? b.grill : undefined, // xiên đang nướng trên bếp BBQ
      wear: Array.isArray(b.wear) ? b.wear.filter(function (s) { return typeof s === 'string' && ITEM_ID.test(s); }).slice(0, 8) : [],
      seen: Date.now(),
      lastChat: prev.lastChat || 0,
      lastBadmouth: prev.lastBadmouth || 0,
      lastTask: prev.lastTask || 0,
      lastSlap: prev.lastSlap || 0,
      lastGift: prev.lastGift || 0,
      lastOffer: prev.lastOffer || 0,
      lastReview: prev.lastReview || 0,
      stoleDay: prev.stoleDay || '',
      lastOrder: prev.lastOrder || 0,
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

// Tặng vật phẩm cho người đang online cùng phòng (túi đồ lưu ở máy mỗi người; server chỉ chuyển quà).
function handleGift(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const target = b && cleanId(b.target);
    const item = b && typeof b.item === 'string' && ITEM_ID.test(b.item) ? b.item : null;
    if (!id || !target || id === target || !item) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, b.scene));
    const p = room.players.get(id);
    const tres = room.clients.get(target);
    const now = Date.now();
    if (!p || !tres || !room.players.has(target)) return json(res, 409, { error: 'not connected' });
    if (now - (p.lastGift || 0) < 800) return json(res, 429, { error: 'slow down' });
    p.lastGift = now;
    send(tres, 'gift', { from: id, item: item });
    json(res, 200, { ok: true });
  });
}

// ---------- Sếp đi tuần (công sở) ----------
function bossActive(room, now) {
  return room.boss && now < room.boss.start + room.boss.dur;
}
function tickBoss(room, now) {
  if (room.clients.size === 0 || bossActive(room, now)) return;
  if (!room.nextBossAt) {
    room.nextBossAt = now + BOSS_GAP_MS[0] + Math.random() * (BOSS_GAP_MS[1] - BOSS_GAP_MS[0]);
  } else if (now >= room.nextBossAt) {
    room.boss = { start: now, dur: BOSS_WALK_MS };
    room.nextBossAt = 0;
    broadcast(room, 'boss', { elapsed: 0, dur: BOSS_WALK_MS });
  }
}

// ---------- Dâng lễ vật lên bàn thờ (chùa) ----------
function handleOffer(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const item = b && OFFERING_IDS.indexOf(b.item) >= 0 ? b.item : null;
    if (!id || !item) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'temple'));
    const p = room.players.get(id);
    const now = Date.now();
    if (!p) return json(res, 409, { error: 'not connected' });
    if (now - p.lastOffer < 1500) return json(res, 429, { error: 'slow down' });
    p.lastOffer = now;
    room.offerings.push({ item: item, by: p.name, at: now });
    if (room.offerings.length > MAX_OFFERINGS) room.offerings.shift();
    broadcast(room, 'offerings', room.offerings);
    json(res, 200, { ok: true });
  });
}

// ---------- Số người mỗi khu (để báo "đã kín người") ----------
function handleRoomInfo(req, res, url) {
  const room = rooms.get(roomKeyFor(req, url.searchParams.get('scene')));
  const count = room ? room.clients.size : 0;
  json(res, 200, { count: count, max: MAX_PER_ROOM, full: count >= MAX_PER_ROOM });
}

// ---------- Nhà hàng: gọi món / ăn ----------
// Món nằm trên bàn của người gọi; biến mất khi có người ăn hoặc người gọi rời nhà hàng.
function dishView(room) {
  const now = Date.now();
  return room.dishes.map(function (d) {
    return { id: d.id, dish: d.dish, table: d.table, buyer: d.buyer, buyerName: d.buyerName, age: now - d.at, prep: DISH_PREP_MS };
  });
}
function atTable(p, table) {
  const t = REST_TABLES[table];
  return t && Math.hypot(p.x - t.x, p.y - t.y) < 180;
}
function handleOrder(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const dish = b && MENU_IDS.indexOf(b.dish) >= 0 ? b.dish : null;
    const table = b && Number(b.table);
    if (!id || !dish || !(table === 0 || table === 1)) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'restaurant'));
    const p = room.players.get(id);
    const now = Date.now();
    if (!p) return json(res, 409, { error: 'not connected' });
    if (!atTable(p, table)) return json(res, 409, { error: 'not at table' });
    if (now - p.lastOrder < 1000) return json(res, 429, { error: 'slow down' });
    if (room.dishes.filter(function (d) { return d.table === table; }).length >= MAX_DISHES_PER_TABLE) return json(res, 409, { error: 'table full' });
    p.lastOrder = now;
    room.dishes.push({ id: String(room.nextDishId++), dish: dish, table: table, buyer: id, buyerName: p.name, at: now });
    broadcast(room, 'dishes', dishView(room));
    json(res, 200, { ok: true });
  });
}
function handleEat(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    if (!id) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'restaurant'));
    const p = room.players.get(id);
    const i = room.dishes.findIndex(function (d) { return d.id === String(b.dish); });
    const d = room.dishes[i];
    if (!p || !d) return json(res, 409, { error: 'gone' });
    if (!atTable(p, d.table)) return json(res, 409, { error: 'not at table' });
    if (Date.now() - d.at < DISH_PREP_MS) return json(res, 409, { error: 'not ready' });
    room.dishes.splice(i, 1);
    broadcast(room, 'dishes', dishView(room));
    json(res, 200, { ok: true, dish: d.dish });
  });
}

// ---------- Kệ dép ngoài cửa chùa ----------
// Ai đang trong chùa thì có một ô dép; lấy dép người khác mỗi ngày một lần.
// Lấy dép = đổi dép → ai cũng còn dép. Người lấy đã để dép trên kệ thì hai ô đổi dép cho nhau;
// chưa để thì chỉ ô bị lấy đổi sang đôi người lấy đang mang (client gửi lên), còn người lấy đổi trong túi đồ.
function handleShoePlace(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const slot = b && Number(b.slot);
    const shoe = b && SHOE_IDS.indexOf(b.shoe) >= 0 ? b.shoe : null;
    if (!id || !shoe || !(slot >= 0 && slot < RACK_SIZE && slot % 1 === 0)) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'temple'));
    const p = room.players.get(id);
    if (!p) return json(res, 409, { error: 'not connected' });
    if (room.rack.some(function (s) { return s && s.owner === id; })) return json(res, 409, { error: 'already placed' });
    if (room.rack[slot]) return json(res, 409, { error: 'slot taken' });
    room.rack[slot] = { owner: id, name: p.name, shoe: shoe };
    broadcast(room, 'rack', room.rack);
    json(res, 200, { ok: true });
  });
}

// Đổi đôi dép đang để trên kệ (vd. vừa mua đôi xịn hơn).
function handleShoeWear(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const shoe = b && SHOE_IDS.indexOf(b.shoe) >= 0 ? b.shoe : null;
    if (!id || !shoe) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'temple'));
    const slot = room.rack.findIndex(function (s) { return s && s.owner === id; });
    if (slot < 0) return json(res, 409, { error: 'not on rack' });
    room.rack[slot].shoe = shoe;
    broadcast(room, 'rack', room.rack);
    json(res, 200, { ok: true });
  });
}

function handleShoeSteal(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const slot = b && Number(b.slot);
    if (!id || !(slot >= 0 && slot < RACK_SIZE)) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'temple'));
    const p = room.players.get(id);
    const s = room.rack[slot];
    if (!p || !s || s.owner === id) return json(res, 409, { error: 'bad slot' });
    const mine = room.rack.findIndex(function (x) { return x && x.owner === id; });
    const carried = SHOE_IDS.indexOf(b.gave) >= 0 ? b.gave : null;
    if (mine < 0 && !carried) return json(res, 400, { error: 'no shoes' });
    const day = new Date().toISOString().slice(0, 10);
    if (p.stoleDay === day) return json(res, 429, { error: 'once a day' });
    p.stoleDay = day;
    const stolen = s.shoe;
    const gave = mine >= 0 ? room.rack[mine].shoe : carried;
    if (mine >= 0) room.rack[mine].shoe = stolen;
    s.shoe = gave;
    const vres = room.clients.get(s.owner);
    if (vres) send(vres, 'shoe-stolen', { shoe: stolen, got: gave }); // không lộ ai đã lấy
    broadcast(room, 'rack', room.rack);
    json(res, 200, { ok: true, shoe: stolen, gave: gave });
  });
}

// ---------- Review đồng nghiệp (công sở) ----------
// Mỗi người review một đồng nghiệp một lần (viết lại thì thay bản cũ). Người được review nhận danh sách của mình.
function reviewsFor(room, to) {
  const out = [];
  room.reviews.forEach(function (r) { if (r.to === to) out.push(r); });
  return out.sort(function (a, b) { return b.at - a.at; });
}
function handleReview(req, res) {
  readJson(req, function (b) {
    const id = b && cleanId(b.id);
    const to = b && cleanId(b.to);
    const stars = b && Math.round(Number(b.stars));
    const text = b && cleanText(b.text, 200);
    if (!id || !to || id === to || !(stars >= 1 && stars <= 5)) return json(res, 400, { error: 'bad body' });
    const room = getRoom(roomKeyFor(req, 'office'));
    const p = room.players.get(id);
    const now = Date.now();
    if (!p || !room.players.has(to)) return json(res, 409, { error: 'not connected' });
    if (now - p.lastReview < 2000) return json(res, 429, { error: 'slow down' });
    p.lastReview = now;
    room.reviews.set(id + '>' + to, { from: id, fromName: p.name, to: to, stars: stars, text: text, at: now });
    const tres = room.clients.get(to);
    if (tres) send(tres, 'reviews', reviewsFor(room, to));
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

// Làm rối game.js khi chạy thật (đặt OBFUSCATE=1, vd. trên Render): đổi tên biến, mã hoá chuỗi,
// để người chơi khó đọc code mà tự giải mã két dữ liệu. Chạy ở máy (không đặt biến) vẫn dùng code gốc.
let obfuscatedGame = null;
if (process.env.OBFUSCATE === '1') {
  try {
    const started = Date.now();
    const JavaScriptObfuscator = require('javascript-obfuscator');
    const src = fs.readFileSync(path.join(PUBLIC_DIR, 'game.js'), 'utf8');
    obfuscatedGame = JavaScriptObfuscator.obfuscate(src, {
      compact: true,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 1,          // mã hoá mọi chuỗi (tên khoá, chuỗi bí mật…)
      splitStrings: true,
      splitStringsChunkLength: 6,
      transformObjectKeys: true,        // mã hoá cả tên thuộc tính (vd. bảng giới hạn trần)
      controlFlowFlattening: false, // giữ game mượt
      deadCodeInjection: false,
      selfDefending: false,
    }).getObfuscatedCode();
    console.log('Đã làm rối game.js (' + (Date.now() - started) + 'ms)');
  } catch (e) {
    console.error('Không làm rối được game.js, dùng bản gốc:', e.message);
  }
}

function serveStatic(req, res, url) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (rel.indexOf('\0') !== -1) { res.writeHead(400); return res.end(); }
  if (rel === '/') rel = '/index.html';
  if (rel === '/game.js' && obfuscatedGame) {
    res.writeHead(200, { 'Content-Type': MIME['.js'], 'Content-Length': Buffer.byteLength(obfuscatedGame) });
    return res.end(req.method === 'HEAD' ? undefined : obfuscatedGame);
  }
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
  if (url.pathname === '/api/room' && req.method === 'GET') return handleRoomInfo(req, res, url);
  if (url.pathname === '/api/rest/order' && req.method === 'POST') return handleOrder(req, res);
  if (url.pathname === '/api/rest/eat' && req.method === 'POST') return handleEat(req, res);
  if (url.pathname === '/api/state' && req.method === 'POST') return handleState(req, res);
  if (url.pathname === '/api/chat' && req.method === 'POST') return handleChat(req, res);
  if (url.pathname === '/api/badmouth' && req.method === 'POST') return handleBadmouth(req, res);
  if (url.pathname === '/api/slap' && req.method === 'POST') return handleSlap(req, res);
  if (url.pathname === '/api/gift' && req.method === 'POST') return handleGift(req, res);
  if (url.pathname === '/api/offer' && req.method === 'POST') return handleOffer(req, res);
  if (url.pathname === '/api/review' && req.method === 'POST') return handleReview(req, res);
  if (url.pathname === '/api/shoes/place' && req.method === 'POST') return handleShoePlace(req, res);
  if (url.pathname === '/api/shoes/steal' && req.method === 'POST') return handleShoeSteal(req, res);
  if (url.pathname === '/api/shoes/wear' && req.method === 'POST') return handleShoeWear(req, res);
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
    if (key.slice(-7) === '|office') tickBoss(room, now);
    const kept = room.offerings.filter(function (o) { return now - o.at < OFFERING_TTL_MS; });
    if (kept.length !== room.offerings.length) {
      room.offerings = kept;
      broadcast(room, 'offerings', kept);
    }
    room.reviews.forEach(function (r, rid) {
      if (now - r.at > TASK_TTL_MS) room.reviews.delete(rid);
    });
    if (room.clients.size === 0 && room.players.size === 0 && room.tasks.size === 0 && room.reviews.size === 0) { rooms.delete(key); return; }
    const list = [];
    room.players.forEach(function (p) {
      list.push({ id: p.id, name: p.name, x: p.x, y: p.y, dir: p.dir, pose: p.pose, days: p.days, gender: p.gender, food: p.food, lotus: p.lotus, wear: p.wear, stress: p.stress, caught: p.caught, heating: p.heating, grill: p.grill, face: p.face });
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
