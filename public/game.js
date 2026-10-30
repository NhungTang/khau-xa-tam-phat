(function () {
  'use strict';

  // ---------- Hằng số thế giới ----------
  const W = 1400;
  const H = 1000;
  const FLOOR_TOP = 430;
  const BOUNDS = { minX: 40, maxX: W - 40, minY: 465, maxY: H - 25 };
  const SPEED = 190;
  const BODY_R = 12;
  const CHAT_MS = 10000;
  const DEFAULT_NAME = 'Phật tử';
  const PILLARS = [
    { x: 230, y: 520 }, { x: 1170, y: 520 },
    { x: 230, y: 860 }, { x: 1170, y: 860 },
  ];
  const URN = { x: 700, y: 500 };
  // Tượng Phật: thu nhỏ quanh chân đài sen; đỉnh (vòng hào quang, y=64 gốc) sau khi thu nhỏ.
  const STATUE_BASE = 362;
  const STATUE_SCALE = 0.8;
  const STATUE_TOP = STATUE_BASE - (STATUE_BASE - 64) * STATUE_SCALE;
  const OBSTACLES = PILLARS.map(function (p) { return { x: p.x, y: p.y - 6, r: 30 }; })
    .concat([{ x: URN.x, y: URN.y - 6, r: 38 }]);
  const EAT_MS = 10000;
  const LOTUS_MS = 10000; // hoa sen trên đầu sau khi chép kinh xong
  const FOODS = [
    { id: 'com', emoji: '🍚', name: 'Cơm chay' },
    { id: 'pho', emoji: '🍜', name: 'Phở chay' },
    { id: 'xoi', emoji: '🍙', name: 'Xôi' },
    { id: 'banhbao', emoji: '🥟', name: 'Bánh bao chay' },
    { id: 'chuoi', emoji: '🍌', name: 'Chuối' },
    { id: 'cam', emoji: '🍊', name: 'Cam' },
    { id: 'dao', emoji: '🍑', name: 'Đào tiên' },
    { id: 'tra', emoji: '🍵', name: 'Trà sen' },
  ];
  // Vật phẩm đổi bằng điểm chép kinh; mỗi "slot" chỉ mặc được một món.
  const ITEMS = [
    // áo
    { id: 'casa', emoji: '👘', name: 'Áo cà sa', price: 10, slot: 'robe' },
    { id: 'robebrown', emoji: '🟫', name: 'Áo nâu', price: 6, slot: 'robe' },
    { id: 'robewhite', emoji: '⚪', name: 'Áo tràng trắng', price: 6, slot: 'robe' },
    // cổ
    { id: 'beads', emoji: '📿', name: 'Chuỗi hạt', price: 3, slot: 'neck' },
    { id: 'garland', emoji: '🌼', name: 'Vòng hoa cúc', price: 4, slot: 'neck' },
    // đầu
    { id: 'hat', emoji: '🟤', name: 'Mũ ni', price: 5, slot: 'head' },
    { id: 'nonla', emoji: '👒', name: 'Nón lá', price: 5, slot: 'head' },
    { id: 'flower', emoji: '🌸', name: 'Hoa cài đầu', price: 3, slot: 'head' },
    // tay
    { id: 'staff', emoji: '🦯', name: 'Tích trượng', price: 8, slot: 'hand' },
    { id: 'lantern', emoji: '🏮', name: 'Đèn lồng', price: 6, slot: 'hand' },
    { id: 'candle', emoji: '🕯️', name: 'Nến', price: 3, slot: 'hand' },
    { id: 'bell', emoji: '🔔', name: 'Chuông', price: 6, slot: 'hand' },
    { id: 'book', emoji: '📖', name: 'Kinh sách', price: 4, slot: 'hand' },
    // lưng
    { id: 'bag', emoji: '🎒', name: 'Tay nải', price: 4, slot: 'back' },
    // hào quang
    { id: 'halo', emoji: '✨', name: 'Hào quang', price: 20, slot: 'aura' },
    { id: 'rainbow', emoji: '🌈', name: 'Cầu vồng', price: 25, slot: 'aura' },
    // bạn đồng hành
    { id: 'cat', emoji: '🐈', name: 'Mèo chùa', price: 12, slot: 'pet' },
    { id: 'bird', emoji: '🐦', name: 'Chim sẻ', price: 8, slot: 'pet' },
  ];
  // Màu áo [chính, viền, chữ số điểm] theo áo đang mặc.
  const ROBE_STYLES = {
    casa: ['#d98a1c', '#a8620f', '#ffffff'],
    robebrown: ['#7a4a24', '#5a3418', '#ffffff'],
    robewhite: ['#eeeae0', '#b9b2a0', '#5a4a3a'],
  };
  const ITEM_BY_ID = new Map(ITEMS.map(function (it) { return [it.id, it]; }));
  const CUSHIONS = [];
  [600, 700].forEach(function (y) {
    [520, 610, 790, 880].forEach(function (x) { CUSHIONS.push({ x: x, y: y }); });
  });

  // ---------- Công sở ----------
  const DEFAULT_OFFICE_NAME = 'Nhân viên';
  const BADMOUTH_MS = 10000;     // mặt người bị nói xấu đen trong 10 giây
  const REPENT_DELAY_MS = 10000;
  const SLAP_RANGE = 90;         // phải đứng gần mới tát được
  const AISLE_Y = 700;           // lối đi giữa hai dãy bàn — đường sếp đi tuần
  const CAUGHT_MS = 3000;        // chữ "BỊ BẮT!" hiện 3 giây
  // Lễ vật mua bằng lương (đơn vị: nghìn đồng), dâng lên bàn thờ ở chùa.
  const OFFERINGS = [
    { id: 'nen', emoji: '🕯️', name: 'Nến', price: 2 },
    { id: 'tra', emoji: '🍵', name: 'Trà', price: 3 },
    { id: 'hoa', emoji: '🌺', name: 'Hoa', price: 5 },
    { id: 'den', emoji: '🪔', name: 'Đèn dầu', price: 6 },
    { id: 'qua', emoji: '🍊', name: 'Mâm quả', price: 8 },
  ];
  const OFFERING_SLOTS = [700, 664, 736, 628, 772, 592, 808, 556, 844, 520, 880, 484]; // 10 giây sau khi nói xấu / nói bậy → nhắc đi chùa sám hối
  const DESKS = [];
  [580, 820].forEach(function (y) {
    [220, 470, 720].forEach(function (x) { DESKS.push({ x: x, y: y }); });
  });
  const CHAIRS = DESKS.map(function (d) { return { x: d.x, y: d.y + 48 }; });
  const PLANTS = [{ x: 70, y: 490 }, { x: 850, y: 960 }];
  // Pantry (phải trên) và phòng họp (phải dưới), ngăn với khu làm việc ở x = 900.
  const ZONE_X = 900;
  const PANTRY = { x0: ZONE_X, y1: 650 };
  const MEET = { x0: ZONE_X, y0: 760 };
  const ROUND_TABLE = { x: 1150, y: 575 };
  const MEET_TABLE = { x: 1150, y: 880 };
  const MEET_CHAIRS = [];
  [1050, 1120, 1190, 1260].forEach(function (x) { MEET_CHAIRS.push({ x: x, y: 822 }, { x: x, y: 955 }); });
  const ALL_CHAIRS = CHAIRS.concat(MEET_CHAIRS); // ngồi các ghế này = đang làm việc
  const OFFICE_OBSTACLES = PLANTS.map(function (p) { return { x: p.x, y: p.y - 6, r: 22 }; });
  DESKS.forEach(function (d) {
    OFFICE_OBSTACLES.push({ x: d.x - 50, y: d.y - 20, r: 34 }, { x: d.x + 50, y: d.y - 20, r: 34 });
  });
  for (let x = 980; x <= 1300; x += 40) OFFICE_OBSTACLES.push({ x: x, y: 470, r: 24 }); // quầy pantry
  OFFICE_OBSTACLES.push({ x: ROUND_TABLE.x, y: ROUND_TABLE.y - 6, r: 42 });
  [1030, 1090, 1150, 1210, 1270].forEach(function (x) { OFFICE_OBSTACLES.push({ x: x, y: MEET_TABLE.y, r: 42 }); });
  const DRINKS = [{ id: 'cafe', emoji: '☕', name: 'Cà phê' }];

  // ---------- Lưu trữ local ----------
  const store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } },
  };
  const K = {
    name: 'kxtp_name',
    days: 'kxtp_days', // điểm chép kinh (trước đây là số ngày — giữ khoá cũ để không mất điểm)
    copies: 'kxtp_copies',
    inv: 'kxtp_inv',
    worn: 'kxtp_worn',
    stress: 'kxtp_stress',
    salary: 'kxtp_salary',
    draft: 'kxtp_draft',
    music: 'kxtp_music',
    officeName: 'kxtp_office_name',
    gender: 'kxtp_gender',
  };

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  // Bài gợi ý khi mở chép kinh: xoay vòng theo ngày và số bài đã chép hôm nay.
  function todaySutraIndex() {
    const d = new Date();
    const dayNo = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return (dayNo + copiesToday()) % window.SUTRAS.length;
  }
  function copiesToday() {
    let c = null;
    try { c = JSON.parse(store.get(K.copies) || 'null'); } catch (e) { /* bỏ qua */ }
    return c && c.date === todayStr() ? c.n : 0;
  }
  function doneToday() { return copiesToday() > 0; }
  function getPoints() { return parseInt(store.get(K.days), 10) || 0; }  function loadJson(k) {
    try { const v = JSON.parse(store.get(k) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; }
  }
  const inv = loadJson(K.inv);   // itemId → số lượng
  const worn = loadJson(K.worn); // slot → itemId
  Object.keys(inv).forEach(function (id) { if (!ITEM_BY_ID.has(id) || !(inv[id] > 0)) delete inv[id]; });
  Object.keys(worn).forEach(function (s) { if (!inv[worn[s]]) delete worn[s]; });

  // ---------- Trạng thái ----------
  const me = {
    id: Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8),
    name: DEFAULT_NAME,
    x: 700, y: 840, dir: 1,
    pose: 'stand',
    gender: store.get(K.gender) === 'f' ? 'f' : 'm',
    days: getPoints(),
    wear: Object.values(worn),
    stress: Math.min(100, Math.max(0, parseInt(store.get(K.stress), 10) || 0)),
    salary: Math.max(0, parseInt(store.get(K.salary), 10) || 0),
    caughtUntil: 0,
    target: null,
  };
  const others = new Map();
  const bubbles = new Map();
  const keys = new Set();
  const blackFaces = new Map(); // id → thời điểm hết mặt đen
  const slaps = new Map();      // id → thời điểm bị tát
  let tasks = [];               // task trong văn phòng (server gửi xuống)
  let boss = null;              // { start, dur } — sếp đang đi tuần
  let bossCaughtMe = false;     // mỗi lượt đi tuần chỉ bắt một lần
  let offerings = [];           // lễ vật trên bàn thờ (server gửi xuống)
  let started = false;
  let scene = 'temple'; // 'temple' | 'office'
  let templeName = DEFAULT_NAME;
  let officeName = DEFAULT_OFFICE_NAME;

  // ---------- DOM ----------
  const $ = function (id) { return document.getElementById(id); };
  const canvas = $('scene');
  const ctx = canvas.getContext('2d');
  const bgm = $('bgm');

  // ---------- Màn chào / tên ----------
  const nameInput = $('name-input');
  nameInput.value = store.get(K.name) || '';
  document.querySelector('input[name="gender"][value="' + me.gender + '"]').checked = true;
  setTimeout(function () { nameInput.focus(); }, 50);

  $('name-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const typed = nameInput.value.trim().slice(0, 24);
    if (typed) store.set(K.name, typed);
    else store.del(K.name);
    me.name = typed || DEFAULT_NAME;
    templeName = me.name;
    $('welcome').classList.add('hidden');
    $('topbar').classList.remove('hidden');
    $('bottombar').classList.remove('hidden');
    started = true;
    updateSutraBadge();
    updatePointsUI();
    updateStatsUI();
    setPose('stand');
    if (store.get(K.music) !== 'off') { synth.unlock(); startMusic(); }
    updateMusicBtn();
    connect();
    nameInput.blur();
  });

  // ---------- Điều khiển ----------
  function typing() {
    const a = document.activeElement;
    return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
  }
  function overlayOpen() {
    return !!document.querySelector('.overlay:not(.hidden)');
  }

  window.addEventListener('keydown', function (e) {
    if (!started || overlayOpen()) return;
    if (typing()) {
      if (e.key === 'Escape') document.activeElement.blur();
      return;
    }
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].indexOf(k) >= 0) {
      keys.add(k);
      me.target = null;
      e.preventDefault();
    } else if (k === 'enter') {
      $('chat-input').focus();
      e.preventDefault();
    } else if (k === '2') setPose('sit');
    else if (k === '3' && scene === 'temple') setPose('kneel');
    else if (k === '4' && scene === 'temple') setPose('bow');
    else if (k === '5' && scene === 'temple') openFood();
  });
  window.addEventListener('keyup', function (e) { keys.delete(e.key.toLowerCase()); });
  window.addEventListener('blur', function () { keys.clear(); });

  canvas.addEventListener('pointerdown', function (e) {
    if (!started) return;
    if (typing()) document.activeElement.blur();
    const rect = canvas.getBoundingClientRect();
    const p = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    if (p.y < FLOOR_TOP) return;
    me.target = { x: clamp(p.x, BOUNDS.minX, BOUNDS.maxX), y: clamp(p.y, BOUNDS.minY, BOUNDS.maxY) };
  });

  document.querySelectorAll('[data-pose]').forEach(function (b) {
    b.addEventListener('click', function () { setPose(b.getAttribute('data-pose')); });
  });

  function setPose(pose) {
    if (pose === 'sit' && scene === 'office') {
      let best = null, bestD = 70;
      ALL_CHAIRS.forEach(function (ch) {
        const d = Math.hypot(me.x - ch.x, me.y - ch.y);
        if (d < bestD) { best = ch; bestD = d; }
      });
      if (best) { me.x = best.x; me.y = best.y + 2; }
    }
    me.pose = pose;
    me.target = null;
    me.poseStart = performance.now();
    document.querySelectorAll('[data-pose]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-pose') === pose);
    });
    $('btn-eat').classList.toggle('active', pose === 'eat');
    $('btn-sleep').classList.toggle('active', pose === 'sleep');
  }

  // ---------- Thọ trai ----------
  FOODS.forEach(function (f) {
    const b = document.createElement('button');
    b.innerHTML = '<span class="emoji"></span><span></span>';
    b.firstChild.textContent = f.emoji;
    b.lastChild.textContent = f.name;
    b.addEventListener('click', function () {
      $('food').classList.add('hidden');
      me.food = f.id;
      me.eatUntil = Date.now() + EAT_MS;
      setPose('eat');
    });
    $('food-list').appendChild(b);
  });
  function openFood() { $('food').classList.remove('hidden'); }
  $('btn-eat').addEventListener('click', openFood);
  $('food-close').addEventListener('click', function () { $('food').classList.add('hidden'); });

  // ---------- Chat ----------
  $('chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const input = $('chat-input');
    const text = input.value.trim().slice(0, 120);
    if (!text) return;
    if (scene === 'temple' && window.hasProfanity(text)) {
      penalize();
      toast('Lời nói chưa thanh tịnh — bị trừ 1 điểm. Tin nhắn chưa được gửi.', 6000);
      return;
    }
    input.value = '';
    bubbles.set(me.id, { text: text, until: Date.now() + CHAT_MS });
    post('/api/chat', { id: me.id, text: text, scene: scene });
    if (scene === 'office' && window.hasProfanity(text)) scheduleRepent();
  });

  let toastTimer = 0;
  function toast(msg, ms) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.add('hidden'); }, ms || 4000);
  }

  // ---------- Mạng (SSE + POST) ----------
  const online = location.protocol === 'http:' || location.protocol === 'https:';
  let lastSent = '';
  let lastSentAt = 0;
  let inFlight = false;

  let connected = false;

  function post(url, body) {
    if (!online) return Promise.resolve();
    const ctrl = window.AbortController ? new AbortController() : null;
    const timer = ctrl && setTimeout(function () { ctrl.abort(); }, 5000);
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined,
    }).catch(function () { /* mất mạng tạm thời */ })
      .then(function (r) { if (timer) clearTimeout(timer); return r; });
  }

  let es = null;
  function connect() {
    if (!online || !window.EventSource) return;
    es = new EventSource('/api/events?id=' + encodeURIComponent(me.id) + '&scene=' + scene);
    es.addEventListener('snapshot', function (ev) {
      const list = JSON.parse(ev.data);
      const seen = new Set();
      list.forEach(function (p) {
        if (p.id === me.id) return;
        seen.add(p.id);
        const o = others.get(p.id);
        if (o) Object.assign(o, p);
        else others.set(p.id, Object.assign({ rx: p.x, ry: p.y, seed: hash(p.id) }, p));
      });
      others.forEach(function (_, id) { if (!seen.has(id)) others.delete(id); });
      $('online-count').textContent = others.size + 1;
    });
    es.addEventListener('chat', function (ev) {
      const c = JSON.parse(ev.data);
      if (c.id === me.id) return;
      bubbles.set(c.id, { text: c.text, until: Date.now() + CHAT_MS });
    });
    es.addEventListener('badmouth', function (ev) {
      const b = JSON.parse(ev.data);
      blackFaces.set(b.target, Date.now() + BADMOUTH_MS);
      if (b.target === me.id) {
        const o = others.get(b.from);
        toast((o ? o.name : 'Một đồng nghiệp') + ' vừa nói xấu bạn!');
        addStress(10);
      }
    });
    es.addEventListener('tasks', function (ev) { onTasks(JSON.parse(ev.data)); });
    es.addEventListener('boss', function (ev) {
      const b = JSON.parse(ev.data);
      boss = { start: Date.now() - b.elapsed, dur: b.dur };
      bossCaughtMe = false;
      if (b.elapsed < 1000) toast('⚠️ Sếp đang đi tuần! Mau về bàn ngồi làm việc.', 5000);
    });
    es.addEventListener('offerings', function (ev) { offerings = JSON.parse(ev.data); });
    es.addEventListener('gift', function (ev) {
      const g = JSON.parse(ev.data);
      const it = ITEM_BY_ID.get(g.item);
      if (!it) return;
      inv[it.id] = (inv[it.id] || 0) + 1;
      saveInv();
      const o = others.get(g.from);
      toast((o ? o.name : 'Một người') + ' tặng bạn ' + it.emoji + ' ' + it.name + '!', 6000);
    });
    es.addEventListener('slap', function (ev) {
      const s = JSON.parse(ev.data);
      slaps.set(s.target, Date.now());
      if (s.target === me.id) {
        const o = others.get(s.from);
        toast((o ? o.name : 'Một đồng nghiệp') + ' vừa tát bạn!');
        addStress(15);
      }
    });
    es.addEventListener('leave', function (ev) {
      const id = JSON.parse(ev.data).id;
      others.delete(id);
      bubbles.delete(id);
    });
    es.onopen = function () { connected = true; lastSent = ''; }; // gửi lại trạng thái sau khi kết nối lại
    es.onerror = function () { connected = false; };
  }

  function syncState(now) {
    if (!online || !connected || inFlight) return;
    const payload = {
      id: me.id, name: me.name, scene: scene,
      x: Math.round(me.x), y: Math.round(me.y),
      dir: me.dir, pose: me.pose, days: me.days, gender: me.gender, wear: me.wear,
      stress: me.stress, caught: Date.now() < me.caughtUntil,
      food: me.pose === 'eat' ? me.food : undefined,
      lotus: Date.now() < (me.lotusUntil || 0),
    };
    const s = JSON.stringify(payload);
    if (s === lastSent && now - lastSentAt < 3000) return;
    if (now - lastSentAt < 90) return;
    lastSent = s;
    lastSentAt = now;
    inFlight = true;
    post('/api/state', payload).then(function () { inFlight = false; });
  }

  // ---------- Đi làm / đi chùa ----------
  function switchScene(next) {
    scene = next;
    document.body.classList.toggle('office', next === 'office');
    $('brand').textContent = next === 'office' ? '🏢 Đời là bể khổ' : '卍 Khẩu Xà Tâm Phật';
    if (es) es.close();
    connected = false;
    others.clear();
    bubbles.clear();
    blackFaces.clear();
    slaps.clear();
    boss = null;
    offerings = [];
    tasks = [];
    updateTaskBadge();
    keys.clear();
    me.x = 700;
    me.y = next === 'office' ? 940 : 840;
    me.name = next === 'office' ? officeName : templeName;
    setPose('stand');
    $('online-count').textContent = 1;
    lastSent = '';
    connect();
    if (musicOn) startMusic(); // đổi nhạc theo cảnh
  }

  const officeInput = $('office-name-input');
  $('btn-work').addEventListener('click', function () {
    officeInput.value = store.get(K.officeName) || '';
    $('office').classList.remove('hidden');
    keys.clear();
    setTimeout(function () { officeInput.focus(); }, 50);
  });
  $('office-close').addEventListener('click', function () { $('office').classList.add('hidden'); });
  $('office-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const typed = officeInput.value.trim().slice(0, 24);
    if (typed) store.set(K.officeName, typed);
    else store.del(K.officeName);
    officeName = typed || DEFAULT_OFFICE_NAME;
    me.gender = document.querySelector('input[name="gender"]:checked').value === 'f' ? 'f' : 'm';
    store.set(K.gender, me.gender);
    officeInput.blur();
    $('office').classList.add('hidden');
    switchScene('office');
  });
  $('btn-temple').addEventListener('click', function () { switchScene('temple'); });

  // Popup chọn đồng nghiệp (dùng cho Nói xấu và Tát).
  function pickColleague(title, sub, ids, onPick) {
    const list = $('pick-list');
    list.textContent = '';
    ids.forEach(function (id) {
      const o = others.get(id);
      const b = document.createElement('button');
      b.textContent = o.name || DEFAULT_OFFICE_NAME;
      b.addEventListener('click', function () {
        $('pick').classList.add('hidden');
        onPick(id, o.name || DEFAULT_OFFICE_NAME);
      });
      list.appendChild(b);
    });
    $('pick-title').textContent = title;
    $('pick-sub').textContent = sub;
    $('pick').classList.remove('hidden');
    keys.clear();
  }
  $('pick-close').addEventListener('click', function () { $('pick').classList.add('hidden'); });

  // Nói xấu đồng nghiệp: chọn một người đang ở văn phòng → mặt họ xám 10 giây.
  $('btn-badmouth').addEventListener('click', function () {
    if (others.size === 0) { toast('Chưa có đồng nghiệp nào trong văn phòng.'); return; }
    pickColleague('Nói xấu ai?', 'Chọn một đồng nghiệp đang ở văn phòng', Array.from(others.keys()), badmouth);
  });

  // Pha cà phê: chỉ trong pantry; ngồi nhâm nhi 10 giây, đỡ stress một chút.
  $('btn-coffee').addEventListener('click', function () {
    if (!(me.x > PANTRY.x0 && me.y < PANTRY.y1)) { toast('Vào pantry mới pha được cà phê.'); return; }
    me.food = 'cafe';
    me.eatUntil = Date.now() + EAT_MS;
    setPose('eat');
    addStress(-3);
    toast('☕ Nhâm nhi cà phê cho tỉnh táo…');
  });

  // Đi ngủ: phải đến gần bàn làm việc → nằm dưới gầm bàn.
  $('btn-sleep').addEventListener('click', function () {
    let best = null, bestD = 110;
    DESKS.forEach(function (d) {
      const dist = Math.hypot(me.x - d.x, me.y - (d.y + 30));
      if (dist < bestD) { best = d; bestD = dist; }
    });
    if (!best) { toast('Đến gần bàn làm việc mới ngủ được.'); return; }
    me.x = best.x;
    me.y = best.y + 4;
    setPose('sleep');
  });

  // Tát đồng nghiệp: chỉ tát được người đang đứng gần.
  $('btn-slap').addEventListener('click', function () {
    const near = [];
    others.forEach(function (o, id) {
      if (Math.hypot(o.rx - me.x, o.ry - me.y) <= SLAP_RANGE) near.push(id);
    });
    if (near.length === 0) { toast('Đi lại gần đồng nghiệp mới tát được.'); return; }
    pickColleague('Tát ai?', 'Đồng nghiệp đang đứng gần bạn', near, function (id, name) {
      slaps.set(id, Date.now());
      post('/api/slap', { id: me.id, target: id });
      toast('Bạn vừa tát ' + name + '!');
      addStress(5);
      scheduleRepent();
    });
  });

  function badmouth(id, name) {
    blackFaces.set(id, Date.now() + BADMOUTH_MS);
    post('/api/badmouth', { id: me.id, target: id });
    toast('Bạn vừa nói xấu ' + (name || DEFAULT_OFFICE_NAME) + '…');
    addStress(5);
    scheduleRepent();
  }

  // ---------- Giao task ----------
  function myTasks() { return tasks.filter(function (t) { return t.to === me.id; }); }

  // So danh sách cũ/mới để báo cho user: được giao task, được duyệt, bị bắt làm lại.
  function onTasks(list) {
    const prev = new Map(tasks.map(function (t) { return [t.id, t]; }));
    const next = new Map(list.map(function (t) { return [t.id, t]; }));
    list.forEach(function (t) {
      const old = prev.get(t.id);
      if (t.to !== me.id) return;
      if (!old) toast(t.fromName + ' vừa giao task cho bạn: ' + t.text);
      else if (old.status === 'review' && t.status === 'todo') {
        toast(t.fromName + ' bắt bạn làm lại: ' + t.text, 6000);
        addStress(15);
      }
    });
    prev.forEach(function (t) {
      if (t.to === me.id && t.status === 'review' && !next.has(t.id)) {
        toast(t.fromName + ' đã duyệt xong task: ' + t.text + ' — thưởng 10k 💰');
        addSalary(10);
      }
    });
    tasks = list;
    updateTaskBadge();
    if (!$('mytasks').classList.contains('hidden')) renderMyTasks();
    checkReviews();
  }

  function updateTaskBadge() { $('task-count').textContent = myTasks().length; }

  $('btn-assign').addEventListener('click', function () {
    if (others.size === 0) { toast('Chưa có đồng nghiệp nào trong văn phòng.'); return; }
    const sel = $('assign-to');
    sel.textContent = '';
    others.forEach(function (o, id) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = o.name || DEFAULT_OFFICE_NAME;
      sel.appendChild(opt);
    });
    $('assign-text').value = '';
    $('assign').classList.remove('hidden');
    keys.clear();
    setTimeout(function () { $('assign-text').focus(); }, 50);
  });
  $('assign-close').addEventListener('click', function () { $('assign').classList.add('hidden'); });
  $('assign-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const to = $('assign-to').value;
    const text = $('assign-text').value.trim().slice(0, 200);
    if (!to || !text) { toast('Chọn người làm và viết mô tả task.'); return; }
    post('/api/task', { id: me.id, to: to, text: text });
    $('assign-text').blur();
    $('assign').classList.add('hidden');
    const o = others.get(to);
    toast('Đã giao task cho ' + (o ? o.name : DEFAULT_OFFICE_NAME) + '.');
  });

  function renderMyTasks() {
    const list = $('mytasks-list');
    list.textContent = '';
    const mine = myTasks();
    if (mine.length === 0) {
      const p = document.createElement('p');
      p.className = 'sub';
      p.textContent = 'Không có task nào 🎉';
      list.appendChild(p);
      return;
    }
    mine.forEach(function (t) {
      const row = document.createElement('div');
      row.className = 'task-row';
      const info = document.createElement('div');
      info.className = 'task-info';
      const from = document.createElement('div');
      from.className = 'task-from';
      from.textContent = 'Từ ' + t.fromName + (t.redo ? ' · bị bắt làm lại' : '');
      const text = document.createElement('div');
      text.textContent = t.text;
      info.appendChild(from);
      info.appendChild(text);
      const btn = document.createElement('button');
      if (t.status === 'review') {
        btn.textContent = 'Chờ duyệt…';
        btn.disabled = true;
      } else {
        btn.textContent = 'Đã xong';
        btn.className = 'primary';
        btn.addEventListener('click', function () {
          btn.disabled = true;
          post('/api/task/done', { id: me.id, task: t.id });
        });
      }
      row.appendChild(info);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }
  $('btn-mytasks').addEventListener('click', function () {
    renderMyTasks();
    $('mytasks').classList.remove('hidden');
    keys.clear();
  });
  $('mytasks-close').addEventListener('click', function () { $('mytasks').classList.add('hidden'); });

  // Người giao: có task chờ duyệt → hỏi đồng ý hay bắt làm lại (lần lượt từng task).
  let reviewing = null;
  function checkReviews() {
    if (scene !== 'office' || reviewing || overlayOpen()) return;
    const t = tasks.find(function (x) { return x.from === me.id && x.status === 'review'; });
    if (!t) return;
    reviewing = t.id;
    $('review-text').textContent = t.toName + ' báo đã xong task: "' + t.text + '"';
    $('review').classList.remove('hidden');
    keys.clear();
  }
  function answerReview(ok) {
    post('/api/task/review', { id: me.id, task: reviewing, ok: ok });
    reviewing = null;
    $('review').classList.add('hidden');
  }
  $('review-ok').addEventListener('click', function () { answerReview(true); });
  $('review-redo').addEventListener('click', function () { answerReview(false); });
  setInterval(checkReviews, 1500); // hiện khi các popup khác đã đóng

  // Chỉ mình user thấy: nhắc đi chùa sám hối (nhiều lần vi phạm liền nhau → chỉ một popup).
  let repentTimer = 0;
  function scheduleRepent() {
    clearTimeout(repentTimer);
    repentTimer = setTimeout(showRepent, REPENT_DELAY_MS);
  }
  function showRepent() {
    if (scene !== 'office') return; // đã tự về chùa
    if (overlayOpen()) { repentTimer = setTimeout(showRepent, 3000); return; }
    $('repent').classList.remove('hidden');
    keys.clear();
  }
  $('repent-yes').addEventListener('click', function () {
    $('repent').classList.add('hidden');
    switchScene('temple');
  });
  $('repent-no').addEventListener('click', function () { $('repent').classList.add('hidden'); });

  // ---------- Stress & lương ----------
  // Stress: đi làm tăng dần, bị nói xấu/tát/bắt làm lại/bị sếp bắt tăng mạnh; chỉ ở chùa mới giảm.
  let stressWarned = false;
  function addStress(n) {
    me.stress = Math.min(100, Math.max(0, me.stress + n));
    store.set(K.stress, String(me.stress));
    updateStatsUI();
    if (me.stress >= 100 && !stressWarned && scene === 'office') {
      stressWarned = true;
      toast('😵 Stress quá tải! Đi chùa cho tâm an thôi.', 6000);
      showRepent();
    }
    if (me.stress < 80) stressWarned = false;
  }
  function addSalary(n) {
    me.salary = Math.max(0, me.salary + n);
    store.set(K.salary, String(me.salary));
    updateStatsUI();
  }
  function updateStatsUI() {
    $('salary-val').textContent = me.salary;
    $('stress-fill').style.width = me.stress + '%';
    $('stress-fill').style.background = me.stress >= 70 ? '#e74c3c' : me.stress >= 40 ? '#f39c12' : '#2ecc71';
    $('stress').title = 'Stress: ' + me.stress + '/100 — chỉ đi chùa mới giảm';
    if (!$('offer').classList.contains('hidden')) renderOffer();
  }
  // Đang ngồi đúng ghế làm việc?
  function atDesk() {
    return me.pose === 'sit' && ALL_CHAIRS.some(function (c) {
      return Math.abs(me.x - c.x) < 4 && Math.abs(me.y - (c.y + 2)) < 4;
    });
  }
  let officeTicks = 0;
  setInterval(function () {
    if (!started) return;
    if (scene === 'office') {
      if (++officeTicks % 8 === 0) addStress(1);       // áp lực công việc: +1 mỗi 16 giây
      if (officeTicks % 5 === 0 && atDesk()) addSalary(1); // ngồi bàn làm việc: +1k mỗi 10 giây
    } else if (me.stress > 0) {
      addStress(me.pose === 'kneel' || me.pose === 'bow' ? -2 : -1); // ở chùa: giảm dần, quỳ/lạy giảm nhanh hơn
    }
  }, 2000);

  // ---------- Sếp đi tuần ----------
  function bossPos(now) {
    if (!boss) return null;
    const p = (now - boss.start) / boss.dur;
    if (p < 0 || p > 1) return null;
    return { x: -40 + (W + 80) * p, y: AISLE_Y };
  }
  function checkBoss(now) {
    const b = bossPos(now);
    if (!b || bossCaughtMe || scene !== 'office') return;
    if (Math.abs(b.x - me.x) < 150 && !atDesk()) {
      bossCaughtMe = true;
      me.caughtUntil = Date.now() + CAUGHT_MS;
      addStress(20);
      addSalary(-5);
      toast(me.pose === 'sleep' ? '😱 Sếp bắt quả tang bạn ngủ gật! −5k lương.' : '😱 Sếp bắt gặp bạn không ngồi làm việc! −5k lương.', 6000);
    }
  }

  // ---------- Dâng lễ vật (chùa) ----------
  function renderOffer() {
    $('offer-salary').textContent = me.salary;
    const grid = $('offer-items');
    grid.textContent = '';
    OFFERINGS.forEach(function (it) {
      const b = document.createElement('button');
      b.className = 'shop-item';
      b.disabled = me.salary < it.price;
      [['emoji', it.emoji], ['', it.name], ['price', it.price + 'k']].forEach(function (x) {
        const s = document.createElement('span');
        s.className = x[0];
        s.textContent = x[1];
        b.appendChild(s);
      });
      b.addEventListener('click', function () {
        if (me.salary < it.price) return;
        b.disabled = true;
        post('/api/offer', { id: me.id, item: it.id }).then(function (r) {
          if (r && r.ok) {
            addSalary(-it.price);
            addStress(-10);
            toast('🙏 Đã dâng ' + it.emoji + ' ' + it.name + ' lên bàn thờ.');
          } else {
            toast('Chưa dâng được, thử lại sau giây lát.');
            renderOffer();
          }
        });
      });
      grid.appendChild(b);
    });
  }
  $('btn-offer').addEventListener('click', function () {
    renderOffer();
    $('offer').classList.remove('hidden');
    keys.clear();
  });
  $('offer-close').addEventListener('click', function () { $('offer').classList.add('hidden'); });

  // ---------- Nhạc nền ----------
  let musicOn = false;
  let useSynth = false;
  bgm.volume = 0.6;
  bgm.addEventListener('error', function () {
    useSynth = true;
    if (musicOn && scene === 'temple') synth.start('temple');
  });

  function startMusic() {
    musicOn = true;
    if (scene === 'office') { bgm.pause(); synth.start('office'); return; } // nhạc căng thẳng
    synth.stop();
    if (useSynth) { synth.start('temple'); return; }
    const p = bgm.play();
    if (p && p.catch) {
      p.catch(function (err) {
        if (err && err.name === 'NotAllowedError') return;
        useSynth = true;
        if (musicOn && scene === 'temple') synth.start('temple');
      });
    }
  }
  function stopMusic() {
    musicOn = false;
    bgm.pause();
    synth.stop();
  }
  function updateMusicBtn() { $('btn-music').classList.toggle('muted', !musicOn); }
  $('btn-music').addEventListener('click', function () {
    if (musicOn) { stopMusic(); store.set(K.music, 'off'); }
    else { synth.unlock(); startMusic(); store.set(K.music, 'on'); }
    updateMusicBtn();
  });

  // Dự phòng khi chưa có file chu-dai-bi.mp3: tiếng mõ + chuông tổng hợp.
  const synth = (function () {
    let ac = null;
    let timer = null;
    let beat = 0;
    function tone(freq, dur, gain, type) {
      const t = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    let mode = 'temple';
    function tick() {
      tone(beat % 2 ? 560 : 520, 0.12, 0.35, 'triangle'); // mõ
      if (beat % 16 === 0) {                                // chuông
        tone(196, 4, 0.18, 'sine');
        tone(392.5, 3, 0.08, 'sine');
        tone(589, 2, 0.04, 'sine');
      }
      beat++;
    }
    // Văn phòng: đồng hồ tích tắc dồn dập + bass dồn nhịp + hợp âm nghịch tai.
    const OFFICE_BASS = [55, 55, 55, 58.27, 55, 55, 61.74, 58.27]; // A1 … Bb1, B1: cách nửa cung → căng
    function officeTick() {
      tone(beat % 2 ? 1500 : 1800, 0.03, 0.06, 'square');                // tích tắc
      if (beat % 2 === 0) tone(OFFICE_BASS[(beat / 2) % 8], 0.2, 0.16, 'sawtooth');
      if (beat % 16 === 0) {                                              // hợp âm quãng 2 thứ
        tone(220, 1.6, 0.05, 'sawtooth');
        tone(233.08, 1.6, 0.05, 'sawtooth');
      }
      if (beat % 32 === 24) tone(880, 0.5, 0.04, 'triangle');             // "tin nhắn sếp"
      beat++;
    }
    return {
      // Phải gọi đồng bộ trong sự kiện chạm/bấm — iOS chỉ cho phát âm thanh khi đó.
      unlock: function () {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = ac || new AC();
        if (ac.resume) ac.resume();
        const src = ac.createBufferSource();
        src.buffer = ac.createBuffer(1, 1, 22050);
        src.connect(ac.destination);
        src.start(0);
      },
      start: function (m) {
        m = m === 'office' ? 'office' : 'temple';
        if (!ac || (timer && mode === m)) return;
        if (timer) clearInterval(timer);
        mode = m;
        if (ac.resume) ac.resume();
        beat = 0;
        const fn = m === 'office' ? officeTick : tick;
        fn();
        timer = setInterval(fn, m === 'office' ? 230 : 720);
      },
      stop: function () {
        if (timer) clearInterval(timer);
        timer = null;
      },
    };
  })();

  // ---------- Chép kinh ----------
  const sutraInput = $('sutra-input');
  const sutraStatus = $('sutra-status');
  let currentSutra = null;

  // Gộp hai kiểu bỏ dấu thanh "hóa/hoá", "thủy/thuỷ" (tuỳ bộ gõ) về một dạng trước khi so sánh.
  function foldTone(s) {
    return s.normalize('NFD')
      .replace(/([oO])([̣̀́̃̉])([aAeE])/g, '$1$3$2')
      .replace(/([uU])([̣̀́̃̉])([yY])/g, '$1$3$2')
      .normalize('NFC');
  }

  function normalize(s) {
    return foldTone(s)
      .replace(/\r\n?/g, '\n')
      .replace(/ /g, ' ')
      .split('\n').map(function (l) { return l.replace(/[ \t]+$/, ''); }).join('\n')
      .trim();
  }

  function setPoints(n) {
    n = Math.max(0, n);
    store.set(K.days, String(n));
    me.days = n;
    lastSent = '';
    updatePointsUI();
  }
  // Tâm chưa tịnh (nói bậy ở chùa / trả lời sai câu hỏi) → trừ 1 điểm.
  function penalize() {
    setPoints(getPoints() - 1);
    me.lotusUntil = 0;
  }

  function updateSutraBadge() {
    $('sutra-badge').textContent = doneToday() ? '✓' : '•';
    $('sutra-badge').style.color = doneToday() ? '#7fd38a' : '#ff9a6a';
  }

  function setStatus(text, cls) {
    sutraStatus.textContent = text;
    sutraStatus.className = cls || '';
  }

  // idx: bài user chọn; bỏ trống → bài gợi ý.
  let sutraIdx = 0;
  function openSutra(idx) {
    sutraIdx = typeof idx === 'number' ? idx : todaySutraIndex();
    currentSutra = window.SUTRAS[sutraIdx];
    $('sutra-pick').value = String(sutraIdx);
    $('sutra-title').textContent = currentSutra.title;
    $('sutra-text').textContent = currentSutra.text;
    $('sutra-meta').textContent = 'Điểm: ' + getPoints() + ' · Hôm nay đã chép ' + copiesToday() + ' bài · ' + todayStr();
    let draft = null;
    try { draft = JSON.parse(store.get(K.draft) || 'null'); } catch (e) { /* bỏ qua */ }
    sutraInput.value = draft && draft.date === todayStr() && draft.title === currentSutra.title ? draft.text : '';
    sutraDone = false;
    setStatus('Chép đúng bài này được +' + sutraPoints(currentSutra) + ' điểm.');
    sutraInput.disabled = false;
    $('sutra-check').textContent = 'Kiểm tra';
    $('sutra').classList.remove('hidden');
    keys.clear();
  }

  // Điểm theo độ dài bài: khoảng 60 ký tự được 1 điểm, ít nhất 1 điểm.
  function sutraPoints(s) { return Math.max(1, Math.round(normalize(s.text).length / 60)); }
  window.SUTRAS.forEach(function (s, i) {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = s.title + ' — +' + sutraPoints(s) + ' điểm';
    $('sutra-pick').appendChild(o);
  });
  $('sutra-pick').addEventListener('change', function () { openSutra(Number(this.value)); });

  $('btn-sutra').addEventListener('click', openSutra);
  $('sutra-close').addEventListener('click', function () {
    $('sutra').classList.add('hidden');
    if (quizPending) {
      quizPending = false;
      setTimeout(showQuiz, QUIZ_DELAY_MS);
    }
  });

  // ---------- Đổi quà ----------
  function saveInv() {
    Object.keys(worn).forEach(function (s) { if (!inv[worn[s]]) delete worn[s]; });
    store.set(K.inv, JSON.stringify(inv));
    store.set(K.worn, JSON.stringify(worn));
    me.wear = Object.values(worn);
    lastSent = '';
    if (!$('shop').classList.contains('hidden')) renderShop();
  }
  function updatePointsUI() {
    $('points').textContent = getPoints();
    if (!$('shop').classList.contains('hidden')) renderShop();
  }
  function removeOne(id) {
    inv[id] = (inv[id] || 0) - 1;
    if (inv[id] <= 0) delete inv[id];
    saveInv();
  }

  function renderShop() {
    const pts = getPoints();
    $('shop-points').textContent = pts;
    const grid = $('shop-items');
    grid.textContent = '';
    ITEMS.forEach(function (it) {
      const b = document.createElement('button');
      b.className = 'shop-item';
      b.disabled = pts < it.price;
      [['emoji', it.emoji], ['', it.name], ['price', it.price + ' điểm']].forEach(function (x) {
        const s = document.createElement('span');
        s.className = x[0];
        s.textContent = x[1];
        b.appendChild(s);
      });
      b.addEventListener('click', function () {
        if (getPoints() < it.price) return;
        setPoints(getPoints() - it.price);
        inv[it.id] = (inv[it.id] || 0) + 1;
        saveInv();
        toast('Đã đổi ' + it.emoji + ' ' + it.name + '.');
      });
      grid.appendChild(b);
    });

    const list = $('inv-list');
    list.textContent = '';
    const owned = ITEMS.filter(function (it) { return inv[it.id] > 0; });
    if (owned.length === 0) {
      const p = document.createElement('p');
      p.className = 'sub';
      p.textContent = 'Túi đồ trống — chép kinh lấy điểm để đổi quà nhé.';
      list.appendChild(p);
      return;
    }
    owned.forEach(function (it) {
      const row = document.createElement('div');
      row.className = 'task-row';
      const info = document.createElement('div');
      info.className = 'task-info';
      info.textContent = it.emoji + ' ' + it.name + ' ×' + inv[it.id];
      row.appendChild(info);
      const wearing = worn[it.slot] === it.id;
      const btns = [
        [wearing ? 'Cởi' : 'Mặc', wearing ? '' : 'primary', function () {
          if (wearing) delete worn[it.slot];
          else worn[it.slot] = it.id;
          saveInv();
        }],
        ['Tặng', '', function () { giftItem(it); }],
        ['Xóa', '', function () {
          if (window.confirm('Xóa 1 ' + it.name + '?')) removeOne(it.id);
        }],
      ];
      btns.forEach(function (x) {
        const b = document.createElement('button');
        b.textContent = x[0];
        if (x[1]) b.className = x[1];
        b.addEventListener('click', x[2]);
        row.appendChild(b);
      });
      list.appendChild(row);
    });
  }

  function giftItem(it) {
    if (others.size === 0) { toast('Chưa có ai khác đang online ở đây.'); return; }
    pickColleague('Tặng ' + it.name + ' cho ai?', 'Người đang online cùng chỗ với bạn', Array.from(others.keys()), function (id, name) {
      post('/api/gift', { id: me.id, target: id, item: it.id, scene: scene }).then(function (r) {
        if (r && r.ok) {
          removeOne(it.id);
          toast('Đã tặng ' + it.emoji + ' ' + it.name + ' cho ' + name + '.');
        } else {
          toast('Chưa tặng được — có thể ' + name + ' vừa rời đi.');
        }
      });
    });
  }

  $('btn-shop').addEventListener('click', function () {
    renderShop();
    $('shop').classList.remove('hidden');
    keys.clear();
  });
  $('shop-close').addEventListener('click', function () { $('shop').classList.add('hidden'); });

  // ---------- Câu hỏi sau khi chép kinh (chỉ mình user thấy) ----------
  const QUIZ_DELAY_MS = 30000;
  let quizPending = false;
  // good: câu trả lời đúng tinh thần Phật pháp; yes/no: lời nhắn sau khi chọn Có/Không.
  const QUIZ = [
    { q: 'Nếu bạn đi chùa thấy một đôi dép đẹp quá ở ngoài cửa, bạn có lấy không?', good: 'no',
      yes: 'Không lấy của không cho là giới thứ hai trong Ngũ giới. Đôi dép ấy là của người khác.',
      no: 'Lành thay! Không lấy của không cho là giữ giới.' },
    { q: 'Nếu bị một con muỗi đốt, bạn có vỗ nó không?', good: 'no',
      yes: 'Muỗi cũng là một sinh mạng. Thử nhẹ nhàng xua nó đi thay vì sát sinh.',
      no: 'Lành thay! Từ bi với cả loài nhỏ bé nhất.' },
    { q: 'Nhặt được một chiếc ví trong sân chùa, bạn có giữ lại không?', good: 'no',
      yes: 'Hãy gửi lại nhà chùa để tìm người mất — của không cho thì không lấy.',
      no: 'Lành thay! Trả lại của rơi là gieo hạt lành.' },
    { q: 'Có người nói xấu bạn, bạn có nói xấu lại không?', good: 'no',
      yes: 'Lấy oán báo oán, oán chồng chất. Giữ lời ái ngữ là giữ tâm mình.',
      no: 'Lành thay! Nhẫn nhục là một hạnh lớn.' },
    { q: 'Gặp người ăn xin trước cổng chùa, bạn có bố thí không?', good: 'yes',
      yes: 'Lành thay! Bố thí dù nhỏ cũng là phước lành.',
      no: 'Một chút lòng thành, dù ít, cũng làm ấm lòng người khác.' },
    { q: 'Thấy người già đứng trên xe buýt, bạn có nhường ghế không?', good: 'yes',
      yes: 'Lành thay! Kính lão đắc thọ.',
      no: 'Một hành động nhỏ có thể giúp người khác rất nhiều.' },
    { q: 'Người bán hàng thối dư tiền cho bạn, bạn có trả lại không?', good: 'yes',
      yes: 'Lành thay! Ngay thẳng là nền của mọi việc lành.',
      no: 'Số tiền dư ấy không phải của mình — trả lại thì tâm được an.' },
    { q: 'Bạn có nói dối để khỏi bị mắng không?', good: 'no',
      yes: 'Không nói dối là giới thứ tư trong Ngũ giới. Thật thà thì lòng nhẹ nhõm.',
      no: 'Lành thay! Lời chân thật là lời đáng quý.' },
    { q: 'Thấy con kiến bò trên bàn, bạn có di chết nó không?', good: 'no',
      yes: 'Con kiến cũng tham sống sợ chết như ta. Hãy nhẹ nhàng đưa nó đi chỗ khác.',
      no: 'Lành thay! Không sát sinh là giới đầu tiên.' },
    { q: 'Đi chùa đông người, bạn có chen lấn để được thắp hương trước không?', good: 'no',
      yes: 'Tâm thành quan trọng hơn đến trước. Nhường nhau là đã có phước.',
      no: 'Lành thay! Từ tốn, nhường nhịn là nét đẹp nơi cửa Phật.' },
    { q: 'Thấy hòm công đức không ai trông, bạn có lấy bớt vài đồng không?', good: 'no',
      yes: 'Tiền công đức là của Tam Bảo, lấy đi là tổn phước rất nặng.',
      no: 'Lành thay! Giữ tâm trong sạch nơi cửa Phật.' },
    { q: 'Bạn bè rủ uống rượu say rồi lái xe về, bạn có đi không?', good: 'no',
      yes: 'Không uống rượu say là giới thứ năm — say thì dễ làm hại mình và người.',
      no: 'Lành thay! Giữ tỉnh táo là giữ an toàn cho mình và mọi người.' },
    { q: 'Thấy bạn làm rơi điện thoại mà không biết, bạn có gọi lại báo không?', good: 'yes',
      yes: 'Lành thay! Giúp người là giúp mình.',
      no: 'Chỉ một tiếng gọi thôi đã giúp người khác bớt một phen lo lắng.' },
    { q: 'Bố mẹ gọi điện lúc bạn đang bận chơi, bạn có tắt máy luôn không?', good: 'no',
      yes: 'Hiếu thảo với cha mẹ là phước điền lớn nhất. Một phút nghe máy cũng là báo hiếu.',
      no: 'Lành thay! Có hiếu với cha mẹ là gốc của mọi điều lành.' },
    { q: 'Thấy chú chó hoang đói lả bên đường, bạn có chia cho nó chút đồ ăn không?', good: 'yes',
      yes: 'Lành thay! Lòng từ bi không phân biệt người hay vật.',
      no: 'Một chút đồ ăn của mình có thể là cả bữa no của một sinh linh.' },
  ];

  function showQuiz() {
    if (overlayOpen() || scene !== 'temple') { setTimeout(showQuiz, 3000); return; } // đợi đóng popup khác / về chùa
    const item = QUIZ[Math.floor(Math.random() * QUIZ.length)];
    $('quiz-question').textContent = item.q;
    $('quiz-answer').textContent = '';
    $('quiz-answer').className = '';
    $('quiz-choices').classList.remove('hidden');
    $('quiz-close').classList.add('hidden');
    $('quiz').dataset.idx = String(QUIZ.indexOf(item));
    $('quiz').classList.remove('hidden');
    keys.clear();
  }
  ['yes', 'no'].forEach(function (ans) {
    $('quiz-' + ans).addEventListener('click', function () {
      const item = QUIZ[Number($('quiz').dataset.idx)];
      const right = ans === item.good;
      $('quiz-answer').textContent = item[ans] +
        (right ? '' : '\nTâm chưa tịnh — bị trừ 1 điểm.');
      $('quiz-answer').className = right ? 'ok' : 'err';
      if (!right) penalize();
      $('quiz-close').textContent = right ? 'Nam mô A Di Đà Phật 🙏' : 'Chép kinh lấy lại điểm';
      $('quiz-close').dataset.redo = right ? '' : '1';
      $('quiz-choices').classList.add('hidden');
      $('quiz-close').classList.remove('hidden');
    });
  });
  $('quiz-close').addEventListener('click', function () {
    $('quiz').classList.add('hidden');
    if ($('quiz-close').dataset.redo) openSutra();
  });

  sutraInput.addEventListener('input', function () {
    store.set(K.draft, JSON.stringify({ date: todayStr(), title: currentSutra.title, text: sutraInput.value }));
  });
  function noPaste(e) {
    e.preventDefault();
    setStatus('Hãy tự tay chép từng chữ, không dán nhé 🙏', 'err');
  }
  sutraInput.addEventListener('paste', noPaste);
  sutraInput.addEventListener('drop', noPaste);
  sutraInput.addEventListener('beforeinput', function (e) {
    if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') noPaste(e);
  });

  let sutraDone = false;
  $('sutra-check').addEventListener('click', function () {
    if (sutraDone) { openSutra((sutraIdx + 1) % window.SUTRAS.length); return; } // "Chép bài tiếp"
    const want = normalize(currentSutra.text);
    const got = normalize(sutraInput.value);
    if (got === want) {
      store.set(K.copies, JSON.stringify({ date: todayStr(), n: copiesToday() + 1 }));
      store.del(K.draft);
      const gain = sutraPoints(currentSutra);
      setPoints(getPoints() + gain);
      addStress(-20);
      me.lotusUntil = Date.now() + LOTUS_MS;
      quizPending = true;
      sutraDone = true;
      setStatus('🙏 Viên mãn! +' + gain + ' điểm — bạn đang có ' + getPoints() + ' điểm.', 'ok');
      sutraInput.disabled = true;
      $('sutra-check').textContent = 'Chép bài tiếp';
      updateSutraBadge();
      return;
    }
    let i = 0;
    while (i < want.length && i < got.length && want[i] === got[i]) i++;
    const before = want.slice(0, i).split('\n');
    const line = before.length;
    const col = before[before.length - 1].length + 1;
    if (i >= got.length) setStatus('Chưa xong — còn thiếu từ dòng ' + line + ', vị trí ' + col + '.', 'err');
    else if (i >= want.length) setStatus('Thừa ký tự từ dòng ' + line + ', vị trí ' + col + '.', 'err');
    else setStatus('Sai ở dòng ' + line + ', vị trí ' + col + ' (cần "' + want[i] + '").', 'err');
  });

  // Qua ngày mới khi đang mở trang → làm mới huy hiệu nhiệm vụ.
  setInterval(updateSutraBadge, 30000);

  // ---------- Tiện ích ----------
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h % 1000) / 1000;
  }

  // ---------- Camera ----------
  let dpr = 1, cw = 0, ch = 0, scale = 1, camX = 0, camY = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    cw = rect.width || window.innerWidth;
    ch = rect.height || window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    scale = clamp(Math.min(cw / 900, ch / 640), 0.42, 1.6);
  }
  window.addEventListener('resize', resize);
  resize();

  function updateCamera() {
    const vw = cw / scale;
    const vh = ch / scale;
    camX = vw >= W ? (W - vw) / 2 : clamp(me.x - vw / 2, 0, W - vw);
    // Đến gần bát hương thì camera không lên cao quá đỉnh tượng (chừa 60 cho thanh trên),
    // miễn nhân vật vẫn nằm trong 75% chiều cao màn hình.
    const followY = scene === 'temple'
      ? Math.min(me.y - vh * 0.62, Math.max(STATUE_TOP - 60, me.y - vh * 0.75))
      : me.y - vh * 0.62;
    camY = vh >= H ? (H - vh) / 2 : clamp(followY, 0, H - vh);
  }
  function screenToWorld(sx, sy) {
    return { x: sx / scale + camX, y: sy / scale + camY };
  }

  // ---------- Cập nhật ----------
  function update(dt) {
    let vx = 0, vy = 0;
    if (!typing() && !overlayOpen()) {
      if (keys.has('arrowleft') || keys.has('a')) vx -= 1;
      if (keys.has('arrowright') || keys.has('d')) vx += 1;
      if (keys.has('arrowup') || keys.has('w')) vy -= 1;
      if (keys.has('arrowdown') || keys.has('s')) vy += 1;
    }
    if (!vx && !vy && me.target) {
      const dx = me.target.x - me.x, dy = me.target.y - me.y;
      const d = Math.hypot(dx, dy);
      if (d < 4) me.target = null;
      else { vx = dx / d; vy = dy / d; }
    }
    const moving = vx || vy;
    if (moving) {
      const len = Math.hypot(vx, vy);
      const ox = me.x, oy = me.y;
      me.x = clamp(me.x + (vx / len) * SPEED * dt, BOUNDS.minX, BOUNDS.maxX);
      me.y = clamp(me.y + (vy / len) * SPEED * dt, BOUNDS.minY, BOUNDS.maxY);
      (scene === 'office' ? OFFICE_OBSTACLES : OBSTACLES).forEach(function (o) {
        const dx = me.x - o.x, dy = me.y - o.y;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d < o.r + BODY_R) {
          me.x = o.x + (dx / d) * (o.r + BODY_R);
          me.y = o.y + (dy / d) * (o.r + BODY_R);
        }
      });
      // Bị kẹt sau vật cản khi đi bằng chạm → dừng lại.
      if (me.target && Math.hypot(me.x - ox, me.y - oy) < SPEED * dt * 0.2) me.target = null;
      if (Math.abs(vx) > 0.1) me.dir = vx > 0 ? 1 : -1;
      if (me.pose !== 'walk') {
        me.pose = 'walk';
        document.querySelectorAll('[data-pose], #btn-eat, #btn-sleep').forEach(function (b) { b.classList.remove('active'); });
      }
    } else if (me.pose === 'walk') {
      setPose('stand');
    } else if (me.pose === 'eat' && Date.now() >= me.eatUntil) {
      setPose('sit'); // ăn xong vẫn ngồi
    }

    const k = Math.min(1, dt * 10);
    others.forEach(function (o) {
      o.rx += (o.x - o.rx) * k;
      o.ry += (o.y - o.ry) * k;
    });

    const now = Date.now();
    bubbles.forEach(function (b, id) { if (b.until < now) bubbles.delete(id); });
  }

  // ---------- Vẽ khung cảnh ----------
  function drawWall(t) {
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
    g.addColorStop(0, '#2c140a');
    g.addColorStop(1, '#55290f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, FLOOR_TOP);

    // vách gỗ
    ctx.strokeStyle = 'rgba(0,0,0,.25)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= W; x += 70) {
      ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, FLOOR_TOP - 20); ctx.stroke();
    }
    // xà ngang
    ctx.fillStyle = '#3a1a0b';
    ctx.fillRect(0, 0, W, 42);
    ctx.fillStyle = '#c9963a';
    ctx.fillRect(0, 40, W, 4);
    ctx.fillStyle = '#3a1a0b';
    ctx.fillRect(0, FLOOR_TOP - 22, W, 22);
    ctx.fillStyle = '#c9963a';
    ctx.fillRect(0, FLOOR_TOP - 24, W, 3);

    // câu đối
    drawScroll(120, 90, 'TỪ BI');
    drawScroll(1240, 90, 'HỶ XẢ');

    // đèn lồng
    [[330, 44], [1070, 44], [520, 44], [880, 44]].forEach(function (p, i) {
      const sway = Math.sin(t / 900 + i) * 3;
      ctx.strokeStyle = '#2a1206';
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + sway, p[1] + 34); ctx.stroke();
      const lg = ctx.createRadialGradient(p[0] + sway, p[1] + 56, 4, p[0] + sway, p[1] + 56, 60);
      lg.addColorStop(0, 'rgba(255,170,80,.35)');
      lg.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(p[0] - 70, p[1] - 10, 140, 140);
      ctx.fillStyle = '#b8261c';
      ctx.beginPath(); ctx.ellipse(p[0] + sway, p[1] + 56, 20, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8b64c';
      ctx.fillRect(p[0] + sway - 10, p[1] + 30, 20, 5);
      ctx.fillRect(p[0] + sway - 10, p[1] + 78, 20, 5);
    });
  }

  function drawScroll(x, y, text) {
    ctx.fillStyle = '#8c1c14';
    ctx.fillRect(x - 26, y, 52, 220);
    ctx.strokeStyle = '#e8b64c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 22, y + 4, 44, 212);
    ctx.fillStyle = '#f5d98b';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const words = text.split(' ');
    words.forEach(function (w, i) { ctx.fillText(w, x, y + 70 + i * 80); });
  }

  function drawFloor() {
    const tile = 70;
    for (let y = FLOOR_TOP; y < H; y += tile) {
      for (let x = 0; x < W; x += tile) {
        const odd = ((x / tile) + Math.floor((y - FLOOR_TOP) / tile)) % 2;
        ctx.fillStyle = odd ? '#7c4a26' : '#8d5a31';
        ctx.fillRect(x, y, tile, tile);
      }
    }
    ctx.strokeStyle = 'rgba(40,20,8,.45)';
    ctx.lineWidth = 2;
    for (let y = FLOOR_TOP; y <= H; y += tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x <= W; x += tile) { ctx.beginPath(); ctx.moveTo(x, FLOOR_TOP); ctx.lineTo(x, H); ctx.stroke(); }

    // thảm đỏ dẫn tới tượng
    ctx.fillStyle = '#7a1f1a';
    ctx.fillRect(640, FLOOR_TOP + 10, 120, H - FLOOR_TOP);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 3;
    ctx.strokeRect(648, FLOOR_TOP + 18, 104, H - FLOOR_TOP);

    // bồ đoàn
    CUSHIONS.forEach(function (c) {
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.ellipse(c.x, c.y + 4, 28, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b5841f';
      ctx.beginPath(); ctx.ellipse(c.x, c.y, 26, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d9a63a';
      ctx.beginPath(); ctx.ellipse(c.x, c.y - 2, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
    });
  }

  function drawAltar(t) {
    // bệ thờ
    ctx.fillStyle = '#3d1d0c';
    ctx.fillRect(410, 330, 580, 120);
    ctx.fillStyle = '#5a2c12';
    ctx.fillRect(420, 340, 560, 100);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 3;
    ctx.strokeRect(420, 340, 560, 100);
    ctx.fillStyle = '#d9a441';
    for (let x = 450; x < 970; x += 60) {
      ctx.beginPath(); ctx.arc(x, 390, 6, 0, Math.PI * 2); ctx.fill();
    }

    // Tượng (hào quang + đài sen + thân) thu nhỏ quanh chân đài sen để thấp hơn.
    ctx.save();
    ctx.translate(700, STATUE_BASE);
    ctx.scale(STATUE_SCALE, STATUE_SCALE);
    ctx.translate(-700, -STATUE_BASE);

    // hào quang
    const cx = 700;
    const glow = 0.85 + Math.sin(t / 1200) * 0.08;
    const hg = ctx.createRadialGradient(cx, 160, 20, cx, 160, 190);
    hg.addColorStop(0, 'rgba(255,225,140,' + (0.85 * glow) + ')');
    hg.addColorStop(0.55, 'rgba(240,170,60,' + (0.35 * glow) + ')');
    hg.addColorStop(1, 'rgba(240,170,60,0)');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(cx, 160, 190, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(cx, 160);
    ctx.rotate(t / 20000);
    ctx.strokeStyle = 'rgba(255,220,130,.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 24; i++) {
      ctx.rotate(Math.PI / 12);
      ctx.beginPath(); ctx.moveTo(70, 0); ctx.lineTo(175, 0); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = '#e8b64c';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, 130, 66, 0, Math.PI * 2); ctx.stroke();

    // đài sen
    const petal = function (x, y, w, h, c1, c2) {
      const g = ctx.createLinearGradient(x, y - h, x, y);
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.quadraticCurveTo(x - w / 2, y - h * 0.7, x, y - h);
      ctx.quadraticCurveTo(x + w / 2, y - h * 0.7, x + w / 2, y);
      ctx.closePath();
      ctx.fill();
    };
    for (let i = -4; i <= 4; i++) petal(cx + i * 30, 352, 44, 48, '#f6c6c0', '#c8574d');
    for (let i = -3; i <= 3; i++) petal(cx + i * 34, 362, 50, 40, '#fbd8d2', '#d56a5f');

    // thân Phật (vàng)
    const gold = ctx.createLinearGradient(cx - 120, 0, cx + 120, 0);
    gold.addColorStop(0, '#a8741f');
    gold.addColorStop(0.45, '#f2cf6e');
    gold.addColorStop(0.6, '#f7dc8a');
    gold.addColorStop(1, '#9c6a1c');

    // chân xếp bằng
    ctx.fillStyle = gold;
    ctx.beginPath(); ctx.ellipse(cx, 312, 118, 34, 0, 0, Math.PI * 2); ctx.fill();
    // thân
    ctx.beginPath();
    ctx.moveTo(cx - 70, 190);
    ctx.quadraticCurveTo(cx - 96, 250, cx - 88, 310);
    ctx.lineTo(cx + 88, 310);
    ctx.quadraticCurveTo(cx + 96, 250, cx + 70, 190);
    ctx.quadraticCurveTo(cx, 172, cx - 70, 190);
    ctx.fill();
    // nếp áo cà sa
    ctx.strokeStyle = 'rgba(120,70,15,.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx - 60, 194); ctx.quadraticCurveTo(cx + 10, 240, cx + 70, 300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 40, 196); ctx.quadraticCurveTo(cx, 220, cx + 30, 210); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 100, 318); ctx.quadraticCurveTo(cx, 300, cx + 100, 318); ctx.stroke();
    // tay ấn thiền
    ctx.fillStyle = '#f0c968';
    ctx.beginPath(); ctx.ellipse(cx, 290, 44, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,15,.6)';
    ctx.beginPath(); ctx.ellipse(cx, 288, 30, 8, 0, 0, Math.PI); ctx.stroke();
    // cổ + đầu
    ctx.fillStyle = gold;
    ctx.fillRect(cx - 16, 168, 32, 22);
    ctx.beginPath(); ctx.ellipse(cx - 40, 140, 9, 24, 0.05, 0, Math.PI * 2); ctx.fill(); // tai
    ctx.beginPath(); ctx.ellipse(cx + 40, 140, 9, 24, -0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, 132, 40, 46, 0, 0, Math.PI * 2); ctx.fill();
    // nhục kế + tóc xoắn ốc
    ctx.fillStyle = '#6b4314';
    ctx.beginPath(); ctx.ellipse(cx, 102, 40, 24, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, 80, 17, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a5a1e';
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 7 - r; i++) {
        ctx.beginPath(); ctx.arc(cx - 30 + r * 6 + i * 10, 98 - r * 8, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    // gương mặt từ bi
    ctx.strokeStyle = '#7a4a12';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx - 15, 130, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 15, 130, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, 152, 9, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 132); ctx.lineTo(cx - 3, 145); ctx.lineTo(cx + 3, 145); ctx.stroke();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(cx, 116, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // nến + bình hoa
    [520, 880].forEach(function (x, i) {
      ctx.fillStyle = '#f2e6c8';
      ctx.fillRect(x - 6, 300, 12, 40);
      const f = Math.sin(t / 90 + i * 2) * 1.5;
      const fg = ctx.createRadialGradient(x, 290, 1, x, 290, 22);
      fg.addColorStop(0, 'rgba(255,220,120,.9)');
      fg.addColorStop(1, 'rgba(255,160,60,0)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(x, 290, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffcf5c';
      ctx.beginPath(); ctx.ellipse(x + f * 0.5, 291, 4, 9 + f, 0, 0, Math.PI * 2); ctx.fill();
    });
    [460, 940].forEach(function (x) {
      ctx.fillStyle = '#284d43';
      ctx.beginPath(); ctx.ellipse(x, 320, 14, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a8566a';
      [[-10, 284], [0, 276], [10, 286], [-4, 294], [6, 296]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(x + p[0], p[1], 7, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#3d6233';
      ctx.fillRect(x - 1, 296, 2, 10);
    });

    // bàn lễ phủ khăn đỏ trước bệ thờ + lễ vật mọi người dâng (mới nhất ở giữa)
    drawOfferingTable();
    offerings.slice().reverse().forEach(function (o, i) {
      if (i < OFFERING_SLOTS.length) drawOffering(o.item, OFFERING_SLOTS[i], OFFERING_TOP, t, i);
    });
  }

  const OFFERING_TOP = 410; // mặt bàn lễ
  function drawOfferingTable() {
    const x0 = 466, x1 = 934, y = OFFERING_TOP;
    ctx.fillStyle = '#5a2c12';
    ctx.fillRect(x0 + 6, y, 6, 42);
    ctx.fillRect(x1 - 12, y, 6, 42);
    ctx.fillStyle = '#9c2a20';                  // khăn đỏ
    ctx.fillRect(x0, y, x1 - x0, 24);
    ctx.fillStyle = '#d9a441';                  // viền vàng
    ctx.fillRect(x0, y, x1 - x0, 3);
    ctx.fillRect(x0, y + 22, x1 - x0, 3);
    ctx.fillStyle = '#e8b64c';                  // tua rua
    for (let x = x0 + 6; x < x1; x += 12) {
      ctx.beginPath(); ctx.moveTo(x - 3, y + 25); ctx.lineTo(x + 3, y + 25); ctx.lineTo(x, y + 31); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#e8b64c';                  // chữ Vạn giữa khăn
    ctx.font = 'bold 13px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('卍', 700, y + 13);
  }

  function glow(x, y, r, a) {
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, 'rgba(255,214,120,' + a + ')');
    g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // Vẽ một lễ vật đứng trên mặt bàn lễ, chân tại (x, y).
  function drawOffering(id, x, y, t, i) {
    const flick = Math.sin(t / 90 + i * 1.7);
    if (id === 'nen') {
      glow(x, y - 30, 16, 0.55);
      ctx.fillStyle = '#d9a441';
      ctx.fillRect(x - 6, y - 3, 12, 3);
      ctx.fillStyle = '#f7efdc';
      ctx.fillRect(x - 3.5, y - 24, 7, 21);
      ctx.fillStyle = '#ffcf5c';
      ctx.beginPath(); ctx.ellipse(x + flick * 0.6, y - 29, 2.6, 5 + flick * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff6d6';
      ctx.beginPath(); ctx.ellipse(x + flick * 0.6, y - 28, 1.2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'tra') {
      ctx.fillStyle = '#f2ece2';                // đĩa
      ctx.beginPath(); ctx.ellipse(x, y - 2, 12, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';                // chén
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 15); ctx.lineTo(x + 9, y - 15);
      ctx.quadraticCurveTo(x + 8, y - 3, x, y - 3);
      ctx.quadraticCurveTo(x - 8, y - 3, x - 9, y - 15);
      ctx.fill();
      ctx.fillStyle = '#3b6fb6';
      ctx.fillRect(x - 8, y - 12, 16, 2);
      ctx.fillStyle = '#9b7a3a';                // nước trà
      ctx.beginPath(); ctx.ellipse(x, y - 15, 8.5, 2.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(240,235,225,.45)'; // khói
      ctx.lineWidth = 1.5;
      for (let k = -1; k <= 1; k += 2) {
        ctx.beginPath();
        for (let s = 0; s <= 10; s++) {
          const py = y - 18 - s * 2;
          const px = x + k * 3 + Math.sin(t / 400 + s * 0.6 + k) * 2;
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    } else if (id === 'hoa') {
      ctx.strokeStyle = '#4c8a3c';              // cành
      ctx.lineWidth = 1.5;
      [[-6, -40], [0, -46], [6, -40]].forEach(function (s) {
        ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x + s[0], y + s[1]); ctx.stroke();
      });
      [[-6, -40], [0, -46], [6, -40]].forEach(function (s) { // nụ sen
        const bx = x + s[0], by = y + s[1];
        ctx.fillStyle = '#e88a9a';
        ctx.beginPath(); ctx.moveTo(bx, by - 8); ctx.quadraticCurveTo(bx + 5, by - 2, bx, by + 2); ctx.quadraticCurveTo(bx - 5, by - 2, bx, by - 8); ctx.fill();
        ctx.fillStyle = '#d9677c';
        ctx.beginPath(); ctx.moveTo(bx, by + 2); ctx.quadraticCurveTo(bx + 6, by, bx + 4, by - 4); ctx.quadraticCurveTo(bx + 2, by, bx, by + 2); ctx.fill();
      });
      ctx.fillStyle = '#f4f6f8';                // bình sứ
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 20); ctx.lineTo(x + 4, y - 20);
      ctx.quadraticCurveTo(x + 11, y - 10, x + 6, y); ctx.lineTo(x - 6, y);
      ctx.quadraticCurveTo(x - 11, y - 10, x - 4, y - 20);
      ctx.fill();
      ctx.strokeStyle = '#3b6fb6';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x - 7, y - 10); ctx.quadraticCurveTo(x, y - 6, x + 7, y - 10); ctx.stroke();
    } else if (id === 'den') {
      glow(x, y - 20, 18, 0.6);
      ctx.fillStyle = '#b8862e';                // chân đèn
      ctx.fillRect(x - 2, y - 12, 4, 10);
      ctx.beginPath(); ctx.ellipse(x, y - 2, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d9a441';                // bầu đèn
      ctx.beginPath(); ctx.ellipse(x, y - 13, 10, 5, 0, 0, Math.PI); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 8, y - 13); ctx.lineTo(x + 13, y - 16); ctx.lineTo(x + 9, y - 12); ctx.fill();
      ctx.fillStyle = '#ffb347';
      ctx.beginPath(); ctx.ellipse(x + 12 + flick * 0.5, y - 20, 2.4, 4.5 + flick * 0.5, 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'qua') {
      ctx.fillStyle = '#b8862e';                // chân mâm
      ctx.fillRect(x - 5, y - 5, 10, 5);
      ctx.fillStyle = '#d9a441';                // mâm
      ctx.beginPath(); ctx.ellipse(x, y - 6, 15, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f0d27a';              // nải chuối
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x - 4, y - 18, 10, Math.PI * 0.15, Math.PI * 0.8); ctx.stroke();
      [[-8, -11], [0, -11], [8, -11], [-4, -18], [4, -18], [0, -25]].forEach(function (f, k) { // cam xếp tháp
        ctx.fillStyle = k === 5 ? '#c0392b' : '#f39c12';
        ctx.beginPath(); ctx.arc(x + f[0], y + f[1], 4.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.beginPath(); ctx.arc(x + f[0] - 1.3, y + f[1] - 1.3, 1.3, 0, Math.PI * 2); ctx.fill();
      });
    }
  }

  // ---------- Vẽ công sở ----------
  function drawOfficeWall() {
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
    g.addColorStop(0, '#cfd8e0');
    g.addColorStop(1, '#b7c3cd');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, FLOOR_TOP);
    // trần + đèn
    ctx.fillStyle = '#eef2f5';
    ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = '#fffbe6';
    [250, 550, 850, 1150].forEach(function (x) { ctx.fillRect(x - 60, 30, 120, 8); });
    // cửa sổ nhìn ra phố
    [140, 420, 980, 1260].forEach(function (x) {
      ctx.fillStyle = '#5d6b78';
      ctx.fillRect(x - 84, 90, 168, 200);
      const sky = ctx.createLinearGradient(0, 96, 0, 284);
      sky.addColorStop(0, '#8ec5ea');
      sky.addColorStop(1, '#d8eefa');
      ctx.fillStyle = sky;
      ctx.fillRect(x - 78, 96, 156, 188);
      ctx.fillStyle = 'rgba(90,110,130,.55)';
      ctx.fillRect(x - 70, 200, 30, 84);
      ctx.fillRect(x - 34, 170, 26, 114);
      ctx.fillRect(x + 4, 215, 34, 69);
      ctx.fillRect(x + 44, 185, 28, 99);
      ctx.fillStyle = '#5d6b78';
      ctx.fillRect(x - 2, 96, 4, 188);
      ctx.fillRect(x - 78, 188, 156, 4);
    });
    // bảng trắng KPI
    ctx.fillStyle = '#8a959f';
    ctx.fillRect(588, 96, 224, 150);
    ctx.fillStyle = '#fbfcfd';
    ctx.fillRect(594, 102, 212, 138);
    ctx.strokeStyle = '#3b6fb6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(610, 220); ctx.lineTo(650, 190); ctx.lineTo(690, 205); ctx.lineTo(740, 150); ctx.lineTo(790, 125);
    ctx.stroke();
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('KPI Q4', 606, 108);
    // đồng hồ (giờ thật)
    const d = new Date();
    const cx = 700, cy = 320;
    ctx.fillStyle = '#fbfcfd';
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5d6b78';
    ctx.lineWidth = 3;
    ctx.stroke();
    const hand = function (a, len, w) {
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(a) * len, cy - Math.cos(a) * len); ctx.stroke();
    };
    ctx.strokeStyle = '#2b2f36';
    hand(((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2, 12, 3);
    hand(d.getMinutes() / 60 * Math.PI * 2, 18, 2);
    // biển pantry
    ctx.fillStyle = '#2b2f36';
    ctx.fillRect(1070, 300, 100, 30);
    ctx.fillStyle = '#f2c230';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☕ PANTRY', 1120, 315);
    // chân tường
    ctx.fillStyle = '#7d8a96';
    ctx.fillRect(0, FLOOR_TOP - 14, W, 14);
  }

  function drawOfficeFloor() {
    const tile = 70;
    for (let y = FLOOR_TOP; y < H; y += tile) {
      for (let x = 0; x < W; x += tile) {
        const odd = ((x / tile) + Math.floor((y - FLOOR_TOP) / tile)) % 2;
        ctx.fillStyle = odd ? '#a9b1b8' : '#b3bbc2';
        ctx.fillRect(x, y, tile, tile);
      }
    }
    ctx.strokeStyle = 'rgba(60,70,80,.18)';
    ctx.lineWidth = 1;
    for (let y = FLOOR_TOP; y <= H; y += tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x <= W; x += tile) { ctx.beginPath(); ctx.moveTo(x, FLOOR_TOP); ctx.lineTo(x, H); ctx.stroke(); }

    // pantry: gạch trắng
    for (let y = FLOOR_TOP; y < PANTRY.y1; y += 35) {
      for (let x = PANTRY.x0; x < W; x += 35) {
        ctx.fillStyle = ((x - PANTRY.x0) / 35 + (y - FLOOR_TOP) / 35) % 2 ? '#e9ecef' : '#dde2e6';
        ctx.fillRect(x, y, 35, 35);
      }
    }
    // phòng họp: thảm xanh
    ctx.fillStyle = '#6d7f99';
    ctx.fillRect(MEET.x0, MEET.y0, W - MEET.x0, H - MEET.y0);
    ctx.strokeStyle = '#55657c';
    ctx.lineWidth = 4;
    ctx.strokeRect(MEET.x0 + 10, MEET.y0 + 10, W - MEET.x0 - 20, H - MEET.y0 - 20);
    // ranh giới các khu
    ctx.strokeStyle = 'rgba(60,70,80,.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ZONE_X, FLOOR_TOP); ctx.lineTo(ZONE_X, H);
    ctx.stroke();
  }

  // Quầy pantry: máy cà phê, bình nước, lò vi sóng, tủ lạnh.
  function drawPantryCounter() {
    ctx.fillStyle = '#dfe5ea';
    ctx.fillRect(1270, 360, 60, 132);                       // tủ lạnh
    ctx.strokeStyle = '#aab4bd';
    ctx.lineWidth = 2;
    ctx.strokeRect(1270, 360, 60, 132);
    ctx.beginPath(); ctx.moveTo(1270, 410); ctx.lineTo(1330, 410); ctx.stroke();
    ctx.fillStyle = '#e6e9ec';
    ctx.fillRect(960, 446, 310, 46);                         // thân quầy
    ctx.fillStyle = '#cfd5db';
    ctx.fillRect(956, 440, 318, 8);                          // mặt quầy
    ctx.strokeStyle = '#b9c2ca';
    ctx.lineWidth = 1.5;
    for (let x = 1030; x < 1270; x += 70) { ctx.beginPath(); ctx.moveTo(x, 450); ctx.lineTo(x, 490); ctx.stroke(); }
    ctx.fillStyle = '#2b2f36';
    ctx.fillRect(980, 396, 44, 44);                          // máy pha cà phê
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.arc(1014, 406, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(994, 428, 12, 12);
    ctx.fillStyle = '#9fd3f0';
    ctx.fillRect(1076, 392, 28, 36);                         // bình nước
    ctx.fillStyle = '#e8edf1';
    ctx.fillRect(1072, 426, 36, 14);
    ctx.fillStyle = '#3a3f45';
    ctx.fillRect(1150, 410, 60, 30);                         // lò vi sóng
    ctx.fillStyle = '#7fa6c4';
    ctx.fillRect(1156, 415, 36, 20);
  }

  function drawRoundTable() {
    const t = ROUND_TABLE;
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(t.x, t.y + 4, 40, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7d8a96';
    ctx.fillRect(t.x - 3, t.y - 26, 6, 28);
    ctx.fillStyle = '#f2ece2';
    ctx.beginPath(); ctx.ellipse(t.x, t.y - 28, 42, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9bfae';
    ctx.lineWidth = 2;
    ctx.stroke();
    [-62, 62].forEach(function (dx) { // ghế đẩu
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.ellipse(t.x + dx, t.y - 10, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7d8a96';
      ctx.fillRect(t.x + dx - 2, t.y - 6, 4, 10);
    });
  }

  function drawMeetTable() {
    const t = MEET_TABLE;
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(t.x, t.y + 14, 156, 44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6b4530';
    ctx.beginPath(); ctx.ellipse(t.x, t.y + 6, 152, 44, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a5a3c';
    ctx.beginPath(); ctx.ellipse(t.x, t.y, 150, 40, 0, 0, Math.PI * 2); ctx.fill();
    [-80, 0, 80].forEach(function (dx) { // laptop + giấy tờ
      ctx.fillStyle = '#c9ced4';
      ctx.fillRect(t.x + dx - 14, t.y - 10, 28, 16);
      ctx.fillStyle = '#4f8fd0';
      ctx.fillRect(t.x + dx - 11, t.y - 8, 22, 10);
    });
  }

  function drawMeetSign() {
    ctx.fillStyle = '#5d6b78';
    ctx.fillRect(1346, 796, 4, 40);
    ctx.fillStyle = '#fbfcfd';
    ctx.fillRect(1296, 772, 100, 28);
    ctx.strokeStyle = '#5d6b78';
    ctx.lineWidth = 2;
    ctx.strokeRect(1296, 772, 100, 28);
    ctx.fillStyle = '#2b2f36';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PHÒNG HỌP', 1346, 786);
  }

  function drawDesk(d) {
    const x = d.x, y = d.y;
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fillRect(x - 84, y + 6, 168, 10);
    ctx.fillStyle = '#6b7680';
    ctx.fillRect(x - 76, y - 10, 6, 22);
    ctx.fillRect(x + 70, y - 10, 6, 22);
    ctx.fillStyle = '#c9a77c';
    ctx.fillRect(x - 82, y - 44, 164, 34);
    ctx.fillStyle = '#a8865d';
    ctx.fillRect(x - 82, y - 12, 164, 6);
    // màn hình
    ctx.fillStyle = '#2b2f36';
    ctx.fillRect(x - 30, y - 92, 60, 40);
    ctx.fillRect(x - 4, y - 52, 8, 10);
    ctx.fillRect(x - 16, y - 44, 32, 4);
    ctx.fillStyle = '#4f8fd0';
    ctx.fillRect(x - 26, y - 88, 52, 32);
    // bàn phím + cốc
    ctx.fillStyle = '#e4e7ea';
    ctx.fillRect(x - 24, y - 32, 48, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 44, y - 40, 12, 14);
  }

  // Ghế làm việc có lưng tựa, chân xoay.
  function drawChair(c) {
    const x = c.x, y = c.y;
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(x, y + 14, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a3f45';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 12);
    ctx.moveTo(x - 16, y + 14); ctx.lineTo(x + 16, y + 14);
    ctx.stroke();
    ctx.fillStyle = '#2f343a';
    ctx.fillRect(x - 18, y - 44, 36, 36);
    ctx.fillStyle = '#3d434a';
    ctx.beginPath(); ctx.ellipse(x, y - 4, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  }

  function drawPlant(p) {
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8c5a3c';
    ctx.fillRect(p.x - 14, p.y - 26, 28, 26);
    ctx.fillStyle = '#3f7d46';
    [[-12, -40], [0, -52], [12, -40], [-6, -60], [6, -60]].forEach(function (l) {
      ctx.beginPath(); ctx.ellipse(p.x + l[0], p.y + l[1], 9, 16, l[0] * 0.04, 0, Math.PI * 2); ctx.fill();
    });
  }

  function drawPillar(p) {
    const top = 20;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 36, 12, 0, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createLinearGradient(p.x - 24, 0, p.x + 24, 0);
    g.addColorStop(0, '#5a120c');
    g.addColorStop(0.4, '#a3271b');
    g.addColorStop(1, '#4a0f0a');
    ctx.fillStyle = g;
    ctx.fillRect(p.x - 24, top, 48, p.y - top - 10);
    ctx.fillStyle = '#c9963a';
    ctx.fillRect(p.x - 28, top + 30, 56, 6);
    ctx.fillStyle = '#3b2414';
    ctx.beginPath(); ctx.ellipse(p.x, p.y - 8, 32, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c9963a';
    ctx.fillRect(p.x - 32, p.y - 14, 64, 4);
  }

  function drawUrn(t) {
    const x = URN.x, y = URN.y;
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(x, y, 44, 14, 0, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createLinearGradient(x - 40, 0, x + 40, 0);
    g.addColorStop(0, '#4a3510'); g.addColorStop(0.5, '#a07a2c'); g.addColorStop(1, '#3d2b0c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 38, y - 52);
    ctx.quadraticCurveTo(x - 46, y - 14, x - 24, y - 4);
    ctx.lineTo(x + 24, y - 4);
    ctx.quadraticCurveTo(x + 46, y - 14, x + 38, y - 52);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6b4e18';
    ctx.beginPath(); ctx.ellipse(x, y - 52, 40, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a10';
    ctx.beginPath(); ctx.ellipse(x, y - 52, 33, 6, 0, 0, Math.PI * 2); ctx.fill();
    // nhang + khói
    [-10, 0, 10].forEach(function (dx, i) {
      const sx = x + dx, sy = y - 52;
      ctx.strokeStyle = '#8b2a1a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + dx * 0.2, sy - 46); ctx.stroke();
      const tx = sx + dx * 0.2, ty = sy - 46;
      ctx.fillStyle = 'rgba(255,120,40,' + (0.7 + Math.sin(t / 200 + i) * 0.3) + ')';
      ctx.beginPath(); ctx.arc(tx, ty, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(230,220,210,.22)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      for (let k = 1; k <= 12; k++) {
        ctx.lineTo(tx + Math.sin(t / 700 + k * 0.6 + i) * k * 1.4, ty - k * 9);
      }
      ctx.stroke();
    });
  }

  // ---------- Vẽ nhân vật ----------
  const ROBE = '#8197ad';
  const ROBE_DARK = '#61768c';
  const SKIN = '#f0c9a2';
  const SHIRT = '#e9eef3';
  const SHIRT_LINE = '#9aa7b4';
  const PANTS = '#34404e';
  const SKIRT = '#3a4660';
  // Đặt lại mỗi lần vẽ một nhân vật (drawMonk).
  let officeLook = false;
  let darkFace = false;
  let slapCheek = false;
  let wearing = new Set(); // vật phẩm đang mặc của nhân vật đang vẽ (chỉ hiện ở chùa)
  let robeMain = ROBE;
  let robeShade = ROBE_DARK;
  let robeText = '#ffffff';
  let female = false;

  function robeShape(topY, botY, topW, botW) {
    ctx.beginPath();
    ctx.moveTo(-topW / 2, topY + 6);
    ctx.quadraticCurveTo(-topW / 2, topY, 0, topY);
    ctx.quadraticCurveTo(topW / 2, topY, topW / 2, topY + 6);
    ctx.lineTo(botW / 2, botY);
    ctx.quadraticCurveTo(0, botY + 5, -botW / 2, botY);
    ctx.closePath();
  }

  function torso(topY, botY, days) {
    if (officeLook) { shirt(topY, botY); return; }
    ctx.fillStyle = robeMain;
    robeShape(topY, botY, 26, 34);
    ctx.fill();
    ctx.strokeStyle = robeShade;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // vạt áo chéo
    ctx.beginPath(); ctx.moveTo(-6, topY + 1); ctx.lineTo(5, topY + 14); ctx.stroke();
    if (wearing.has('casa')) { // dải cà sa vắt chéo vai
      ctx.strokeStyle = '#8a4a10';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-11, topY + 4); ctx.lineTo(10, botY - 3); ctx.stroke();
    }
    if (wearing.has('beads')) { // chuỗi hạt quanh cổ
      ctx.fillStyle = '#6b3a1a';
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * i / 10;
        ctx.beginPath(); ctx.arc(Math.cos(a) * 8, topY + 2 + Math.sin(a) * 10, 1.7, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(0, topY + 14, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    if (wearing.has('garland')) { // vòng hoa cúc vàng
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI * i / 8;
        ctx.fillStyle = i % 2 ? '#e8902a' : '#f2c230';
        ctx.beginPath(); ctx.arc(Math.cos(a) * 9, topY + 2 + Math.sin(a) * 11, 2.8, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (wearing.has('bag')) { // tay nải đeo chéo
      ctx.strokeStyle = '#8c6239';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(10, topY + 3); ctx.lineTo(-12, botY - 8); ctx.stroke();
      ctx.fillStyle = '#a77b4f';
      ctx.fillRect(-22, botY - 16, 12, 11);
      ctx.strokeStyle = '#6e4a28';
      ctx.lineWidth = 1;
      ctx.strokeRect(-22, botY - 16, 12, 11);
    }
    // số điểm chép kinh trên áo
    ctx.fillStyle = robeText;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(days), 0, (topY + botY) / 2 + 6);
  }

  // Áo sơ mi + cà vạt (công sở).
  function shirt(topY, botY) {
    ctx.fillStyle = SHIRT;
    robeShape(topY, botY, 26, 30);
    ctx.fill();
    ctx.strokeStyle = SHIRT_LINE;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (female) { // nơ ở cổ
      const ny = topY + 5;
      ctx.fillStyle = '#d6456b';
      ctx.beginPath();
      ctx.moveTo(0, ny); ctx.lineTo(-7, ny - 4); ctx.lineTo(-7, ny + 4); ctx.closePath();
      ctx.moveTo(0, ny); ctx.lineTo(7, ny - 4); ctx.lineTo(7, ny + 4); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a8304f';
      ctx.beginPath(); ctx.arc(0, ny, 2, 0, Math.PI * 2); ctx.fill();
      return;
    }
    ctx.fillStyle = '#b03a2e';
    ctx.beginPath();
    ctx.moveTo(-2.5, topY + 3); ctx.lineTo(2.5, topY + 3); ctx.lineTo(3.5, topY + 16);
    ctx.lineTo(0, topY + 20); ctx.lineTo(-3.5, topY + 16);
    ctx.closePath(); ctx.fill();
  }

  function head(y) {
    if (wearing.has('rainbow')) { // cầu vồng sau đầu
      ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#8e44ad'].forEach(function (c, i) {
        ctx.strokeStyle = c;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, y + 6, 28 - i * 2.3, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      });
    }
    if (wearing.has('halo')) { // hào quang sau đầu
      const g = ctx.createRadialGradient(0, y, 10, 0, y, 24);
      g.addColorStop(0, 'rgba(255,225,140,.75)');
      g.addColorStop(1, 'rgba(255,225,140,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, y, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e8b64c';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, y, 18, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = darkFace ? '#7a7a7a' : SKIN;
    ctx.beginPath(); ctx.arc(0, y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150,100,70,.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (slapCheek) { // má đỏ sau khi bị tát
      ctx.fillStyle = 'rgba(220,40,40,.65)';
      ctx.beginPath(); ctx.ellipse(7, y + 4, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (wearing.has('hat')) { // mũ ni nâu của nhà sư: chụp kín đầu, hai vạt che tai
      ctx.fillStyle = '#7a4a24';
      ctx.beginPath();
      ctx.arc(0, y - 1, 14.5, Math.PI, Math.PI * 2);
      ctx.lineTo(14.5, y + 10); ctx.lineTo(9, y + 10); ctx.lineTo(9, y + 1);
      ctx.lineTo(-9, y + 1); ctx.lineTo(-9, y + 10); ctx.lineTo(-14.5, y + 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5e3819';
      ctx.fillRect(-14.5, y - 3, 29, 3);
    }
    if (wearing.has('flower')) { // hoa cài bên tai
      ctx.fillStyle = '#f19cb7';
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2;
        ctx.beginPath(); ctx.arc(10 + Math.cos(a) * 3.2, y - 8 + Math.sin(a) * 3.2, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#f2c230';
      ctx.beginPath(); ctx.arc(10, y - 8, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    if (wearing.has('nonla')) { // nón lá
      ctx.fillStyle = '#e8d39a';
      ctx.beginPath(); ctx.moveTo(-24, y - 3); ctx.lineTo(0, y - 24); ctx.lineTo(24, y - 3); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b89a55';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-16, y - 10); ctx.lineTo(16, y - 10);
      ctx.moveTo(-8, y - 17); ctx.lineTo(8, y - 17);
      ctx.stroke();
    }
    if (officeLook) { // tóc mái: vòm tóc phủ đỉnh đầu, mép lượn sóng ngang trán (nữ dài hơn nam)
      const ey = y - (female ? 3 : 6);
      const a0 = Math.PI * (female ? 0.92 : 0.97);
      ctx.fillStyle = '#2b2018';
      ctx.beginPath();
      ctx.arc(0, y, 13.6, a0, Math.PI * 3 - a0);
      ctx.quadraticCurveTo(9, ey + 4, 6, ey);
      ctx.quadraticCurveTo(3, ey + 4, 0, ey);
      ctx.quadraticCurveTo(-3, ey + 4, -6, ey);
      ctx.quadraticCurveTo(-9, ey + 4, Math.cos(a0) * 13.6, y + Math.sin(a0) * 13.6);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Đồ cầm tay phải (trừ tích trượng — vẽ riêng vì dài).
  function drawHandItem(t) {
    if (wearing.has('lantern')) {
      ctx.strokeStyle = '#3a2414';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(22, -30); ctx.lineTo(22, -24); ctx.stroke();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.ellipse(22, -15, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8b64c';
      ctx.fillRect(18, -25, 8, 2);
      ctx.fillRect(18, -7, 8, 2);
      ctx.fillStyle = 'rgba(255,200,90,' + (0.35 + Math.sin(t / 200) * 0.15) + ')';
      ctx.beginPath(); ctx.arc(22, -15, 13, 0, Math.PI * 2); ctx.fill();
    } else if (wearing.has('candle')) {
      ctx.fillStyle = '#f2e6c8';
      ctx.fillRect(19, -40, 6, 14);
      ctx.fillStyle = '#ffcf5c';
      ctx.beginPath(); ctx.ellipse(22 + Math.sin(t / 90), -44, 2.5, 5, 0, 0, Math.PI * 2); ctx.fill();
    } else if (wearing.has('bell')) {
      ctx.fillStyle = '#d9a441';
      ctx.beginPath();
      ctx.moveTo(15, -18); ctx.quadraticCurveTo(15, -34, 22, -34); ctx.quadraticCurveTo(29, -34, 29, -18);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a5a1e';
      ctx.beginPath(); ctx.arc(22, -16, 2, 0, Math.PI * 2); ctx.fill();
    } else if (wearing.has('book')) {
      ctx.fillStyle = '#7a3d12';
      ctx.fillRect(16, -36, 12, 15);
      ctx.fillStyle = '#e8b64c';
      ctx.fillRect(18, -33, 8, 1.5);
      ctx.fillRect(18, -29, 8, 1.5);
    }
  }

  // Mèo chùa ngồi bên trái chân.
  function drawCat(x, y) {
    ctx.fillStyle = '#e0a15a';
    ctx.beginPath(); ctx.ellipse(x, y - 8, 9, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - 19, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 21); ctx.lineTo(x - 4, y - 28); ctx.lineTo(x - 1, y - 23);
    ctx.moveTo(x + 6, y - 21); ctx.lineTo(x + 4, y - 28); ctx.lineTo(x + 1, y - 23);
    ctx.fill();
    ctx.strokeStyle = '#e0a15a';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 8, y - 4); ctx.quadraticCurveTo(x + 16, y - 6, x + 13, y - 16); ctx.stroke();
    ctx.fillStyle = '#3a2414';
    ctx.beginPath(); ctx.arc(x - 2, y - 19, 0.9, 0, Math.PI * 2); ctx.arc(x + 2, y - 19, 0.9, 0, Math.PI * 2); ctx.fill();
  }

  // Chim sẻ bay chập chờn bên vai.
  function drawBird(x, y) {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.ellipse(x, y, 6, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 5, y - 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath(); ctx.moveTo(x - 8, y - 3); ctx.lineTo(x - 11, y - 2); ctx.lineTo(x - 8, y - 1); ctx.fill();
    ctx.fillStyle = '#6b4320';
    ctx.beginPath(); ctx.moveTo(x - 1, y - 2); ctx.lineTo(x + 5, y - 8); ctx.lineTo(x + 4, y - 1); ctx.fill();
  }

  // Trả về độ cao đỉnh đầu (để đặt tên/bong bóng chat).
  function drawMonk(p, x, y, t, isMe) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    if (isMe) {
      ctx.strokeStyle = 'rgba(245,217,139,.85)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, 24, 9, 0, 0, Math.PI * 2); ctx.stroke();
    }
    let topOfHead;
    officeLook = scene === 'office';
    female = officeLook && p.gender === 'f'; // ở chùa ai cũng như nhau
    darkFace = (blackFaces.get(p.id) || 0) > Date.now();
    const slapAgo = Date.now() - (slaps.get(p.id) || 0);
    slapCheek = slapAgo < 3000;
    if (slapAgo < 600) ctx.translate(Math.sin(t / 22) * 3 * (1 - slapAgo / 600), 0); // rung người
    wearing = officeLook ? new Set() : new Set(p.wear || []);
    const robeId = officeLook ? null : (p.wear || []).find(function (w) { return ROBE_STYLES[w]; });
    const robeStyle = ROBE_STYLES[robeId] || [ROBE, ROBE_DARK, '#ffffff'];
    robeMain = robeStyle[0];
    robeShade = robeStyle[1];
    robeText = robeStyle[2];

    if (p.pose === 'sleep') {
      // nằm ngang dưới gầm bàn, đầu bên trái
      ctx.fillStyle = officeLook ? (female ? SKIRT : PANTS) : robeShade;
      ctx.fillRect(4, -13, 30, 10);
      ctx.fillStyle = officeLook ? SHIRT : robeMain;
      ctx.fillRect(-20, -16, 28, 14);
      ctx.strokeStyle = officeLook ? SHIRT_LINE : robeShade;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-20, -16, 28, 14);
      ctx.save();
      ctx.translate(-31, 0);
      head(-11);
      ctx.restore();
      topOfHead = -26;
    } else if (p.pose === 'sit') {
      ctx.fillStyle = officeLook ? (female ? SKIRT : PANTS) : robeShade;
      ctx.beginPath(); ctx.ellipse(0, -8, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
      torso(-46, -10, p.days);
      ctx.fillStyle = SKIN;
      ctx.beginPath(); ctx.ellipse(0, -14, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      head(-58);
      topOfHead = -71;
    } else if (p.pose === 'eat') {
      // ngồi, cứ ~2 giây đưa món lên miệng một lần
      ctx.fillStyle = officeLook ? (female ? SKIRT : PANTS) : robeShade;
      ctx.beginPath(); ctx.ellipse(0, -8, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
      torso(-46, -10, p.days);
      const ph = ((t + (p.seed || 0) * 2000) % 2000) / 2000;
      const lift = ph < 0.25 ? ph / 0.25 : ph < 0.45 ? 1 : ph < 0.7 ? 1 - (ph - 0.45) / 0.25 : 0;
      const fy = -16 - lift * 24;
      const food = FOODS.concat(DRINKS).find(function (f) { return f.id === p.food; }) || FOODS[0];
      ctx.fillStyle = SKIN;
      ctx.beginPath(); ctx.ellipse(0, fy + 6, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.emoji, 0, fy);
      head(-58);
      topOfHead = -71;
    } else if (p.pose === 'kneel') {
      // Nhìn thẳng (hướng về tượng): quỳ thẳng lưng, cẳng chân gập dưới thân.
      ctx.fillStyle = robeShade;
      ctx.beginPath(); ctx.ellipse(0, -6, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
      torso(-46, -8, p.days);
      // tay chắp trước ngực
      ctx.fillStyle = SKIN;
      ctx.beginPath(); ctx.ellipse(0, -32, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
      head(-58);
      topOfHead = -71;
    } else if (p.pose === 'bow') {
      const dir = p.dir || 1;
      // cẳng chân gập phía sau
      ctx.fillStyle = robeShade;
      ctx.beginPath(); ctx.ellipse(-dir * 8, -6, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
      const ph = ((t + (p.seed || 0) * 3000) % 3200) / 3200;
      const bend = ph < 0.35 ? ph / 0.35 : ph < 0.65 ? 1 : 1 - (ph - 0.65) / 0.35;
      const a = dir * bend * 1.25;
      ctx.save();
      ctx.translate(0, -12);
      ctx.rotate(a);
      torso(-38, 0, p.days);
      // tay chắp
      ctx.fillStyle = SKIN;
      ctx.beginPath(); ctx.ellipse(dir * 10, -26, 4, 7, dir * 0.4, 0, Math.PI * 2); ctx.fill();
      head(-50);
      ctx.restore();
      topOfHead = -12 - Math.cos(a) * 63;
    } else {
      const walking = p.pose === 'walk';
      const sw = walking ? Math.sin(t / 90) : 0;
      const bob = walking ? Math.abs(Math.sin(t / 90)) * 2 : 0;
      if (officeLook && female) {
        // chân + váy
        ctx.fillStyle = SKIN;
        ctx.fillRect(-7 + sw * 4, -16, 5, 13);
        ctx.fillRect(2 - sw * 4, -16, 5, 13);
        ctx.fillStyle = SKIRT;
        ctx.beginPath();
        ctx.moveTo(-12, -26 - bob); ctx.lineTo(12, -26 - bob);
        ctx.lineTo(17, -12 - bob); ctx.lineTo(-17, -12 - bob);
        ctx.closePath(); ctx.fill();
      } else if (officeLook) {
        // quần dài
        ctx.fillStyle = PANTS;
        ctx.fillRect(-10 + sw * 4, -26 - bob, 9, 23 + bob);
        ctx.fillRect(1 - sw * 4, -26 - bob, 9, 23 + bob);
      }
      ctx.fillStyle = officeLook ? '#1d1d1f' : '#4a3a2e';
      ctx.beginPath(); ctx.ellipse(-6 + sw * 5, -3, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(6 - sw * 5, -3, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(0, -bob);
      torso(-50, officeLook ? -22 : -5, p.days);
      ctx.fillStyle = SKIN;
      if (officeLook) { // tay buông hai bên
        ctx.beginPath(); ctx.ellipse(-15, -26, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(15, -26, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
      } else { // tay chắp
        ctx.beginPath(); ctx.ellipse(0, -34, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
      }
      head(-62);
      ctx.restore();
      topOfHead = -75 - bob;
    }
    if (p.pose !== 'bow' && p.pose !== 'sleep') drawHandItem(t);
    if (wearing.has('cat')) drawCat(-34, 0);
    if (wearing.has('bird')) drawBird(-30, -40 - Math.abs(Math.sin(t / 300)) * 4);
    if (wearing.has('staff') && p.pose !== 'bow' && p.pose !== 'sleep') { // tích trượng cầm bên phải
      ctx.strokeStyle = '#8a5a2b';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(22, -2); ctx.lineTo(22, -88); ctx.stroke();
      ctx.strokeStyle = '#e8b64c';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(22, -93, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(17, -88, 2.5, 0, Math.PI * 2); ctx.arc(27, -88, 2.5, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    return y + topOfHead;
  }

  function drawLabel(name, x, y) {
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(30,15,5,.85)';
    ctx.strokeText(name, x, y);
    ctx.fillStyle = '#f5d98b';
    ctx.fillText(name, x, y);
  }

  function wrap(text, maxW) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(function (w) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    // từ quá dài → cắt cứng
    const out = [];
    lines.forEach(function (l) {
      while (ctx.measureText(l).width > maxW && l.length > 1) {
        let n = l.length;
        while (n > 1 && ctx.measureText(l.slice(0, n)).width > maxW) n--;
        out.push(l.slice(0, n));
        l = l.slice(n);
      }
      out.push(l);
    });
    return out;
  }

  // Hoa sen (cùng hình với bông sen ở màn chào), tâm đáy tại (x, y), nhấp nhô + toả sáng nhẹ.
  const LOTUS_PETALS = window.Path2D ? [
    ['#e88a9a', new Path2D('M32 4 C40 14 40 28 32 38 C24 28 24 14 32 4Z')],
    ['#d9677c', new Path2D('M32 38 C22 34 14 24 14 12 C24 16 30 26 32 38Z')],
    ['#d9677c', new Path2D('M32 38 C42 34 50 24 50 12 C40 16 34 26 32 38Z')],
    ['#c4566b', new Path2D('M32 38 C20 40 8 34 2 24 C14 22 26 30 32 38Z')],
    ['#c4566b', new Path2D('M32 38 C44 40 56 34 62 24 C50 22 38 30 32 38Z')],
  ] : [];
  function drawLotus(x, y, t) {
    const by = y + Math.sin(t / 400) * 1.5;
    const g = ctx.createRadialGradient(x, by - 8, 2, x, by - 8, 18);
    g.addColorStop(0, 'rgba(255,225,140,.55)');
    g.addColorStop(1, 'rgba(255,225,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, by - 8, 18, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(x, by);
    ctx.scale(0.4, 0.4);
    ctx.translate(-32, -40);
    LOTUS_PETALS.forEach(function (p) { ctx.fillStyle = p[0]; ctx.fill(p[1]); });
    ctx.restore();
  }

  // Khói bốc trên đầu khi stress cao.
  function drawSmoke(x, y, t) {
    for (let i = 0; i < 3; i++) {
      const ph = ((t / 1200) + i / 3) % 1;
      ctx.fillStyle = 'rgba(110,110,110,' + (0.55 * (1 - ph)) + ')';
      ctx.beginPath(); ctx.arc(x + Math.sin(ph * 6 + i) * 5, y - ph * 22, 4 + ph * 5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawCaught(x, y) {
    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.strokeText('BỊ BẮT!', x, y);
    ctx.fillStyle = '#c0392b';
    ctx.fillText('BỊ BẮT!', x, y);
    ctx.restore();
  }

  // Sếp: vest đen, cà vạt đỏ, kính đen, đi ngang lối giữa.
  function drawBoss(x, y, t) {
    const sw = Math.sin(t / 110);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1f27';
    ctx.fillRect(-11 + sw * 4, -30, 10, 27);
    ctx.fillRect(1 - sw * 4, -30, 10, 27);
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(-6 + sw * 5, -3, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6 - sw * 5, -3, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#232a36';
    robeShape(-58, -26, 32, 36);
    ctx.fill();
    ctx.fillStyle = '#f4f6f8';
    ctx.beginPath(); ctx.moveTo(-6, -58); ctx.lineTo(6, -58); ctx.lineTo(0, -44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-2, -55, 4, 14);
    ctx.fillStyle = SKIN;
    ctx.beginPath(); ctx.arc(0, -71, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(-11, -75, 9, 5);
    ctx.fillRect(2, -75, 9, 5);
    ctx.fillRect(-2, -74, 4, 2);
    ctx.restore();
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.strokeText('SẾP', x, y - 90);
    ctx.fillStyle = '#c0392b';
    ctx.fillText('SẾP', x, y - 90);
  }

  function drawZzz(x, y, t) {
    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(70,90,140,.9)';
    ['z', 'z', 'Z'].forEach(function (ch, i) {
      const ph = ((t / 900) + i * 0.33) % 1;
      ctx.globalAlpha = 1 - ph;
      ctx.fillText(ch, x + i * 6 + ph * 6, y - i * 6 - ph * 10);
    });
    ctx.restore();
  }

  function drawPow(x, y, ago) {
    const s = ago < 150 ? 0.6 + ago / 150 * 0.6 : 1.2 - Math.min(0.2, (ago - 150) / 850 * 0.2);
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, ago - 700) / 300);
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.strokeText('BỐP!', 0, 0);
    ctx.fillStyle = '#d62828';
    ctx.fillText('BỐP!', 0, 0);
    ctx.restore();
  }

  function drawBubble(text, x, y, until) {
    ctx.font = '13px sans-serif';
    const lines = wrap(text, 170);
    const lh = 17;
    let w = 0;
    lines.forEach(function (l) { w = Math.max(w, ctx.measureText(l).width); });
    w += 16;
    const h = lines.length * lh + 10;
    const bx = x - w / 2, by = y - h - 8;
    const fade = Math.min(1, (until - Date.now()) / 600);
    ctx.globalAlpha = Math.max(0, fade);
    ctx.fillStyle = 'rgba(255,250,238,.96)';
    ctx.strokeStyle = '#c9963a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const r = 8;
    ctx.moveTo(bx + r, by);
    ctx.arcTo(bx + w, by, bx + w, by + h, r);
    ctx.arcTo(bx + w, by + h, bx, by + h, r);
    ctx.lineTo(x + 6, by + h);
    ctx.lineTo(x, by + h + 7);
    ctx.lineTo(x - 6, by + h);
    ctx.arcTo(bx, by + h, bx, by, r);
    ctx.arcTo(bx, by, bx + w, by, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3a2414';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    lines.forEach(function (l, i) { ctx.fillText(l, x, by + 5 + i * lh); });
    ctx.globalAlpha = 1;
  }

  // ---------- Vòng lặp ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (started) {
      update(dt);
      checkBoss(Date.now());
      syncState(now);
    }
    updateCamera();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#1e0f06';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const s = dpr * scale;
    ctx.setTransform(s, 0, 0, s, -camX * s, -camY * s);

    // sắp xếp theo chiều sâu (y)
    const items = [];
    if (scene === 'office') {
      drawOfficeWall();
      drawOfficeFloor();
      DESKS.forEach(function (d) { items.push({ y: d.y, draw: function () { drawDesk(d); } }); });
      CHAIRS.forEach(function (c) { items.push({ y: c.y, draw: function () { drawChair(c); } }); });
      PLANTS.forEach(function (p) { items.push({ y: p.y, draw: function () { drawPlant(p); } }); });
      items.push({ y: 492, draw: drawPantryCounter });
      items.push({ y: ROUND_TABLE.y, draw: drawRoundTable });
      items.push({ y: MEET_TABLE.y, draw: drawMeetTable });
      items.push({ y: 836, draw: drawMeetSign });
      MEET_CHAIRS.forEach(function (c) { items.push({ y: c.y, draw: function () { drawChair(c); } }); });
      const bp = bossPos(Date.now());
      if (bp) items.push({ y: bp.y, draw: function () { drawBoss(bp.x, bp.y, now); } });
    } else {
      drawWall(now);
      drawFloor();
      drawAltar(now);
      PILLARS.forEach(function (p) { items.push({ y: p.y, draw: function () { drawPillar(p); } }); });
      items.push({ y: URN.y, draw: function () { drawUrn(now); } });
    }
    const actors = [];
    if (started) actors.push({ p: me, x: me.x, y: me.y, isMe: true });
    others.forEach(function (o) { actors.push({ p: o, x: o.rx, y: o.ry, isMe: false }); });
    actors.forEach(function (a) {
      const key = a.p.pose === 'sleep' ? a.y - 10 : a.y; // ngủ dưới gầm bàn → vẽ trước bàn
      items.push({ y: key, draw: function () { a.top = drawMonk(a.p, a.x, a.y, now, a.isMe); } });
    });
    items.sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (it) { it.draw(); });

    // tên + bong bóng chat luôn nằm trên cùng
    actors.forEach(function (a) {
      const lotus = scene === 'temple' && (a.isMe ? Date.now() < (me.lotusUntil || 0) : !!a.p.lotus);
      let top = a.top;
      if (lotus) { drawLotus(a.x, top - 9, now); top -= 20; }
      const slapAgo = Date.now() - (slaps.get(a.p.id) || 0);
      if (slapAgo < 1000) drawPow(a.x, top - 22, slapAgo);
      if (a.p.pose === 'sleep') drawZzz(a.x - 18, top - 6, now);
      if (scene === 'office' && a.p.stress >= 70) drawSmoke(a.x, top - 2, now);
      const caught = a.isMe ? Date.now() < me.caughtUntil : !!a.p.caught;
      if (caught) { drawCaught(a.x, top - 30); }
      drawLabel(a.p.name, a.x, top - 4);
      const b = bubbles.get(a.p.id);
      if (b) drawBubble(b.text, a.x, top - 18, b.until);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
