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
  const CUSHIONS = [];
  [600, 700].forEach(function (y) {
    [520, 610, 790, 880].forEach(function (x) { CUSHIONS.push({ x: x, y: y }); });
  });

  // ---------- Công sở ----------
  const DEFAULT_OFFICE_NAME = 'Nhân viên';
  const BADMOUTH_MS = 10000;     // mặt người bị nói xấu đen trong 10 giây
  const REPENT_DELAY_MS = 10000; // 10 giây sau khi nói xấu / nói bậy → nhắc đi chùa sám hối
  const DESKS = [];
  [580, 820].forEach(function (y) {
    [300, 560, 840, 1100].forEach(function (x) { DESKS.push({ x: x, y: y }); });
  });
  const CHAIRS = DESKS.map(function (d) { return { x: d.x, y: d.y + 48 }; });
  const PLANTS = [{ x: 70, y: 490 }, { x: 1330, y: 490 }];
  const OFFICE_OBSTACLES = PLANTS.map(function (p) { return { x: p.x, y: p.y - 6, r: 22 }; });
  DESKS.forEach(function (d) {
    OFFICE_OBSTACLES.push({ x: d.x - 50, y: d.y - 20, r: 34 }, { x: d.x + 50, y: d.y - 20, r: 34 });
  });

  // ---------- Lưu trữ local ----------
  const store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } },
  };
  const K = {
    name: 'kxtp_name',
    days: 'kxtp_days',
    doneDate: 'kxtp_done_date',
    draft: 'kxtp_draft',
    music: 'kxtp_music',
    officeName: 'kxtp_office_name',
    gender: 'kxtp_gender',
  };

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function todaySutra() {
    const d = new Date();
    const dayNo = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return window.SUTRAS[dayNo % window.SUTRAS.length];
  }
  function doneToday() { return store.get(K.doneDate) === todayStr(); }
  function getDays() { return parseInt(store.get(K.days), 10) || 0; }

  // ---------- Trạng thái ----------
  const me = {
    id: Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8),
    name: DEFAULT_NAME,
    x: 700, y: 840, dir: 1,
    pose: 'stand',
    gender: store.get(K.gender) === 'f' ? 'f' : 'm',
    days: getDays(),
    target: null,
  };
  const others = new Map();
  const bubbles = new Map();
  const keys = new Set();
  const blackFaces = new Map(); // id → thời điểm hết mặt đen
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
    } else if (k === '1') setPose('stand');
    else if (k === '2') setPose('sit');
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
      CHAIRS.forEach(function (ch) {
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
      if (doneToday()) {
        // Đã chép kinh hôm nay mà nói bậy → huỷ bài hôm nay, phải chép lại.
        cancelToday();
        toast('Tâm chưa tịnh — bạn phải chép lại kinh hôm nay. Tin nhắn chưa được gửi.', 6000);
      } else {
        toast('Lời nói chưa thanh tịnh — tin nhắn có từ ngữ không phù hợp nên chưa được gửi.');
      }
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
      .then(function () { if (timer) clearTimeout(timer); });
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
      dir: me.dir, pose: me.pose, days: me.days, gender: me.gender,
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

  // Nói xấu đồng nghiệp: chọn một người đang ở văn phòng → mặt họ đen 10 giây.
  $('btn-badmouth').addEventListener('click', function () {
    if (others.size === 0) { toast('Chưa có đồng nghiệp nào trong văn phòng.'); return; }
    const list = $('badmouth-list');
    list.textContent = '';
    others.forEach(function (o, id) {
      const b = document.createElement('button');
      b.textContent = o.name || DEFAULT_OFFICE_NAME;
      b.addEventListener('click', function () { badmouth(id, o.name); });
      list.appendChild(b);
    });
    $('badmouth').classList.remove('hidden');
    keys.clear();
  });
  $('badmouth-close').addEventListener('click', function () { $('badmouth').classList.add('hidden'); });

  function badmouth(id, name) {
    $('badmouth').classList.add('hidden');
    blackFaces.set(id, Date.now() + BADMOUTH_MS);
    post('/api/badmouth', { id: me.id, target: id });
    toast('Bạn vừa nói xấu ' + (name || DEFAULT_OFFICE_NAME) + '…');
    scheduleRepent();
  }

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

  // Tâm chưa tịnh (nói bậy / trả lời sai câu hỏi) → huỷ bài chép hôm nay, trừ 1 ngày.
  function cancelToday() {
    if (!doneToday()) return;
    const days = Math.max(0, getDays() - 1);
    store.set(K.days, String(days));
    store.del(K.doneDate);
    me.days = days;
    me.lotusUntil = 0;
    lastSent = '';
    updateSutraBadge();
  }

  function updateSutraBadge() {
    $('sutra-badge').textContent = doneToday() ? '✓' : '•';
    $('sutra-badge').style.color = doneToday() ? '#7fd38a' : '#ff9a6a';
  }

  function setStatus(text, cls) {
    sutraStatus.textContent = text;
    sutraStatus.className = cls || '';
  }

  function openSutra() {
    currentSutra = todaySutra();
    $('sutra-title').textContent = currentSutra.title;
    $('sutra-text').textContent = currentSutra.text;
    $('sutra-meta').textContent = 'Đã hoàn thành ' + getDays() + ' ngày · Hôm nay ' + todayStr();
    const draft = JSON.parse(store.get(K.draft) || 'null');
    sutraInput.value = draft && draft.date === todayStr() ? draft.text : '';
    if (doneToday()) {
      setStatus('🙏 Hôm nay bạn đã chép kinh xong. Hẹn ngày mai!', 'ok');
      sutraInput.disabled = true;
      $('sutra-check').disabled = true;
    } else {
      setStatus('');
      sutraInput.disabled = false;
      $('sutra-check').disabled = false;
    }
    $('sutra').classList.remove('hidden');
    keys.clear();
  }

  $('btn-sutra').addEventListener('click', openSutra);
  $('sutra-close').addEventListener('click', function () {
    $('sutra').classList.add('hidden');
    if (quizPending) {
      quizPending = false;
      setTimeout(showQuiz, QUIZ_DELAY_MS);
    }
  });

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
    if (!doneToday()) return; // đã bị huỷ bài (nói bậy) trong lúc chờ
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
        (right ? '' : '\nTâm chưa tịnh — bạn phải chép lại kinh hôm nay.');
      $('quiz-answer').className = right ? 'ok' : 'err';
      if (!right) cancelToday();
      $('quiz-close').textContent = right ? 'Nam mô A Di Đà Phật 🙏' : 'Chép lại kinh';
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
    store.set(K.draft, JSON.stringify({ date: todayStr(), text: sutraInput.value }));
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

  $('sutra-check').addEventListener('click', function () {
    if (doneToday()) return;
    const want = normalize(currentSutra.text);
    const got = normalize(sutraInput.value);
    if (got === want) {
      const days = getDays() + 1;
      store.set(K.days, String(days));
      store.set(K.doneDate, todayStr());
      store.del(K.draft);
      me.days = days;
      lastSent = '';
      me.lotusUntil = Date.now() + LOTUS_MS;
      quizPending = true;
      setStatus('🙏 Viên mãn! Bạn đã hoàn thành ' + days + ' ngày chép kinh.', 'ok');
      sutraInput.disabled = true;
      $('sutra-check').disabled = true;
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
        document.querySelectorAll('[data-pose], #btn-eat').forEach(function (b) { b.classList.remove('active'); });
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
    ctx.fillStyle = ROBE;
    robeShape(topY, botY, 26, 34);
    ctx.fill();
    ctx.strokeStyle = ROBE_DARK;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // vạt áo chéo
    ctx.beginPath(); ctx.moveTo(-6, topY + 1); ctx.lineTo(5, topY + 14); ctx.stroke();
    // số ngày chép kinh trên áo
    ctx.fillStyle = '#ffffff';
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
    ctx.fillStyle = darkFace ? '#7a7a7a' : SKIN;
    ctx.beginPath(); ctx.arc(0, y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150,100,70,.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
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

    if (p.pose === 'sit') {
      ctx.fillStyle = officeLook ? (female ? SKIRT : PANTS) : ROBE_DARK;
      ctx.beginPath(); ctx.ellipse(0, -8, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
      torso(-46, -10, p.days);
      ctx.fillStyle = SKIN;
      ctx.beginPath(); ctx.ellipse(0, -14, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      head(-58);
      topOfHead = -71;
    } else if (p.pose === 'eat') {
      // ngồi, cứ ~2 giây đưa món lên miệng một lần
      ctx.fillStyle = ROBE_DARK;
      ctx.beginPath(); ctx.ellipse(0, -8, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
      torso(-46, -10, p.days);
      const ph = ((t + (p.seed || 0) * 2000) % 2000) / 2000;
      const lift = ph < 0.25 ? ph / 0.25 : ph < 0.45 ? 1 : ph < 0.7 ? 1 - (ph - 0.45) / 0.25 : 0;
      const fy = -16 - lift * 24;
      const food = FOODS.find(function (f) { return f.id === p.food; }) || FOODS[0];
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
      ctx.fillStyle = ROBE_DARK;
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
      ctx.fillStyle = ROBE_DARK;
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
      items.push({ y: a.y, draw: function () { a.top = drawMonk(a.p, a.x, a.y, now, a.isMe); } });
    });
    items.sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (it) { it.draw(); });

    // tên + bong bóng chat luôn nằm trên cùng
    actors.forEach(function (a) {
      const lotus = scene === 'temple' && (a.isMe ? Date.now() < (me.lotusUntil || 0) : !!a.p.lotus);
      let top = a.top;
      if (lotus) { drawLotus(a.x, top - 9, now); top -= 20; }
      drawLabel(a.p.name, a.x, top - 4);
      const b = bubbles.get(a.p.id);
      if (b) drawBubble(b.text, a.x, top - 18, b.until);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
