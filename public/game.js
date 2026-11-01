(function () {
  'use strict';

  // Chữ vẽ trên canvas: trên Windows thêm emoji phẳng Noto (xem index.html)
  const EMOJI_FONT = document.documentElement.classList.contains('win-emoji') ? ', "Noto Color Emoji"' : '';

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
    // dép (để ở kệ ngoài cửa chùa) — rẻ đến đắt
    { id: 'deptoong', emoji: '👡', name: 'Dép tổ ong', price: 2, slot: 'feet' },
    { id: 'depda', emoji: '👞', name: 'Dép Lào Thái', price: 10, slot: 'feet' },
    { id: 'haivang', emoji: '🥿', name: 'Dép Gucci', price: 25, slot: 'feet' },
  ];
  // Icon vẽ riêng cho dép: càng đắt trông càng sang (emoji không phân biệt được).
  const SHOE_ICONS = {
    // dép tổ ong: nhựa xanh nhạt, quai lỗ chỗ
    deptoong: '<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M3 24q0-6 8-6h28q6 0 6 6t-6 5H9q-6 0-6-5z" fill="#7cc6ec"/>' +
      '<path d="M13 18q1-10 13-10t13 10z" fill="#a9dcf5" stroke="#6bb3da" stroke-width="1.2"/>' +
      '<g fill="#6bb3da"><circle cx="19" cy="14" r="1.3"/><circle cx="24" cy="12" r="1.3"/><circle cx="29" cy="12" r="1.3"/>' +
      '<circle cx="34" cy="15" r="1.3"/><circle cx="22" cy="16" r="1.3"/><circle cx="27" cy="15.5" r="1.3"/><circle cx="31" cy="17" r="1.3"/></g></svg>',
    // dép Lào Thái: xỏ ngón, đế nâu nhiều lớp, quai đỏ
    depda: '<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M3 23q0-4 7-4h30q6 0 6 4v3q0 4-6 4H9q-6 0-6-4z" fill="#3a2a20"/>' +
      '<path d="M4 24.5h41" stroke="#f2ece2" stroke-width="1.6"/><path d="M4 27.5h41" stroke="#8a5a2b" stroke-width="1.2"/>' +
      '<path d="M15 20q4-11 10-12q6 1 11 12" fill="none" stroke="#c0392b" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="25" cy="8.5" r="2.2" fill="#e8b64c"/></svg>',
    // dép Gucci: quai ngang đen bóng, sọc xanh–đỏ–xanh, viền vàng, lấp lánh
    haivang: '<svg viewBox="0 0 48 32" aria-hidden="true"><path d="M3 24q0-5 7-5h30q6 0 6 5t-6 5H9q-6 0-6-5z" fill="#111"/>' +
      '<path d="M5 26h39" stroke="#d4a017" stroke-width="1.4"/>' +
      '<path d="M11 19q0-9 14-9t14 9z" fill="#1d1d1f" stroke="#d4a017" stroke-width="1.4"/>' +
      '<path d="M12.5 16.5q12-5 25 0" stroke="#1f8a4c" stroke-width="2.6" fill="none"/>' +
      '<path d="M12.2 14.3q12.8-5.4 25.6 0" stroke="#c0392b" stroke-width="2.2" fill="none" transform="translate(0 2)"/>' +
      '<path d="M12.5 12.4q12-5 25 0" stroke="#1f8a4c" stroke-width="2.6" fill="none" transform="translate(0 2)"/>' +
      '<path d="M41 4l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="#f5d98b"/><circle cx="7" cy="9" r="1.2" fill="#f5d98b"/></svg>',
  };
  // Phần tử icon của vật phẩm: dép dùng SVG vẽ riêng, đồ đeo dùng hình vẽ phẳng như trên nhân vật, còn lại emoji.
  function itemIcon(it, cls) {
    const s = document.createElement('span');
    s.className = cls || 'emoji';
    const pic = it && !SHOE_ICONS[it.id] ? itemPic(it.id) : null;
    if (it && SHOE_ICONS[it.id]) { s.classList.add('shoe-ic'); s.innerHTML = SHOE_ICONS[it.id]; }
    else if (pic) {
      s.classList.add('pic-ic');
      const img = document.createElement('img');
      img.src = pic; img.alt = it.name;
      s.appendChild(img);
    } else s.textContent = it ? it.emoji : '👡';
    return s;
  }
  const ITEM_BY_ID = new Map(ITEMS.map(function (it) { return [it.id, it]; }));
  // Bồ đoàn: đủ 60 chỗ (bằng số người tối đa mỗi khu) — 6 hàng, mỗi hàng 5 chiếc mỗi bên thảm đỏ, cách nhau một khoảng, tránh cột
  const CUSHIONS = [];
  [570, 630, 690, 750, 810, 870].forEach(function (y) {
    [340, 408, 476, 544, 612, 788, 856, 924, 992, 1060].forEach(function (x) { CUSHIONS.push({ x: x, y: y }); });
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
  // ---------- Nhà hàng: Quán Chiếc Thúng (cơm Việt) ----------
  // Giá tính bằng lương (nghìn đồng). Cơm trắng 10k, các món khác trên 10k.
  const MENU = [
    { id: 'comtrang', emoji: '🍚', name: 'Cơm trắng', price: 10 },
    { id: 'trungran', emoji: '🍳', name: 'Trứng rán', price: 12 },
    { id: 'raumuong', emoji: '🥬', name: 'Rau muống xào tỏi', price: 15 },
    { id: 'dauphu', emoji: '🧆', name: 'Đậu phụ sốt cà chua', price: 15 },
    { id: 'nemran', emoji: '🌯', name: 'Nem rán', price: 20 },
    { id: 'canhchua', emoji: '🍲', name: 'Canh chua cá lóc', price: 25 },
    { id: 'thitkho', emoji: '🍖', name: 'Thịt kho trứng', price: 30 },
    { id: 'cakho', emoji: '🐟', name: 'Cá kho tộ', price: 35 },
    { id: 'suonxao', emoji: '🥩', name: 'Sườn xào chua ngọt', price: 35 },
    { id: 'galuoc', emoji: '🍗', name: 'Gà luộc lá chanh', price: 40 },
    { id: 'banhxeo', emoji: '🥞', name: 'Bánh xèo', price: 30 },
    { id: 'banhtrang', emoji: '🌯', name: 'Bánh tráng cuốn thịt heo', price: 40 },
    { id: 'bunhen', emoji: '🍜', name: 'Bún hến chấm gạch cua', price: 45 },
    { id: 'nomchanvit', emoji: '🥗', name: 'Nộm chân vịt rút xương', price: 50 },
    { id: 'laurieubau', emoji: '🍲', name: 'Lẩu riêu cua bầu', price: 80 },
    { id: 'lauriebo', emoji: '🍲', name: 'Lẩu riêu cua bắp bò', price: 90 },
    { id: 'lauthai', emoji: '🍲', name: 'Lẩu Thái', price: 95 },
    { id: 'vangdau', emoji: '🥢', name: 'Váng đậu chiên giòn', price: 35 },
    { id: 'sushi', emoji: '🍣', name: 'Sushi', price: 60 },
  ];
  // Bàn ăn rộng 280 (= 4 viên gạch lát sàn) × sâu 70 (mặt bàn từ y-70 tới y).
  const REST_TABLES = [{ x: 420, y: 720 }, { x: 980, y: 720 }];
  const TABLE_HW = 140;
  const REST_SEATS = [];          // mỗi bàn 6 ghế: 3 phía trên, 3 phía dưới
  REST_TABLES.forEach(function (t, ti) {
    [-90, 0, 90].forEach(function (dx) {
      // ghế sau bàn lùi xa hơn, ghế trước bàn kéo sát lại
      REST_SEATS.push({ x: t.x + dx, y: t.y - 80, table: ti }, { x: t.x + dx, y: t.y + 50, table: ti });
    });
  });
  const RECEPTION = { x: 205, y: 470 };   // chỗ đứng lễ tân (sau quầy)
  const KITCHEN = { x: 1230, y: 540 };    // phục vụ đứng chờ ở cửa bếp
  const REST_PLANTS = [{ x: 60, y: 620 }, { x: 60, y: 965 }, { x: 1340, y: 965 }, { x: 1340, y: 640 }];
  // Góc nướng BBQ: 10 loại xiên, mỗi xiên 5k; nướng 5 giây rồi ăn 10 giây.
  const BBQ = { x: 1200, y: 890 };
  const BBQ_PRICE = 5;
  const GRILL_MS = 5000;
  const BBQ_EAT_MS = 10000;
  const BBQ_SLOTS = 3;           // bếp chỉ đủ chỗ cho 3 người nướng cùng lúc
  // [miếng chính, miếng xen kẽ]
  const SKEWERS = [
    { id: 'xbachi', name: 'Ba chỉ heo', colors: ['#c76a4a', '#f2dcc8'] },
    { id: 'xbocuon', name: 'Bò cuộn nấm kim châm', colors: ['#8a3a28', '#f2ece2'] },
    { id: 'xdui', name: 'Đùi gà', colors: ['#d9893a', '#c9772e'] },
    { id: 'xchanga', name: 'Chân gà', colors: ['#e0a052', '#d08a3c'] },
    { id: 'xsun', name: 'Sụn gà', colors: ['#e8c48a', '#d9a86a'] },
    { id: 'xnam', name: 'Nầm bò', colors: ['#d8b08a', '#c49270'] },
    { id: 'xtom', name: 'Tôm', colors: ['#f08a5a', '#f6b08a'] },
    { id: 'xmuc', name: 'Mực', colors: ['#f2ead2', '#d9a86a'] },
    { id: 'xxucxich', name: 'Xúc xích', colors: ['#b8452a', '#d8643a'] },
    { id: 'xthitde', name: 'Thịt dê', colors: ['#7a3a22', '#a85a3a'] },
  ];
  function skewerById(id) { return SKEWERS.find(function (s) { return s.id === id; }); }
  const TRA_DA = { x: 1060, y: 520 };   // bình trà đá đỏ miễn phí, cạnh quầy chị Liễu
  const DRINK_MS = 5000;
  const ONG_DIA = { x: 380, y: 500 };   // bàn thờ Ông Địa đặt sát đất, cạnh quầy lễ tân
  const REST_OBSTACLES = REST_PLANTS.map(function (p) { return { x: p.x, y: p.y - 6, r: 22 }; })
    .concat([{ x: ONG_DIA.x, y: ONG_DIA.y - 12, r: 36 }, { x: TRA_DA.x, y: TRA_DA.y - 6, r: 20 }, { x: BBQ.x, y: BBQ.y - 8, r: 36 }]);
  REST_TABLES.forEach(function (t) {
    [-100, -33, 33, 100].forEach(function (dx) { REST_OBSTACLES.push({ x: t.x + dx, y: t.y - 30, r: 44 }); });
  });
  for (let x = 120; x <= 300; x += 36) REST_OBSTACLES.push({ x: x, y: 500, r: 24 });   // quầy lễ tân
  for (let x = 1120; x <= 1350; x += 36) REST_OBSTACLES.push({ x: x, y: 490, r: 22 }); // quầy bếp
  const PANTRY_FOODS = [{ id: 'cafe', emoji: '☕', name: 'Cà phê' }, { id: 'comhop', emoji: '🍱', name: 'Cơm hộp' }];
  const MICROWAVE = { x: 1180, y: 510 }; // chỗ đứng trước lò vi sóng
  const HEAT_MS = 5000;                  // quay cơm 5 giây

  // ---------- Lưu trữ local ----------
  // ---------- Két dữ liệu quan trọng (mã hoá + ký) ----------
  // Điểm, lương, stress, túi đồ… gom vào MỘT khoá (tên khoá cũng làm rối), mã hoá (mở F12 không đọc được)
  // và ký 64-bit gắn với mã riêng của máy (chép sang máy khác là hỏng). Sửa tay → bỏ, về mặc định.
  // Vẫn chỉ là rào chắn: khoá nằm trong code nên người rành kỹ thuật vẫn vượt được — muốn chắc phải lưu trên server.
  const VAULT_KEYS = ['kxtp_days', 'kxtp_salary', 'kxtp_stress', 'kxtp_inv', 'kxtp_worn', 'kxtp_copies', 'kxtp_steal_date'];
  const VAULT_SALT = 'kxtp·tâm-tịnh·2026';
  // Dữ liệu kiểu cũ (chưa nằm trong két) chỉ nhập một lần, có giới hạn trần để không lợi dụng được.
  const LEGACY_CAP = { kxtp_days: 500, kxtp_salary: 500, kxtp_stress: 100 };
  function fnv(str, seed) {
    let h = seed >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h;
  }
  function vaultSig(str) { return fnv(str, 0x811c9dc5).toString(36) + fnv(str, 0x2b1a5f3d).toString(36); }
  function xorCrypt(bin, key) { // dòng khoá xorshift sinh từ key
    let h = fnv(key, 0x9e3779b9) || 1;
    let out = '';
    for (let i = 0; i < bin.length; i++) {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
      out += String.fromCharCode(bin.charCodeAt(i) ^ (h & 255));
    }
    return out;
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } }

  // Tên khoá trong localStorage cũng được làm rối (mở F12 không đoán được khoá nào là két).
  const SAVE_KEY = '_' + fnv(VAULT_SALT + '|s', 0x3c6ef372).toString(36) + fnv(VAULT_SALT + '|s', 0x5be0cd19).toString(36);
  const DEV_KEY = '_' + fnv(VAULT_SALT + '|d', 0x3c6ef372).toString(36) + fnv(VAULT_SALT + '|d', 0x5be0cd19).toString(36);
  // Chuyển từ tên cũ (kxtp_dev / kxtp_save) sang tên mới.
  if (!lsGet(DEV_KEY) && lsGet('kxtp_dev')) lsSet(DEV_KEY, lsGet('kxtp_dev'));
  if (!lsGet(SAVE_KEY) && lsGet('kxtp_save')) lsSet(SAVE_KEY, lsGet('kxtp_save'));
  lsDel('kxtp_dev');
  lsDel('kxtp_save');
  let deviceKey = lsGet(DEV_KEY);
  if (!deviceKey) { deviceKey = Math.random().toString(36).slice(2) + Date.now().toString(36); lsSet(DEV_KEY, deviceKey); }
  const VAULT_KEY = VAULT_SALT + '|' + deviceKey;
  let vault = {};
  let dataTampered = false;
  function saveVault() {
    const bin = unescape(encodeURIComponent(JSON.stringify(vault)));
    const payload = btoa(xorCrypt(bin, VAULT_KEY));
    lsSet(SAVE_KEY, payload + '.' + vaultSig(VAULT_KEY + '|' + payload));
  }
  (function loadVault() {
    const raw = lsGet(SAVE_KEY);
    if (raw) {
      const dot = raw.lastIndexOf('.');
      const payload = raw.slice(0, dot);
      try {
        if (dot < 0 || raw.slice(dot + 1) !== vaultSig(VAULT_KEY + '|' + payload)) throw new Error('sig');
        vault = JSON.parse(decodeURIComponent(escape(xorCrypt(atob(payload), VAULT_KEY)))) || {};
      } catch (err) { // bị sửa tay / chép từ máy khác → bỏ
        vault = {};
        dataTampered = true;
        saveVault();
      }
    } else {
      // Nhập dữ liệu kiểu cũ (từng khoá riêng, có thể kèm chữ ký "giá trị|ký") một lần, có giới hạn trần.
      VAULT_KEYS.forEach(function (k) {
        let v = lsGet(k);
        if (v === null) return;
        const bar = v.lastIndexOf('|');
        if (bar >= 0) v = v.slice(0, bar);
        if (LEGACY_CAP[k] !== undefined) v = String(Math.max(0, Math.min(LEGACY_CAP[k], parseInt(v, 10) || 0)));
        vault[k] = v;
      });
      saveVault();
    }
    VAULT_KEYS.forEach(lsDel); // dữ liệu chỉ còn trong két
    lsDel('kxtp_signed');
  })();

  const store = {
    get: function (k) {
      if (VAULT_KEYS.indexOf(k) >= 0) return Object.prototype.hasOwnProperty.call(vault, k) ? String(vault[k]) : null;
      return lsGet(k);
    },
    set: function (k, v) {
      if (VAULT_KEYS.indexOf(k) >= 0) { vault[k] = String(v); saveVault(); return; }
      lsSet(k, v);
    },
    del: function (k) {
      if (VAULT_KEYS.indexOf(k) >= 0) { delete vault[k]; saveVault(); return; }
      lsDel(k);
    },
  };
  const K = {
    name: 'kxtp_name',
    days: 'kxtp_days', // điểm chép kinh (trước đây là số ngày — giữ khoá cũ để không mất điểm)
    copies: 'kxtp_copies',
    inv: 'kxtp_inv',
    worn: 'kxtp_worn',
    stress: 'kxtp_stress',
    salary: 'kxtp_salary',
    stealDate: 'kxtp_steal_date',
    draft: 'kxtp_draft',
    music: 'kxtp_music',
    track: 'kxtp_track',
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
  // Luôn có ít nhất một đôi dép: chưa có đôi nào thì tặng một đôi dép tổ ong.
  function shoeCount() {
    return ITEMS.reduce(function (n, it) { return it.slot === 'feet' ? n + (inv[it.id] || 0) : n; }, 0);
  }
  if (shoeCount() === 0) {
    inv.deptoong = 1;
    worn.feet = 'deptoong';
    store.set(K.inv, JSON.stringify(inv));
    store.set(K.worn, JSON.stringify(worn));
  }

  // ---------- Trạng thái ----------
  const me = {
    id: Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 8),
    name: DEFAULT_NAME,
    x: 700, y: 840, dir: 1,
    pose: 'stand',
    gender: store.get(K.gender) === 'f' ? 'f' : 'm',
    days: getPoints(),
    wear: wearList(),
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
  let myReviews = [];           // review đồng nghiệp viết về mình (server gửi xuống)
  let rack = [];                // kệ dép ngoài cửa chùa (server gửi xuống)
  let dishes = [];              // món trên bàn ở nhà hàng (server gửi xuống)
  let started = false;
  let scene = 'temple'; // 'temple' | 'office'
  let templeName = DEFAULT_NAME;
  let officeName = DEFAULT_OFFICE_NAME;

  // ---------- DOM ----------
  const $ = function (id) { return document.getElementById(id); };
  const canvas = $('scene');
  let ctx = canvas.getContext('2d'); // tạm trỏ sang canvas nhỏ khi vẽ icon vật phẩm (itemPic)
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
    document.body.classList.add('playing');
    if (dataTampered) toast('⚠️ Phát hiện dữ liệu bị sửa tay — đã đặt lại phần đó về mặc định.', 7000);
    updateSutraBadge();
    updatePointsUI();
    updateStatsUI();
    setPose('stand');
    if (store.get(K.music) !== 'off') { synth.unlock(); startMusic(); }
    updateMusicBtn();
    nameInput.blur();
    goScene('temple');
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

  // ---------- Cần điều khiển ảo (màn cảm ứng) ----------
  // Kéo núm theo hướng nào thì đi hướng đó; thả tay là dừng. Vẫn chạm nền để đi tới chỗ đó được.
  const joy = { x: 0, y: 0, id: null };
  const JOY_R = 40;
  (function () {
    const base = $('joystick');
    const knob = $('joy-knob');
    function setKnob(dx, dy) { knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
    function move(e) {
      const r = base.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2);
      let dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > JOY_R) { dx *= JOY_R / d; dy *= JOY_R / d; }
      joy.x = dx / JOY_R;
      joy.y = dy / JOY_R;
      setKnob(dx, dy);
    }
    function end(e) {
      if (e.pointerId !== joy.id) return;
      joy.id = null;
      joy.x = joy.y = 0;
      setKnob(0, 0);
    }
    base.addEventListener('pointerdown', function (e) {
      if (typing()) document.activeElement.blur();
      joy.id = e.pointerId;
      base.setPointerCapture(e.pointerId);
      me.target = null;
      move(e);
      e.preventDefault();
    });
    base.addEventListener('pointermove', function (e) { if (e.pointerId === joy.id) move(e); });
    base.addEventListener('pointerup', end);
    base.addEventListener('pointercancel', end);
  })();

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
    if (pose === 'sit' && scene === 'restaurant') sitAtTable();
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
  function renderFoodList() {
    const list = $('food-list');
    if (list.childElementCount) return;
    FOODS.forEach(function (f) {
      const b = document.createElement('button');
      b.appendChild(picSpan(foodPic(f.id), f.name));
      const name = document.createElement('span');
      name.textContent = f.name;
      b.appendChild(name);
      b.addEventListener('click', function () {
        $('food').classList.add('hidden');
        me.food = f.id;
        me.eatUntil = Date.now() + EAT_MS;
        setPose('eat');
      });
      list.appendChild(b);
    });
  }
  function openFood() { renderFoodList(); $('food').classList.remove('hidden'); }
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
    es.addEventListener('dishes', function (ev) {
      const now = Date.now();
      dishes = JSON.parse(ev.data).map(function (d) { d.readyAt = now - d.age + d.prep; return d; });
      if (!$('dine').classList.contains('hidden')) renderDine();
    });
    es.addEventListener('reviews', function (ev) { onReviews(JSON.parse(ev.data)); });
    es.addEventListener('rack', function (ev) {
      rack = JSON.parse(ev.data);
      if (!$('rack').classList.contains('hidden')) renderRack();
    });
    es.addEventListener('shoe-stolen', function (ev) {
      const s = JSON.parse(ev.data);
      const it = ITEM_BY_ID.get(s.shoe);
      const got = ITEM_BY_ID.get(s.got);
      if (got) { inv[got.id] = (inv[got.id] || 0) + 1; worn.feet = got.id; } // nhận lại đôi của người lấy
      if (it && inv[it.id] > 0) removeOne(it.id); else saveInv();
      const shoeName = function (x) { return x.name.replace(/^Dép /, ''); }; // "Dép Gucci" → "Gucci"
      toast('😱 Đôi ' + (it ? shoeName(it) : 'dép') + ' của bạn đã bị lấy mất' +
        (got ? ', ai đó để lại một đôi ' + shoeName(got) + '.' : '.'), 7000);
    });
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
    es.onerror = function () {
      connected = false;
      if (es.readyState !== 2) return; // 2 = CLOSED: server từ chối (vd. khu này đã kín người)
      const sc = scene;
      fetch('/api/room?scene=' + sc).then(function (r) { return r.json(); }).then(function (d) {
        if (d.full && scene === sc) showFull(sc);
      }).catch(function () { /* bỏ qua */ });
    };
  }

  function syncState(now) {
    if (!online || !connected || inFlight) return;
    const payload = {
      id: me.id, name: me.name, scene: scene,
      x: Math.round(me.x), y: Math.round(me.y),
      dir: me.dir, pose: me.pose, days: me.days, gender: me.gender, wear: me.wear,
      stress: me.stress, caught: Date.now() < me.caughtUntil, heating: me.heatUntil > Date.now(),
      food: me.pose === 'eat' || me.pose === 'bbq' ? me.food : undefined,
      face: me.face || 'd',
      grill: me.grillUntil > Date.now() ? me.grill : undefined,
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
    if (scene === 'temple' && myRackSlot() >= 0) toast('👡 Đã xỏ lại dép ở kệ.');
    scene = next;
    rack = [];
    document.body.classList.toggle('office', next === 'office');
    document.body.classList.toggle('restaurant', next === 'restaurant');
    $('brand').textContent = next === 'office' ? '🏢 Đời là bể khổ' : next === 'restaurant' ? '🍜 Quán Chiếc Thúng' : '卍 Khẩu Xà Tâm Phật';
    dishes = [];
    if (es) es.close();
    connected = false;
    others.clear();
    bubbles.clear();
    blackFaces.clear();
    slaps.clear();
    boss = null;
    offerings = [];
    myReviews = [];
    reviewsBaseline = false;
    updateReviewBadge();
    me.heatUntil = 0;
    cancelGrill();
    tasks = [];
    updateTaskBadge();
    keys.clear();
    me.x = 700;
    me.y = next === 'temple' ? 840 : 940;
    me.name = next === 'office' ? officeName
      : next === 'restaurant' ? (store.get(K.officeName) || templeName) : templeName;
    setPose('stand');
    $('online-count').textContent = 1;
    lastSent = '';
    connect();
    if (musicOn) startMusic(); // đổi nhạc theo cảnh
    if (next === 'temple') askShoes();
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
    goScene('office');
  });
  $('btn-temple').addEventListener('click', function () { goScene('temple'); });

  // Chuyển khu: hỏi server khu đó còn chỗ không (mỗi khu tối đa 60 người).
  const SCENE_NAMES = { temple: '卍 Đi chùa', office: '💼 Đi làm', restaurant: '🍜 Nhà hàng' };
  function goScene(next) {
    if (!online) { switchScene(next); return; }
    fetch('/api/room?scene=' + next).then(function (r) { return r.json(); }).then(function (d) {
      if (d.full) showFull(next); else switchScene(next);
    }).catch(function () { switchScene(next); });
  }
  function showFull(full) {
    const list = $('full-list');
    list.textContent = '';
    Object.keys(SCENE_NAMES).forEach(function (sc) {
      if (sc === full) return;
      const b = document.createElement('button');
      b.textContent = SCENE_NAMES[sc];
      b.addEventListener('click', function () {
        $('full').classList.add('hidden');
        if (sc === 'office') { $('btn-work').click(); return; } // hỏi tên ở văn phòng như bình thường
        goScene(sc);
      });
      list.appendChild(b);
    });
    $('full').classList.remove('hidden');
  }

  // ---------- Nhà hàng ----------
  $('btn-restaurant').addEventListener('click', function () { goScene('restaurant'); });
  $('btn-rest-temple').addEventListener('click', function () { goScene('temple'); });
  $('btn-rest-work').addEventListener('click', function () { $('btn-work').click(); });

  function seatTaken(s) {
    let taken = false;
    others.forEach(function (o) {
      if ((o.pose === 'sit' || o.pose === 'eat') && Math.abs(o.x - s.x) < 6 && Math.abs(o.y - (s.y + 2)) < 6) taken = true;
    });
    return taken;
  }
  // Ngồi vào ghế trống gần nhất; bàn đủ 6 người thì báo.
  function sitAtTable() {
    let best = null, bestD = 90, nearTable = -1;
    REST_SEATS.forEach(function (s) {
      const d = Math.hypot(me.x - s.x, me.y - s.y);
      if (d < 140) nearTable = s.table;
      if (d < bestD && !seatTaken(s)) { best = s; bestD = d; }
    });
    if (best) { me.x = best.x; me.y = best.y + 2; return; }
    if (nearTable >= 0) toast('Bàn này đã đủ 6 người rồi.');
  }
  // Bàn mình đang ngồi (-1 nếu chưa ngồi bàn nào).
  function myTable() {
    if (me.pose !== 'sit' && me.pose !== 'eat') return -1;
    const s = REST_SEATS.find(function (x) { return Math.abs(me.x - x.x) < 4 && Math.abs(me.y - (x.y + 2)) < 4; });
    return s ? s.table : -1;
  }
  function menuItem(id) { return MENU.find(function (m) { return m.id === id; }); }

  // Vẽ một món (đĩa / bát / nồi + thức ăn), tâm tại (x, y), rộng khoảng 34 × k. c = canvas context.
  function drawDish(c, id, x, y, k) {
    k = k || 1;
    c.save();
    c.translate(x, y);
    c.scale(k, k);
    const E = function (cx, cy, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
    const plate = function () { E(0, 3, 17, 7, 'rgba(0,0,0,.18)'); E(0, 1, 17, 7, '#f4f6f8'); E(0, 1, 12, 4.6, '#e6e9ec'); };
    const bowl = function (rim) {
      E(0, 5, 13, 4, 'rgba(0,0,0,.18)');
      c.fillStyle = '#f4f6f8';
      c.beginPath(); c.moveTo(-14, -3); c.quadraticCurveTo(-13, 8, 0, 8); c.quadraticCurveTo(13, 8, 14, -3); c.closePath(); c.fill();
      c.strokeStyle = rim || '#3b6fb6'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-12, 1); c.quadraticCurveTo(0, 6, 12, 1); c.stroke();
    };
    const pot = function () { // nồi đất / tộ
      E(0, 5, 14, 4, 'rgba(0,0,0,.2)');
      c.fillStyle = '#7a3d12';
      c.beginPath(); c.moveTo(-14, -3); c.quadraticCurveTo(-14, 8, 0, 8); c.quadraticCurveTo(14, 8, 14, -3); c.closePath(); c.fill();
      c.fillStyle = '#5a2c0e'; c.fillRect(-16, -4, 3, 3); c.fillRect(13, -4, 3, 3);
    };
    if (id === 'comtrang') {
      bowl();
      E(0, -3, 13, 4.5, '#ffffff');
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, -4, 10, Math.PI, 0); c.fill();
      c.fillStyle = '#e8e8e0';
      [[-5, -8], [2, -10], [6, -6], [-2, -5], [4, -3]].forEach(function (p) { c.fillRect(p[0], p[1], 2, 1); });
    } else if (id === 'trungran') {
      plate();
      c.fillStyle = '#fffdf6';
      c.beginPath(); c.moveTo(-11, 1); c.quadraticCurveTo(-12, -6, -3, -5); c.quadraticCurveTo(4, -9, 10, -3); c.quadraticCurveTo(13, 3, 4, 4); c.quadraticCurveTo(-6, 6, -11, 1); c.fill();
      c.strokeStyle = '#e0b85c'; c.lineWidth = 0.8; c.stroke();
      E(1, -1, 4.6, 3.6, '#f4a91e'); E(0, -2, 1.6, 1, '#ffd36e');
    } else if (id === 'raumuong') {
      plate();
      c.strokeStyle = '#3d8b3a'; c.lineWidth = 2; c.lineCap = 'round';
      [[-10, 2, 6, -4], [-8, -2, 9, 1], [-11, -1, 4, -6], [-4, 3, 11, -2], [-7, 0, 2, -7]].forEach(function (s) {
        c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke();
      });
      E(-6, -3, 3, 1.6, '#5aa847'); E(5, -1, 3.2, 1.6, '#4c9a3e');
      c.fillStyle = '#f2e6c8';
      [[-3, -1], [3, -3], [7, 0], [-8, 0]].forEach(function (p) { c.fillRect(p[0], p[1], 1.6, 1.6); });
    } else if (id === 'dauphu') {
      plate();
      E(0, 0, 12, 4.4, '#d0452c');
      [[-8, -4], [-2, -6], [4, -4], [-5, -1], [1, -2]].forEach(function (p) {
        c.fillStyle = '#f3d98e'; c.fillRect(p[0], p[1], 5, 4);
        c.fillStyle = 'rgba(200,60,40,.55)'; c.fillRect(p[0], p[1] + 2.6, 5, 1.4);
      });
      c.fillStyle = '#3d8b3a'; c.fillRect(-1, -7, 2, 1.2); c.fillRect(5, -6, 2, 1.2);
    } else if (id === 'nemran') {
      plate();
      E(-8, -2, 5, 2.6, '#7fb847');
      [-4, 1, 6].forEach(function (dx, i) {
        c.save(); c.translate(dx, -3 + i * 0.6); c.rotate(-0.35);
        c.fillStyle = '#c9822e'; c.fillRect(-6, -2.2, 12, 4.4);
        c.fillStyle = '#e0a24a'; c.fillRect(-6, -2.2, 12, 1.4);
        c.restore();
      });
    } else if (id === 'canhchua') {
      bowl('#c0392b');
      E(0, -3, 13, 4.5, '#e2793a');
      E(-6, -4, 2.6, 1.6, '#f2c230'); E(3, -2, 2.4, 1.6, '#c0392b');
      E(6, -4, 2.8, 1.2, '#4c9a3e'); E(-2, -3, 3, 1.3, '#eee0c8');
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-3, -9); c.quadraticCurveTo(-5, -12, -2, -15); c.stroke();
    } else if (id === 'thitkho') {
      pot();
      E(0, -3, 13, 4.2, '#7a3a12');
      [[-6, -4], [3, -5], [-1, -2]].forEach(function (p) { c.fillStyle = '#9c4a1a'; c.fillRect(p[0], p[1], 5, 4); c.fillStyle = '#f2e6c8'; c.fillRect(p[0], p[1], 5, 1.2); });
      E(7, -3, 3.4, 2.6, '#d9a066'); E(7, -3, 1.6, 1.3, '#f4a91e');
    } else if (id === 'cakho') {
      pot();
      E(0, -3, 13, 4.2, '#4a1f0a');
      c.fillStyle = '#6b3a18';
      c.beginPath(); c.ellipse(-1, -4, 8, 3, -0.1, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(7, -4); c.lineTo(11, -7); c.lineTo(11, -1); c.closePath(); c.fill();
      c.fillStyle = '#d63a2a'; c.fillRect(-6, -6, 3, 1.4); c.fillRect(2, -7, 3, 1.4);
    } else if (id === 'suonxao') {
      plate();
      [[-7, -3], [-1, -5], [5, -3], [-4, 0], [3, 0]].forEach(function (p) {
        E(p[0], p[1], 3.6, 2.4, '#b8452a');
        c.fillStyle = '#f2e6c8'; c.fillRect(p[0] + 2.4, p[1] - 0.6, 2.4, 1.2);
      });
      c.fillStyle = '#ffffff'; c.fillRect(-2, -7, 1.4, 1.4); c.fillRect(4, -6, 1.4, 1.4);
    } else if (id === 'bunhen') {
      plate();
      c.strokeStyle = '#fbf8ef'; c.lineWidth = 1.3;                 // bún
      for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-13, -4 + i * 1.2); c.quadraticCurveTo(-6, -7 + i, 1, -3 + i * 1.1); c.stroke(); }
      c.fillStyle = '#8f8a7e';                                     // hến
      [[-9, -2], [-5, 0], [-2, -4]].forEach(function (p) { c.beginPath(); c.ellipse(p[0], p[1], 1.6, 1.1, 0.3, 0, Math.PI * 2); c.fill(); });
      E(-11, -6, 2.6, 1.3, '#4c9a3e');                              // rau thơm
      E(8, -1, 6.4, 3.6, '#f4f6f8');                                // bát chấm
      E(8, -2, 5, 2.6, '#d9692a'); E(7, -2.6, 2, 1, '#f0a04a');     // gạch cua
    } else if (id === 'banhxeo') {
      plate();
      E(-10, -1, 5, 2.6, '#7fb847'); E(-12, -4, 3.6, 2, '#5aa847');         // xà lách, rau thơm
      c.fillStyle = '#f0b72f';                                             // vỏ bánh vàng giòn, gập đôi
      c.beginPath(); c.moveTo(-6, 2); c.quadraticCurveTo(-5, -10, 5, -9); c.quadraticCurveTo(14, -6, 13, 2); c.closePath(); c.fill();
      c.strokeStyle = '#c98a1a'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#d99a22';                                             // vết cháy giòn
      [[0, -6], [6, -5], [9, -2]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 1.2, 0, Math.PI * 2); c.fill(); });
      c.strokeStyle = '#f2ece2'; c.lineWidth = 1.2;                         // giá đỗ thò ra
      [[-4, 1, -8, 3], [-3, 0, -7, -1]].forEach(function (s) { c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke(); });
      E(-4, -1, 2.2, 1.4, '#f08a6a');                                      // tôm
    } else if (id === 'sushi') {
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-16, 0, 32, 5);             // khay gỗ
      c.fillStyle = '#c99a5a'; c.fillRect(-16, -3, 32, 6);
      c.fillStyle = '#a87a42'; c.fillRect(-16, 2, 32, 1.5);
      [[-11, '#f08a4b'], [-4, '#d8434a']].forEach(function (s) {             // 2 miếng nigiri: cá hồi, cá ngừ
        c.fillStyle = '#ffffff'; c.fillRect(s[0] - 3, -7, 7, 5);
        c.fillStyle = s[1]; c.beginPath(); c.ellipse(s[0] + 0.5, -7.5, 4.4, 2, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 0.6;
        c.beginPath(); c.moveTo(s[0] - 2, -8); c.lineTo(s[0] + 2, -7); c.stroke();
      });
      [4, 11].forEach(function (x0) {                                       // 2 cuộn maki
        E(x0, -5, 3.6, 3.2, '#1f3a26'); E(x0, -5.4, 2.6, 2.2, '#ffffff'); E(x0, -5.4, 1.1, 1, '#f08a4b');
      });
      E(14, -1, 1.8, 1, '#7fb847');                                          // wasabi
    } else if (id === 'vangdau') {
      plate();
      c.fillStyle = '#e7b34a';                                               // váng đậu chiên vàng giòn, cuộn gấp
      [[-8, -3, 0.3], [-1, -5, -0.2], [6, -3, 0.25], [1, 0, -0.1]].forEach(function (p) {
        c.save(); c.translate(p[0], p[1]); c.rotate(p[2]);
        c.beginPath(); c.moveTo(-6, 2); c.quadraticCurveTo(-5, -4, 0, -3); c.quadraticCurveTo(5, -4, 6, 2); c.closePath(); c.fill();
        c.strokeStyle = '#c98a2a'; c.lineWidth = 0.7;
        c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(0, -2, 4, 0); c.stroke();
        c.restore();
      });
      c.fillStyle = '#3d8b3a'; c.fillRect(-3, -8, 2, 1.2); c.fillRect(3, -7, 2, 1.2); // hành lá
      E(11, 1, 2.6, 1.6, '#f4f6f8'); E(11, 0.6, 1.8, 1, '#a8572a');           // chén nước chấm
    } else if (id === 'banhtrang') {
      plate();
      c.fillStyle = '#f0e0d0';                                             // thịt heo luộc thái lát
      [[-9, -4], [-5, -6], [-1, -5]].forEach(function (p) {
        c.beginPath(); c.ellipse(p[0], p[1], 4, 1.8, -0.2, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#f2ece2'; c.fillRect(p[0] - 3.5, p[1] - 0.6, 7, 0.9); c.fillStyle = '#f0e0d0';
      });
      E(-10, 0, 4, 2.2, '#5aa847'); E(-5, 1, 3.6, 1.8, '#7fb847');         // rau sống
      c.fillStyle = '#f6f1e2';                                             // bánh tráng cuốn (2 cuốn trong, thấy rau + thịt)
      [[4, -4], [7, 0]].forEach(function (p) {
        c.save(); c.translate(p[0], p[1]); c.rotate(-0.25);
        c.fillStyle = 'rgba(246,241,226,.95)'; c.fillRect(-7, -2.6, 14, 5.2);
        c.fillStyle = 'rgba(90,168,71,.55)'; c.fillRect(-6, -1.6, 12, 1.4);
        c.fillStyle = 'rgba(230,160,150,.6)'; c.fillRect(-6, 0.4, 12, 1.2);
        c.restore();
      });
      E(12, -6, 3.4, 2.2, '#f4f6f8'); E(12, -6.4, 2.4, 1.4, '#a8572a');    // chén mắm nêm
    } else if (id === 'nomchanvit') {
      plate();
      c.strokeStyle = '#e8822a'; c.lineWidth = 1.2;                        // cà rốt thái sợi
      [[-10, -1, -3, -5], [2, 1, 9, -3], [-6, 2, 1, -2]].forEach(function (s) { c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke(); });
      c.strokeStyle = '#efe0ef'; c.lineWidth = 1;                          // hành tây
      [[-4, -3], [6, -1]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 2.4, Math.PI, Math.PI * 2); c.stroke(); });
      c.fillStyle = '#f0dcb8';                                             // chân vịt rút xương
      [[-7, -4, 0.4], [1, -6, -0.3], [7, -3, 0.2], [-2, -1, -0.5]].forEach(function (p) {
        c.save(); c.translate(p[0], p[1]); c.rotate(p[2]);
        c.beginPath(); c.ellipse(0, 0, 4.4, 1.8, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      });
      E(-9, -5, 2, 1, '#3d8b3a'); E(4, -8, 2, 1, '#3d8b3a'); E(9, -6, 1.8, 1, '#4c9a3e'); // rau răm
      c.fillStyle = '#a8743a';                                             // lạc rang
      [[-3, -7], [3, -2], [-8, 0], [10, -1]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 1, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = '#d63a2a'; c.fillRect(5, -5, 2.4, 1.2);                // ớt
      E(12, 0, 2.6, 1.8, '#c8e06a'); E(12, 0, 1.4, 1, '#e6f2a6');          // lát chanh
    } else if (id === 'lauthai') {
      E(0, 6, 17, 5, 'rgba(0,0,0,.22)');                                   // nồi lẩu
      c.fillStyle = '#5d6b78';
      c.beginPath(); c.moveTo(-15, -4); c.quadraticCurveTo(-15, 8, 0, 8); c.quadraticCurveTo(15, 8, 15, -4); c.closePath(); c.fill();
      c.fillStyle = '#3a434d'; c.fillRect(-19, -4, 4, 2.4); c.fillRect(15, -4, 4, 2.4);
      E(0, -4, 15, 5, '#e8622a');                                          // nước lẩu chua cay
      c.strokeStyle = '#f2a0a0'; c.lineWidth = 2.2;                         // tôm cong
      [[-7, -5], [4, -6]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 2.6, Math.PI * 0.1, Math.PI * 1.2); c.stroke(); });
      E(0, -3, 2.6, 1.6, '#c9a27a'); E(9, -3, 2.4, 1.5, '#c9a27a');          // nấm
      c.strokeStyle = '#c8d98a'; c.lineWidth = 1.4;                         // sả
      c.beginPath(); c.moveTo(-11, -2); c.lineTo(-4, -8); c.stroke();
      c.fillStyle = '#c0392b'; c.fillRect(6, -7, 3, 1.4); c.fillRect(-2, -7, 3, 1.4); // ớt
      E(10, -6, 2.2, 1, '#2f7a34');                                         // lá chanh
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1;
      [-5, 4].forEach(function (x0) { c.beginPath(); c.moveTo(x0, -10); c.quadraticCurveTo(x0 - 3, -14, x0, -18); c.stroke(); });
    } else if (id === 'laurieubau' || id === 'lauriebo') {
      E(0, 6, 17, 5, 'rgba(0,0,0,.22)');                            // nồi lẩu
      c.fillStyle = '#5d6b78';
      c.beginPath(); c.moveTo(-15, -4); c.quadraticCurveTo(-15, 8, 0, 8); c.quadraticCurveTo(15, 8, 15, -4); c.closePath(); c.fill();
      c.fillStyle = '#3a434d'; c.fillRect(-19, -4, 4, 2.4); c.fillRect(15, -4, 4, 2.4);
      E(0, -4, 15, 5, '#d4562e');                                   // nước riêu
      [[-8, -5], [-2, -6], [5, -5], [9, -3], [-4, -3]].forEach(function (p) { E(p[0], p[1], 2.4, 1.5, '#b87a3a'); }); // gạch cua
      E(-10, -3, 2.2, 1.4, '#e0402a'); E(2, -3, 2.2, 1.4, '#e0402a');               // cà chua
      if (id === 'lauriebo') {
        [[-5, -5], [6, -6], [0, -3]].forEach(function (p) { E(p[0], p[1], 3.4, 1.3, '#c47a6a'); }); // bắp bò thái mỏng
      } else {
        [[-5, -5], [6, -6], [0, -3]].forEach(function (p) { E(p[0], p[1], 3.2, 1.5, '#cfe3a3'); }); // bầu
      }
      E(8, -6, 2.4, 1, '#4c9a3e');                                  // hành lá
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1;      // khói
      [-5, 4].forEach(function (x0) { c.beginPath(); c.moveTo(x0, -10); c.quadraticCurveTo(x0 - 3, -14, x0, -18); c.stroke(); });
    } else if (id === 'galuoc') {
      plate();
      c.fillStyle = '#f3c75a';
      c.beginPath(); c.moveTo(-12, 1); c.quadraticCurveTo(-11, -8, 0, -7); c.quadraticCurveTo(11, -8, 12, 0); c.quadraticCurveTo(0, 4, -12, 1); c.fill();
      c.strokeStyle = '#e0a53a'; c.lineWidth = 0.8;
      [-6, -1, 4, 9].forEach(function (x0) { c.beginPath(); c.moveTo(x0, -6); c.lineTo(x0 - 1, 1); c.stroke(); });
      c.strokeStyle = '#2f7a34'; c.lineWidth = 1.1;
      [[-7, -6], [-1, -8], [5, -6]].forEach(function (p) { c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] + 4, p[1] + 1); c.stroke(); });
    }
    c.restore();
  }
  // Ảnh nhỏ của món để dùng trong popup (thực đơn, chọn món).
  function dishIcon(id, cls) {
    const url = foodPic(id);
    if (!url) { const e = document.createElement('span'); e.className = cls || 'dish-ic'; e.textContent = '🍽️'; return e; } // chưa có hình
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.className = cls || 'dish-ic';
    return img;
  }

  function renderMenu() {
    $('menu-salary').textContent = me.salary;
    const grid = $('menu-items');
    grid.textContent = '';
    MENU.forEach(function (m) {
      const b = document.createElement('button');
      b.className = 'shop-item';
      b.disabled = me.salary < m.price;
      b.appendChild(dishIcon(m.id));
      [['', m.name], ['price', m.price + 'k']].forEach(function (x) {
        const s = document.createElement('span');
        s.className = x[0];
        s.textContent = x[1];
        b.appendChild(s);
      });
      b.addEventListener('click', function () {
        const t = myTable();
        if (t < 0) { toast('Hãy ngồi vào một bàn ăn trước khi gọi món.'); return; }
        if (me.salary < m.price) return;
        b.disabled = true;
        post('/api/rest/order', { id: me.id, dish: m.id, table: t }).then(function (r) {
          if (r && r.ok) {
            addSalary(-m.price);
            toast('🛎️ Đã gọi ' + m.emoji + ' ' + m.name + ' — chị Liễu đang mang ra.');
          } else {
            toast(r && r.status === 409 ? 'Bàn đã có 10 món rồi, ăn bớt rồi gọi tiếp nhé.' : 'Chưa gọi được món, thử lại nhé.');
          }
          renderMenu();
        });
      });
      grid.appendChild(b);
    });
  }
  $('btn-menu').addEventListener('click', function () {
    renderMenu();
    $('menu').classList.remove('hidden');
    keys.clear();
  });
  $('menu-close').addEventListener('click', function () { $('menu').classList.add('hidden'); });

  // Ăn: chọn món đang có trên bàn mình.
  function renderDine() {
    const t = myTable();
    const list = $('dine-list');
    list.textContent = '';
    const ready = dishes.filter(function (d) { return d.table === t && Date.now() >= d.readyAt; });
    $('dine-sub').textContent = ready.length ? 'Món đang có trên bàn của bạn' : 'Bàn của bạn chưa có món nào — bấm Menu để gọi món.';
    ready.forEach(function (d) {
      const m = menuItem(d.dish);
      if (!m) return;
      const b = document.createElement('button');
      b.className = 'music-item dine-item';
      b.appendChild(dishIcon(m.id, 'dish-ic small'));
      b.appendChild(document.createTextNode(m.name));
      const by = document.createElement('span');
      by.className = 'music-credit';
      by.textContent = d.buyer === me.id ? 'Bạn gọi' : d.buyerName + ' gọi';
      b.appendChild(by);
      b.addEventListener('click', function () {
        post('/api/rest/eat', { id: me.id, dish: d.id }).then(function (r) {
          if (r && r.ok) {
            $('dine').classList.add('hidden');
            me.food = m.id;
            me.eatUntil = Date.now() + EAT_MS;
            setPose('eat');
            toast('😋 Ngon quá! Đang ăn ' + m.name.toLowerCase() + '.');
          } else {
            toast('Món này vừa có người ăn mất rồi.');
          }
        });
      });
      list.appendChild(b);
    });
  }
  // ---------- Góc nướng BBQ ----------
  function nearBBQ() { return Math.hypot(me.x - BBQ.x, me.y - BBQ.y) <= 90; }
  // Số người khác đang nướng trên bếp.
  function grillersNow() {
    let n = 0;
    others.forEach(function (o) { if (o.grill) n++; });
    return n;
  }
  const BBQ_FULL_MSG = '🔥 Bếp đang đủ 3 người nướng rồi, xếp hàng đợi đi bà già!';
  function renderBBQ() {
    $('bbq-salary').textContent = me.salary;
    const grid = $('bbq-items');
    grid.textContent = '';
    SKEWERS.forEach(function (s) {
      const b = document.createElement('button');
      b.className = 'shop-item';
      b.disabled = me.salary < BBQ_PRICE;
      const cv = document.createElement('canvas');
      cv.width = 76; cv.height = 52; cv.className = 'dish-ic';
      drawSkewer(cv.getContext('2d'), s.id, 38, 26, -0.35, 2);
      b.appendChild(cv);
      [['', s.name], ['price', BBQ_PRICE + 'k']].forEach(function (x) {
        const sp = document.createElement('span');
        sp.className = x[0];
        sp.textContent = x[1];
        b.appendChild(sp);
      });
      b.addEventListener('click', function () {
        if (!nearBBQ()) { toast('Đến gần bếp nướng mới nướng được nhé.'); return; }
        if (me.grillUntil > Date.now()) { toast('Đang nướng một xiên rồi, đợi chín đã.'); return; }
        if (grillersNow() >= BBQ_SLOTS) { toast(BBQ_FULL_MSG, 5000); return; }
        if (me.salary < BBQ_PRICE) return;
        addSalary(-BBQ_PRICE);
        me.grill = s.id;
        me.grillUntil = Date.now() + GRILL_MS;
        setPose('stand');
        $('bbq').classList.add('hidden');
        toast('🔥 Đang nướng xiên ' + s.name.toLowerCase() + ' — 5 giây nữa là chín.');
      });
      grid.appendChild(b);
    });
  }
  $('btn-bbq').addEventListener('click', function () {
    if (!nearBBQ()) { toast('Ra góc nướng BBQ trong quán mới nướng được nhé.'); return; }
    if (grillersNow() >= BBQ_SLOTS && !(me.grillUntil > Date.now())) { toast(BBQ_FULL_MSG, 5000); return; }
    renderBBQ();
    $('bbq').classList.remove('hidden');
    keys.clear();
  });
  $('bbq-close').addEventListener('click', function () { $('bbq').classList.add('hidden'); });
  function finishGrill() {
    const s = skewerById(me.grill);
    me.grillUntil = 0;
    me.food = me.grill;
    me.grill = null;
    me.bbqUntil = Date.now() + BBQ_EAT_MS;
    setPose('bbq');
    toast('🍢 Xiên ' + (s ? s.name.toLowerCase() : '') + ' chín rồi, ăn thôi!');
  }
  // Bỏ đi giữa lúc đang nướng → huỷ, trả lại tiền.
  function cancelGrill(msg) {
    if (!(me.grillUntil > Date.now())) return;
    me.grillUntil = 0;
    me.grill = null;
    addSalary(BBQ_PRICE);
    if (msg) toast(msg);
  }

  // Trà đá miễn phí: đứng gần bình mới lấy được, uống 5 giây.
  $('btn-tea').addEventListener('click', function () {
    if (Math.hypot(me.x - TRA_DA.x, me.y - TRA_DA.y) > 80) { toast('Ra chỗ bình trà đá cạnh quầy chị Liễu mới lấy được nhé.'); return; }
    me.drinkUntil = Date.now() + DRINK_MS;
    setPose('drink');
    toast('🧊 Trà đá miễn phí — uống cho mát!');
  });

  $('btn-dine').addEventListener('click', function () {
    if (myTable() < 0) { toast('Hãy ngồi vào một bàn ăn trước.'); return; }
    renderDine();
    $('dine').classList.remove('hidden');
    keys.clear();
  });
  $('dine-close').addEventListener('click', function () { $('dine').classList.add('hidden'); });

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

  // Quay cơm: đứng gần lò vi sóng → chờ 8 giây → "Ting!" → ngồi ăn cơm hộp.
  $('btn-microwave').addEventListener('click', function () {
    if (Math.hypot(me.x - MICROWAVE.x, me.y - MICROWAVE.y) > 70) { toast('Đến gần lò vi sóng trong pantry mới quay cơm được.'); return; }
    if (me.heatUntil > Date.now()) return;
    setPose('stand');
    me.heatUntil = Date.now() + HEAT_MS;
    toast('🍱 Đang quay cơm… đứng chờ ' + HEAT_MS / 1000 + ' giây nhé.');
  });
  function finishHeating() {
    me.heatUntil = 0;
    synth.ding();
    toast('🔔 Ting! Cơm nóng rồi, ăn thôi.');
    me.food = 'comhop';
    me.eatUntil = Date.now() + EAT_MS;
    setPose('eat');
    addStress(-3);
  }

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
    goScene('temple');
  });
  $('repent-no').addEventListener('click', function () { $('repent').classList.add('hidden'); });

  // ---------- Review đồng nghiệp ----------
  function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  // Review mẫu cho vui / để xem thử giao diện — đặt false để tắt.
  const SHOW_FAKE_REVIEWS = true;
  const FAKE_REVIEWS = [
    { fromName: 'Sếp Tổng', stars: 2, text: 'Hay ngủ gật dưới gầm bàn, cần cải thiện.', ago: 5 },
    { fromName: 'Chị Kế toán', stars: 5, text: 'Nộp hóa đơn đúng hạn, nói chuyện dễ thương.', ago: 32 },
    { fromName: 'Anh IT', stars: 4, text: 'Biết tự khởi động lại máy trước khi gọi IT. Hiếm có!', ago: 75 },
    { fromName: 'Em thực tập', stars: 5, text: 'Hay mua trà sữa cho cả phòng 🧋', ago: 120 },
    { fromName: 'Trưởng phòng', stars: 3, text: 'KPI tạm ổn, quay cơm hơi lâu.', ago: 240 },
  ];
  function allReviews() {
    const fake = SHOW_FAKE_REVIEWS ? FAKE_REVIEWS.map(function (r) {
      return { fromName: r.fromName, stars: r.stars, text: r.text, at: Date.now() - r.ago * 60000 };
    }) : [];
    return myReviews.concat(fake);
  }

  let reviewsBaseline = false; // lần nhận đầu sau khi vào văn phòng chỉ để nạp danh sách, không báo
  function onReviews(list) {
    if (reviewsBaseline) {
      const prev = new Map(myReviews.map(function (r) { return [r.from, r.at]; }));
      list.forEach(function (r) {
        if (prev.get(r.from) === r.at) return;
        toast(r.fromName + ' vừa review bạn ' + stars(r.stars) + (r.text ? ': ' + r.text : ''), 6000);
        if (r.stars <= 2) addStress(10);
      });
    }
    reviewsBaseline = true;
    myReviews = list;
    updateReviewBadge();
    if (!$('myreviews').classList.contains('hidden')) renderMyReviews();
  }
  function updateReviewBadge() { $('review-count').textContent = allReviews().length; }

  let reviewStars = 5;
  function paintStars() {
    document.querySelectorAll('#rv-stars button').forEach(function (b) {
      b.classList.toggle('on', Number(b.dataset.n) <= reviewStars);
    });
  }
  document.querySelectorAll('#rv-stars button').forEach(function (b) {
    b.addEventListener('click', function () { reviewStars = Number(b.dataset.n); paintStars(); });
  });
  $('btn-review').addEventListener('click', function () {
    if (others.size === 0) { toast('Chưa có đồng nghiệp nào trong văn phòng.'); return; }
    const sel = $('rv-to');
    sel.textContent = '';
    others.forEach(function (o, id) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = o.name || DEFAULT_OFFICE_NAME;
      sel.appendChild(opt);
    });
    reviewStars = 5;
    paintStars();
    $('rv-text').value = '';
    $('rv').classList.remove('hidden');
    keys.clear();
  });
  $('rv-close').addEventListener('click', function () { $('rv').classList.add('hidden'); });
  $('rv-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const to = $('rv-to').value;
    if (!to) return;
    const o = others.get(to);
    post('/api/review', { id: me.id, to: to, stars: reviewStars, text: $('rv-text').value.trim().slice(0, 200) }).then(function (r) {
      if (r && r.ok) toast('Đã review ' + (o ? o.name : DEFAULT_OFFICE_NAME) + ' ' + stars(reviewStars) + '.');
      else toast('Chưa gửi được review — thử lại sau giây lát.');
    });
    $('rv-text').blur();
    $('rv').classList.add('hidden');
  });

  function renderMyReviews() {
    const list = $('myreviews-list');
    list.textContent = '';
    const reviews = allReviews();
    if (!reviews.length) {
      $('myreviews-avg').textContent = 'Chưa có ai review bạn.';
      return;
    }
    const avg = reviews.reduce(function (s, r) { return s + r.stars; }, 0) / reviews.length;
    $('myreviews-avg').textContent = 'Trung bình ' + avg.toFixed(1) + ' / 5 ' + stars(Math.round(avg)) + ' · ' + reviews.length + ' review';
    reviews.sort(function (a, b) { return b.at - a.at; }).forEach(function (r) {
      const row = document.createElement('div');
      row.className = 'task-row';
      const info = document.createElement('div');
      info.className = 'task-info';
      const head = document.createElement('div');
      head.className = 'task-from';
      head.textContent = r.fromName + ' · ' + new Date(r.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const st = document.createElement('div');
      st.className = 'rv-stars-text';
      st.textContent = stars(r.stars);
      info.appendChild(head);
      info.appendChild(st);
      if (r.text) {
        const tx = document.createElement('div');
        tx.textContent = r.text;
        info.appendChild(tx);
      }
      row.appendChild(info);
      list.appendChild(row);
    });
  }
  $('btn-myreviews').addEventListener('click', function () {
    renderMyReviews();
    $('myreviews').classList.remove('hidden');
    keys.clear();
  });
  $('myreviews-close').addEventListener('click', function () { $('myreviews').classList.add('hidden'); });

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
    } else if (scene === 'temple' && me.stress > 0) {
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
      b.appendChild(picSpan(offerPic(it.id), it.name));
      [['', it.name], ['price', it.price + 'k']].forEach(function (x) {
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
  // Bản thu âm có bản quyền nên không kèm sẵn: đặt file mp3 vào public/assets/ đúng tên bên dưới.
  // Thiếu file thì tạm phát tiếng mõ + chuông tổng hợp.
  // credit: bản thu có sẵn trong app — Kittisaro & Thanissara (Spirit Rock, 2004), dharmaseed.org,
  // giấy phép CC BY-NC-ND 4.0 (phi thương mại, ghi nguồn, không chỉnh sửa).
  const DHARMA_SEED = 'Kittisaro & Thanissara — Dharma Seed (CC BY-NC-ND 4.0)';
  const TRACKS = [
    { id: 'mochuong', name: 'Tiếng mõ & chuông', file: null },
    { id: 'chudaibi', name: 'Chú Đại Bi', file: 'assets/chu-dai-bi.mp3', credit: DHARMA_SEED },
    { id: 'thichca', name: 'Nam mô Bổn Sư Thích Ca Mâu Ni Phật', file: 'assets/nam-mo-thich-ca.mp3', credit: DHARMA_SEED },
    { id: 'quanam', name: 'Nam mô Đại Bi Quán Thế Âm Bồ Tát', file: 'assets/nam-mo-quan-the-am.mp3', credit: DHARMA_SEED },
    { id: 'lucTu', name: 'Án Ma Ni Bát Mê Hồng', file: 'assets/an-ma-ni-bat-me-hong.mp3', credit: DHARMA_SEED },
    { id: 'tamchu', name: 'Bát Nhã Tâm Chú (Yết đế…)', file: 'assets/bat-nha-tam-chu.mp3', credit: DHARMA_SEED },
  ];
  // Mặc định: tiếng mõ & chuông (luôn có sẵn, không cần file).
  let track = TRACKS.find(function (t) { return t.id === store.get(K.track); }) ||
    TRACKS.find(function (t) { return !t.file; });
  let trackPicked = false; // user vừa tự chọn bài → mới báo khi thiếu file
  const missingTracks = new Set(); // bài chưa có file mp3
  let musicOn = false;
  bgm.volume = 0.6;
  function trackMissing(t) {
    if (missingTracks.has(t.id)) return;
    missingTracks.add(t.id);
    if (trackPicked) toast('Chưa có file nhạc "' + t.name + '" (' + t.file + ') — tạm phát tiếng mõ & chuông.', 6000);
    if (!$('music').classList.contains('hidden')) renderMusic();
  }
  bgm.addEventListener('error', function () {
    trackMissing(track);
    if (musicOn && scene === 'temple') synth.start('temple');
  });

  function startMusic() {
    musicOn = true;
    if (scene === 'office') { bgm.pause(); synth.start('office'); return; } // nhạc căng thẳng
    if (scene === 'restaurant') { bgm.pause(); synth.start('restaurant'); return; } // nhạc nhẹ ngũ cung
    synth.stop();
    if (!track.file || missingTracks.has(track.id)) { bgm.pause(); synth.start('temple'); return; }
    if (bgm.getAttribute('src') !== track.file) bgm.setAttribute('src', track.file);
    const p = bgm.play();
    if (p && p.catch) {
      p.catch(function (err) {
        if (err && err.name === 'NotAllowedError') return;
        trackMissing(track);
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
  function setMusic(on) {
    if (on) { synth.unlock(); startMusic(); } else stopMusic();
    store.set(K.music, on ? 'on' : 'off');
    updateMusicBtn();
  }

  // Popup chọn nhạc nền
  function renderMusic() {
    $('music-toggle').textContent = musicOn ? '🔇 Tắt nhạc' : '🔊 Bật nhạc';
    $('music-note').textContent = scene === 'office'
      ? 'Ở văn phòng chỉ có nhạc văn phòng — về chùa mới chọn được bài khác.'
      : scene === 'restaurant' ? 'Ở nhà hàng phát nhạc nhẹ nhàng — về chùa mới chọn được bài khác.' : '';
    const list = $('music-list');
    list.textContent = '';
    if (scene !== 'temple') return; // văn phòng / nhà hàng: không cho chọn bài
    TRACKS.forEach(function (t) {
      const b = document.createElement('button');
      b.className = 'music-item' + (t === track ? ' active' : '');
      b.textContent = (t === track ? '▶ ' : '🎵 ') + t.name;
      if (t.credit) {
        const cr = document.createElement('span');
        cr.className = 'music-credit';
        cr.textContent = t.credit;
        b.appendChild(cr);
      }
      if (missingTracks.has(t.id)) {
        const s = document.createElement('span');
        s.className = 'music-missing';
        s.textContent = ' (chưa có file)';
        b.appendChild(s);
      }
      b.addEventListener('click', function () {
        track = t;
        trackPicked = true;
        store.set(K.track, t.id);
        bgm.pause();
        setMusic(true);
        renderMusic();
      });
      list.appendChild(b);
    });
  }
  $('btn-music').addEventListener('click', function () {
    renderMusic();
    $('music').classList.remove('hidden');
    keys.clear();
  });
  $('music-toggle').addEventListener('click', function () { setMusic(!musicOn); renderMusic(); });
  $('music-close').addEventListener('click', function () { $('music').classList.add('hidden'); });

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
    // Nhà hàng: giai điệu ngũ cung chậm, êm (kiểu dân ca), nốt sáo dịu + nền trầm ấm.
    const REST_MELODY = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440,
      392, 440, 523.25, 587.33, 523.25, 440, 392, 0];          // 0 = nghỉ
    const REST_BASS = [130.81, 98, 110, 98];                   // Đô – Sol – La – Sol
    function restTick() {
      const n = REST_MELODY[beat % REST_MELODY.length];
      if (n) { tone(n, 1.6, 0.045, 'sine'); tone(n * 2, 0.8, 0.008, 'sine'); }
      if (beat % 4 === 0) tone(REST_BASS[(beat / 4) % REST_BASS.length], 3.2, 0.035, 'sine');
      beat++;
    }
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
        m = m === 'office' || m === 'restaurant' ? m : 'temple';
        if (!ac || (timer && mode === m)) return;
        if (timer) clearInterval(timer);
        mode = m;
        if (ac.resume) ac.resume();
        beat = 0;
        const fn = m === 'office' ? officeTick : m === 'restaurant' ? restTick : tick;
        fn();
        timer = setInterval(fn, m === 'office' ? 230 : m === 'restaurant' ? 650 : 720);
      },
      stop: function () {
        if (timer) clearInterval(timer);
        timer = null;
      },
      // Tiếng "ting" của lò vi sóng (không phụ thuộc nhạc nền đang bật hay tắt).
      ding: function () {
        if (!ac) return;
        if (ac.resume) ac.resume();
        tone(1568, 0.9, 0.18, 'sine');
        tone(2093, 0.7, 0.08, 'sine');
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
    me.wear = wearList();
    lastSent = '';
    if (!$('shop').classList.contains('hidden')) renderShop();
    syncRackShoe();
  }
  // Dép trên kệ luôn là đôi đang mang.
  function syncRackShoe() {
    const slot = myRackSlot();
    const shoe = myShoe();
    if (slot < 0 || !shoe || rack[slot].shoe === shoe.id) return;
    rack[slot].shoe = shoe.id;
    post('/api/shoes/wear', { id: me.id, shoe: shoe.id });
    if (!$('rack').classList.contains('hidden')) renderRack();
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
      b.appendChild(itemIcon(it));
      [['', it.name], ['price', it.price + ' điểm']].forEach(function (x) {
        const s = document.createElement('span');
        s.className = x[0];
        s.textContent = x[1];
        b.appendChild(s);
      });
      b.addEventListener('click', function () {
        if (getPoints() < it.price) return;
        setPoints(getPoints() - it.price);
        inv[it.id] = (inv[it.id] || 0) + 1;
        const cur = myShoe();
        const upgrade = it.slot === 'feet' && (!cur || it.price > cur.price);
        if (upgrade) worn.feet = it.id; // dép xịn hơn → mang luôn (kệ dép tự đổi theo)
        saveInv();
        toast('Đã đổi ' + it.emoji + ' ' + it.name + '.' + (upgrade ? ' Bạn đã mang đôi mới.' : ''));
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
      info.appendChild(itemIcon(it, 'inv-ic'));
      info.appendChild(document.createTextNode(' ' + it.name + ' ×' + inv[it.id]));
      row.appendChild(info);
      const wearing = worn[it.slot] === it.id;
      const btns = [
        [wearing ? 'Cởi' : 'Mặc', wearing ? '' : 'primary', function () {
          if (wearing && it.slot === 'feet' && shoeCount() <= 1) { toast('Bạn chỉ có 1 đôi dép, không cởi được.'); return; }
          if (wearing) delete worn[it.slot];
          else worn[it.slot] = it.id;
          saveInv();
        }],
        ['Tặng', '', function () { giftItem(it); }],
        ['Xóa', '', function () {
          if (shoeLocked(it)) { toast(shoeLocked(it)); return; }
          confirmBox('Xóa 1 ' + it.emoji + ' ' + it.name + ' khỏi túi đồ?', 'Xóa', function () { removeOne(it.id); });
        }],
      ];
      // Đôi dép duy nhất: không cởi / tặng / xóa được → ẩn hết nút.
      if (it.slot === 'feet' && shoeCount() <= 1) {
        btns.length = 0;
        const tag = document.createElement('span');
        tag.className = 'task-from';
        tag.textContent = 'đang mang';
        row.appendChild(tag);
      }
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

  // Không cho tặng / xoá: đôi đang để trên kệ, hoặc đôi dép cuối cùng.
  function shoeLocked(it) {
    if (it.slot !== 'feet') return '';
    if (shoeCount() <= 1) return 'Bạn phải luôn có ít nhất 1 đôi dép.';
    const slot = myRackSlot();
    if (slot >= 0 && rack[slot].shoe === it.id && inv[it.id] <= 1) return 'Đôi dép này đang để ở kệ ngoài cửa chùa.';
    return '';
  }
  // Popup xác nhận dùng chung (thay cho window.confirm).
  let confirmAction = null;
  function confirmBox(text, okLabel, onOk) {
    $('confirm-text').textContent = text;
    $('confirm-ok').textContent = okLabel || 'Đồng ý';
    confirmAction = onOk;
    $('confirm').classList.remove('hidden');
  }
  $('confirm-ok').addEventListener('click', function () {
    $('confirm').classList.add('hidden');
    const f = confirmAction;
    confirmAction = null;
    if (f) f();
  });
  $('confirm-cancel').addEventListener('click', function () {
    confirmAction = null;
    $('confirm').classList.add('hidden');
  });

  function giftItem(it) {
    if (shoeLocked(it)) { toast(shoeLocked(it)); return; }
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

  // ---------- Kệ dép ngoài cửa chùa ----------
  const RACK_SIZE = 60;
  // Đồ đang mặc + đôi dép đang mang (dép luôn có, kể cả khi chưa chọn "Mặc").
  function wearList() {
    const w = Object.values(worn);
    const s = myShoe();
    if (s && w.indexOf(s.id) < 0) w.push(s.id);
    return w;
  }
  function myRackSlot() {
    return rack.findIndex(function (s) { return s && s.owner === me.id; });
  }
  // Đôi dép đang mang: đôi đã chọn "Mặc", nếu chưa chọn thì đôi xịn nhất đang có.
  function myShoe() {
    if (worn.feet && inv[worn.feet] > 0) return ITEM_BY_ID.get(worn.feet);
    const own = ITEMS.filter(function (it) { return it.slot === 'feet' && inv[it.id] > 0; });
    return own.length ? own[own.length - 1] : null;
  }
  let mustPlace = false;
  function askShoes() {
    if (!online) return;
    const shoe = myShoe();
    if (!shoe) { toast('Bạn không có dép — đi chân đất vào chùa.'); return; }
    mustPlace = true;
    renderRack();
    $('rack').classList.remove('hidden');
    keys.clear();
    // Không kết nối được server thì đừng giữ chân user ở kệ dép.
    setTimeout(function () {
      if (mustPlace && !rack.length) {
        mustPlace = false;
        if (!$('rack').classList.contains('hidden')) renderRack();
      }
    }, 5000);
  }

  function renderRack() {
    if (!pendingSteal) $('steal').classList.add('hidden');
    const mine = myRackSlot();
    if (mine >= 0) mustPlace = false;
    const shoe = myShoe();
    $('rack-sub').textContent = mustPlace
      ? 'Vui lòng để dép bên ngoài khi vào chùa. Bạn đang có một đôi ' + (shoe ? shoe.name.toLowerCase() : 'dép') + '. Chọn một ô trống — nếu không chọn, dép sẽ được để vào một ô bất kỳ.'
      : (mine >= 0 ? 'Dép của bạn ở ô ' + (mine + 1) + '.' : 'Bạn đang đi chân đất.');
    const grid = $('rack-grid');
    grid.textContent = '';
    for (let i = 0; i < RACK_SIZE; i++) {
      const s = rack[i];
      const cell = document.createElement('button');
      cell.className = 'rack-cell' + (s ? (s.owner === me.id ? ' mine' : ' taken') : '');
      if (s) {
        const it = ITEM_BY_ID.get(s.shoe);
        const e = itemIcon(it);
        const n = document.createElement('span');
        n.className = 'owner';
        n.textContent = s.name;
        cell.appendChild(e);
        cell.appendChild(n);
        cell.title = (it ? it.name : 'Dép') + ' của ' + s.name + (s.owner === me.id ? ' (bạn)' : '');
      } else {
        cell.textContent = String(i + 1);
      }
      cell.addEventListener('click', function () { onRackCell(i); });
      grid.appendChild(cell);
    }
  }

  function onRackCell(i) {
    const s = rack[i];
    if (!s) {
      const shoe = myShoe();
      if (myRackSlot() >= 0 || !shoe) return;
      post('/api/shoes/place', { id: me.id, slot: i, shoe: shoe.id }).then(function (r) {
        if (r && r.ok) {
          // Hiện ngay đôi dép + tên mình ở ô vừa chọn (server cũng gửi kệ mới cho mọi người).
          rack[i] = { owner: me.id, name: me.name, shoe: shoe.id };
          mustPlace = false;
          renderRack();
          toast('👡 Đã để ' + shoe.name.toLowerCase() + ' ở ô ' + (i + 1) + '. Mời vào chùa!');
        } else {
          toast('Chưa để được dép (ô vừa có người để, hoặc mạng chậm) — thử lại nhé.');
        }
      });
      return;
    }
    if (s.owner === me.id) return;
    if (store.get(K.stealDate) === todayStr()) { toast('Hôm nay bạn đã dùng hết phước rồi, hãy đợi đến ngày mai.', 6000); return; }
    const it = ITEM_BY_ID.get(s.shoe);
    // Popup xác nhận kèm lời nhắc giới luật; chỉ lấy khi bấm "Vẫn cầm nhầm".
    $('steal-text').textContent = 'Bạn sắp cầm nhầm đôi ' + (it ? it.name.replace(/^Dép /, '') : 'dép') + ' của ' + s.name + '.';
    $('steal').classList.remove('hidden');
    $('steal').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    pendingSteal = { i: i, s: s, it: it };
  }

  let pendingSteal = null;
  $('steal-cancel').addEventListener('click', function () {
    pendingSteal = null;
    $('steal').classList.add('hidden');
    toast('🙏 Lành thay! Không lấy của không cho là giữ giới.');
  });
  $('steal-ok').addEventListener('click', function () {
    $('steal').classList.add('hidden');
    if (pendingSteal) doSteal(pendingSteal.i, pendingSteal.s, pendingSteal.it);
    pendingSteal = null;
  });

  function doSteal(i, s, it) {
    // Chưa để dép lên kệ thì gửi kèm đôi đang mang để để lại ở ô kia.
    const carried = myRackSlot() < 0 && myShoe() ? myShoe().id : undefined;
    post('/api/shoes/steal', { id: me.id, slot: i, gave: carried }).then(function (r) {
      if (r && r.ok) {
        store.set(K.stealDate, todayStr());
        return r.json().then(function (d) {
          const gave = ITEM_BY_ID.get(d.gave);
          if (it) { inv[it.id] = (inv[it.id] || 0) + 1; worn.feet = it.id; }
          if (gave && inv[gave.id] > 0) removeOne(gave.id); else saveInv(); // đôi của mình để lại cho người kia
          toast('Bạn đã lấy ' + (it ? it.emoji + ' ' + it.name : 'dép') + ' của ' + s.name +
            (gave ? ', để lại ' + gave.emoji + ' ' + gave.name + ' cho họ.' : '.'));
        });
      } else if (r && r.status === 429) {
        store.set(K.stealDate, todayStr());
        toast('Hôm nay bạn đã dùng hết phước rồi, hãy đợi đến ngày mai.', 6000);
      } else {
        toast('Đôi dép đó vừa được chủ lấy đi rồi.');
      }
    });
  }

  $('btn-rack').addEventListener('click', function () {
    renderRack();
    $('rack').classList.remove('hidden');
    keys.clear();
  });
  // Để dép vào một ô còn trống bất kỳ; ô vừa bị người khác chiếm thì thử ô trống khác.
  function autoPlace(shoe, tries) {
    const empty = [];
    for (let k = 0; k < RACK_SIZE; k++) if (!rack[k]) empty.push(k);
    if (!empty.length) { toast('Kệ dép đã kín chỗ — bạn cầm dép vào chùa vậy.'); return; }
    const i = empty[Math.floor(Math.random() * empty.length)];
    post('/api/shoes/place', { id: me.id, slot: i, shoe: shoe.id }).then(function (r) {
      if (r && r.ok) {
        rack[i] = { owner: me.id, name: me.name, shoe: shoe.id };
        toast('👡 Đã để ' + shoe.name.toLowerCase() + ' ở ô ' + (i + 1) + '. Mời vào chùa!');
      } else if (tries > 1) {
        rack[i] = rack[i] || { owner: '', name: '', shoe: '' }; // đánh dấu ô này đã có người để
        autoPlace(shoe, tries - 1);
      }
    });
  }

  $('rack-close').addEventListener('click', function () {
    pendingSteal = null;
    $('steal').classList.add('hidden');
    $('rack').classList.add('hidden');
    // Chưa để dép mà đóng kệ → tự để vào một ô trống bất kỳ (vào chùa vẫn phải để dép ở ngoài).
    const shoe = myShoe();
    if (!mustPlace || myRackSlot() >= 0 || !shoe) return;
    mustPlace = false;
    autoPlace(shoe, 3);
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
  let barH = 0; // chiều cao thanh nút + ô chat dưới cùng (px màn hình)
  const IS_TOUCH = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, IS_TOUCH ? 1.5 : 2); // điện thoại: nhẹ hơn, vẫn nét
    const rect = canvas.getBoundingClientRect();
    cw = rect.width || window.innerWidth;
    ch = rect.height || window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    // Điện thoại: phóng to cảnh (dọc ~460 đơn vị bề ngang, ngang ~500 đơn vị chiều cao), camera đi theo nhân vật.
    const fit = cw < ch ? cw / 460
      : IS_TOUCH && ch < 600 ? ch / 500
      : Math.min(cw / 900, ch / 640);
    scale = clamp(fit, 0.55, 1.6);
  }
  window.addEventListener('resize', resize);
  resize();
  // Đo lại thanh dưới mỗi khi nó hiện ra / đổi cỡ (lúc tải trang nó còn ẩn sau màn nhập tên nên cao 0)
  const bottomBar = document.getElementById('bottombar');
  const measureBar = function () { barH = bottomBar ? bottomBar.offsetHeight : 0; };
  if (bottomBar && window.ResizeObserver) new ResizeObserver(measureBar).observe(bottomBar);
  // iPhone: bàn phím bật thì trình duyệt cuộn trang lên cho thấy ô nhập → lộ nền trắng dưới trang, mất thanh trên.
  // Giữ trang không cuộn, thu khung game theo phần màn hình còn thấy và đặt thanh chat ngay trên bàn phím.
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const fitKeyboard = function () {
      const kb = Math.max(0, Math.round(window.innerHeight - vv.height)); // phần bị bàn phím che (đo trước khi cuộn về)
      document.documentElement.style.setProperty('--kb', kb + 'px');
      document.documentElement.classList.toggle('kb-open', kb > 80); // bàn phím đang bật
      if (window.scrollY || vv.offsetTop) window.scrollTo(0, 0);
      resize();
    };
    vv.addEventListener('resize', fitKeyboard);
    vv.addEventListener('scroll', fitKeyboard);
    // trình duyệt trong Messenger đôi khi báo đổi cỡ chậm: đo lại sau khi bấm vào / rời ô nhập
    document.addEventListener('focusin', function () { setTimeout(fitKeyboard, 350); });
    document.addEventListener('focusout', function () { setTimeout(fitKeyboard, 350); });
  }

  function updateCamera() {
    const vw = cw / scale;
    const vh = ch / scale;
    camX = vw >= W ? (W - vw) / 2 : clamp(me.x - vw / 2, 0, W - vw);
    // Đến gần bát hương thì camera không lên cao quá đỉnh tượng (chừa 60 cho thanh trên),
    // miễn nhân vật vẫn nằm trong 75% chiều cao màn hình.
    const followY = scene === 'temple'
      ? Math.min(me.y - vh * 0.62, Math.max(STATUE_TOP - 60, me.y - vh * 0.75))
      : me.y - vh * 0.62;
    // cho cuộn quá đáy bản đồ một đoạn bằng thanh dưới, để đi sát đáy không bị ô chat che người
    if (!window.ResizeObserver) barH = bottomBar ? bottomBar.offsetHeight : 0; // trình duyệt cũ: đo mỗi khung hình
    camY = vh >= H ? (H - vh) / 2 : clamp(followY, 0, H - vh + barH / scale);
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
    if (!vx && !vy && Math.hypot(joy.x, joy.y) > 0.2 && !typing() && !overlayOpen()) {
      vx = joy.x;
      vy = joy.y;
    }
    if (!vx && !vy && me.target) {
      const dx = me.target.x - me.x, dy = me.target.y - me.y;
      const d = Math.hypot(dx, dy);
      if (d < 4) me.target = null;
      else { vx = dx / d; vy = dy / d; }
    }
    const moving = vx || vy;
    me.moving = !!moving;
    // Hướng mặt theo hướng đi (4 hướng); đứng lại thì giữ hướng vừa quay.
    if (moving) {
      if (Math.abs(vy) > Math.abs(vx) * 1.2) me.face = vy < 0 ? 'u' : 'd';
      else me.face = vx < 0 ? 'l' : 'r';
    }
    if (moving) {
      const len = Math.hypot(vx, vy);
      const ox = me.x, oy = me.y;
      me.x = clamp(me.x + (vx / len) * SPEED * dt, BOUNDS.minX, BOUNDS.maxX);
      me.y = clamp(me.y + (vy / len) * SPEED * dt, BOUNDS.minY, BOUNDS.maxY);
      (scene === 'office' ? OFFICE_OBSTACLES : scene === 'restaurant' ? REST_OBSTACLES : OBSTACLES).forEach(function (o) {
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
      if (me.heatUntil) { me.heatUntil = 0; toast('Bỏ dở quay cơm rồi.'); }
      cancelGrill('Bỏ dở nướng xiên — đã trả lại ' + BBQ_PRICE + 'k.');
      if (me.pose === 'bbq' && me.bbqUntil > Date.now()) {
        // đang ăn xiên nướng: vừa đi vừa ăn tới hết 10 giây
      } else if (me.pose !== 'walk') {
        me.pose = 'walk';
        document.querySelectorAll('[data-pose], #btn-eat, #btn-sleep').forEach(function (b) { b.classList.remove('active'); });
      }
    } else if (me.pose === 'walk') {
      setPose('stand');
    } else if (me.pose === 'eat' && Date.now() >= me.eatUntil) {
      setPose('sit'); // ăn xong vẫn ngồi
    } else if (me.pose === 'drink' && Date.now() >= me.drinkUntil) {
      setPose('stand'); // uống xong, cốc biến mất
    } else if (me.pose === 'bbq' && Date.now() >= me.bbqUntil) {
      setPose('stand'); // ăn xong xiên
    }
    if (me.grillUntil && Date.now() >= me.grillUntil) finishGrill();
    if (me.heatUntil && Date.now() >= me.heatUntil) finishHeating();

    const k = Math.min(1, dt * 10);
    others.forEach(function (o) {
      o.moving = Math.hypot(o.x - o.rx, o.y - o.ry) > 2; // để vẽ bước chân khi vừa đi vừa ăn
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
    ctx.font = 'bold 16px sans-serif' + EMOJI_FONT;
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
    ctx.font = 'bold 15px sans-serif' + EMOJI_FONT;
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
  function drawPantryCounter(t, mwOn, mwLeft) {
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
    ctx.fillStyle = mwOn ? '#ffd76a' : '#7fa6c4';
    ctx.fillRect(1156, 415, 36, 20);
    if (mwOn) {
      ctx.fillStyle = '#e8eef3';                             // đĩa xoay
      ctx.beginPath(); ctx.ellipse(1174, 431, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.arc(1174 + Math.cos(t / 300) * 8, 429, 3, 0, Math.PI * 2); ctx.fill();
      const g = ctx.createRadialGradient(1174, 425, 2, 1174, 425, 30);
      g.addColorStop(0, 'rgba(255,215,106,.45)');
      g.addColorStop(1, 'rgba(255,215,106,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(1174, 425, 30, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = mwOn ? '#7dff9a' : '#55606b';          // màn hình giờ
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mwLeft > 0 ? '0:0' + Math.ceil(mwLeft / 1000) : '--', 1201, 425);
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
    ctx.font = 'bold 13px sans-serif' + EMOJI_FONT;
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
  // Người đang ngồi ghế này quay hướng nào ('d' mặc định: lưng ghế phía sau)
  function chairFace(c) {
    let face = 'd';
    const check = function (p, x, y) {
      if ((p.pose === 'sit' || p.pose === 'eat') && Math.abs(x - c.x) < 6 && Math.abs(y - (c.y + 2)) < 6) {
        face = p.pose === 'eat' ? 'd' : p.face || 'd'; // đang ăn luôn quay ra trước
      }
    };
    if (started) check(me, me.x, me.y);
    others.forEach(function (o) { check(o, o.rx, o.ry); });
    return face;
  }
  function drawChairBack(x, y) { // lưng ghế chắn trước người ngồi quay vào bàn
    ctx.fillStyle = '#2f343a';
    ctx.fillRect(x - 18, y - 36, 36, 30);
  }
  function drawChair(c) {
    const x = c.x, y = c.y, face = chairFace(c);
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(x, y + 14, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a3f45';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 12);
    ctx.moveTo(x - 16, y + 14); ctx.lineTo(x + 16, y + 14);
    ctx.stroke();
    ctx.fillStyle = '#2f343a';
    if (face === 'd') ctx.fillRect(x - 18, y - 44, 36, 36);                       // lưng ghế phía sau người
    else if (face === 'l' || face === 'r') ctx.fillRect(face === 'r' ? x - 22 : x + 14, y - 40, 8, 34); // lưng ghế bên cạnh
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

  // ---------- Vẽ nhà hàng ----------
  function drawRestWall() {
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
    g.addColorStop(0, '#f3e3c3');
    g.addColorStop(1, '#e6cfa1');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, FLOOR_TOP);
    ctx.fillStyle = '#8a5a3c';                         // ốp gỗ chân tường
    ctx.fillRect(0, FLOOR_TOP - 90, W, 90);
    ctx.strokeStyle = 'rgba(0,0,0,.18)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, FLOOR_TOP - 90); ctx.lineTo(x, FLOOR_TOP); ctx.stroke(); }
    // biển hiệu
    ctx.fillStyle = '#9c2a20';
    ctx.fillRect(480, 200, 440, 70);
    ctx.strokeStyle = '#e8b64c';
    ctx.lineWidth = 4;
    ctx.strokeRect(486, 206, 428, 58);
    ctx.fillStyle = '#f5d98b';
    ctx.font = 'bold 30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUÁN CHIẾC THÚNG', 700, 236);
    // bảng thực đơn
    ctx.fillStyle = '#2f3a2f';
    ctx.fillRect(950, 205, 190, 130);
    ctx.strokeStyle = '#8a5a3c';
    ctx.lineWidth = 6;
    ctx.strokeRect(950, 205, 190, 130);
    ctx.fillStyle = '#f2ece2';
    ctx.font = 'bold 16px sans-serif' + EMOJI_FONT;
    ctx.fillText('THỰC ĐƠN', 1045, 224);
    ctx.font = '12px sans-serif' + EMOJI_FONT;
    ctx.textAlign = 'left';
    MENU.slice(0, 5).forEach(function (m, i) { ctx.fillText(m.name + ' ... ' + m.price + 'k', 960, 246 + i * 17); });
    // tranh đồng lúa
    [[100, 280], [380, 280]].forEach(function (p) {
      ctx.fillStyle = '#8a5a3c';
      ctx.fillRect(p[0] - 70, p[1] - 50, 140, 100);
      ctx.fillStyle = '#9fd3f0';
      ctx.fillRect(p[0] - 62, p[1] - 42, 124, 50);
      ctx.fillStyle = '#7fb847';
      ctx.fillRect(p[0] - 62, p[1] + 8, 124, 34);
      ctx.fillStyle = '#e8c35a';
      ctx.beginPath(); ctx.arc(p[0] + 30, p[1] - 22, 9, 0, Math.PI * 2); ctx.fill();
    });
    // đèn lồng Hội An nhiều màu (có nan, tua rua, toả sáng)
    const LANTERN_COLORS = ['#e74c3c', '#f1c40f', '#e67e22', '#c0392b', '#f39c12', '#d35400'];
    [90, 240, 390, 1010, 1160, 1310].forEach(function (x, i) {
      const cy = 146 + (i % 2) * 16; // treo thấp để đi sát tường vẫn thấy cả chiếc đèn
      const col = LANTERN_COLORS[i % LANTERN_COLORS.length];
      const g = ctx.createRadialGradient(x, cy, 4, x, cy, 46);
      g.addColorStop(0, 'rgba(255,200,110,.45)');
      g.addColorStop(1, 'rgba(255,200,110,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, cy, 46, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3a2414';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cy - 22); ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x - 6, cy - 20);
      ctx.bezierCurveTo(x - 24, cy - 14, x - 24, cy + 14, x - 6, cy + 20);
      ctx.lineTo(x + 6, cy + 20);
      ctx.bezierCurveTo(x + 24, cy + 14, x + 24, cy - 14, x + 6, cy - 20);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(90,30,10,.45)'; // nan đèn
      ctx.lineWidth = 1;
      [-10, 0, 10].forEach(function (dx) {
        ctx.beginPath(); ctx.moveTo(x + dx * 0.4, cy - 20); ctx.quadraticCurveTo(x + dx * 1.7, cy, x + dx * 0.4, cy + 20); ctx.stroke();
      });
      ctx.fillStyle = '#5a3519'; // chóp + đế gỗ
      ctx.fillRect(x - 7, cy - 24, 14, 5);
      ctx.fillRect(x - 7, cy + 19, 14, 5);
      ctx.strokeStyle = '#c0392b'; // tua rua
      ctx.lineWidth = 1.2;
      for (let k = -3; k <= 3; k += 2) { ctx.beginPath(); ctx.moveTo(x + k, cy + 24); ctx.lineTo(x + k, cy + 40); ctx.stroke(); }
    });
    // cửa bếp + biển
    ctx.fillStyle = '#5a3519';
    ctx.fillRect(1160, 230, 150, 110);
    ctx.fillStyle = '#2b1a0e';
    ctx.fillRect(1172, 242, 126, 98);
    ctx.fillStyle = '#f5d98b';
    ctx.font = 'bold 16px sans-serif' + EMOJI_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('BẾP', 1235, 220);
    ctx.fillText('LỄ TÂN', 210, 330);
  }

  function drawRestFloor() {
    const tile = 70;
    for (let y = FLOOR_TOP; y < H; y += tile) {
      for (let x = 0; x < W; x += tile) {
        const odd = ((x / tile) + Math.floor((y - FLOOR_TOP) / tile)) % 2;
        ctx.fillStyle = odd ? '#c9774a' : '#bb6a40';
        ctx.fillRect(x, y, tile, tile);
      }
    }
    ctx.strokeStyle = 'rgba(90,40,15,.35)';
    ctx.lineWidth = 2;
    for (let y = FLOOR_TOP; y <= H; y += tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x <= W; x += tile) { ctx.beginPath(); ctx.moveTo(x, FLOOR_TOP); ctx.lineTo(x, H); ctx.stroke(); }
  }

  // Quầy lễ tân (có chuông) và quầy bếp.
  function drawCounter(x0, x1, y, top, front) {
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.fillRect(x0, y + 4, x1 - x0, 8);
    ctx.fillStyle = front;
    ctx.fillRect(x0, y - 40, x1 - x0, 44);
    ctx.fillStyle = top;
    ctx.fillRect(x0 - 4, y - 48, x1 - x0 + 8, 10);
  }
  function drawReception(t) {
    drawCounter(100, 320, 520, '#d9a441', '#7a3d12');
    // bình hoa
    ctx.strokeStyle = '#3d8b3a';
    ctx.lineWidth = 1.5;
    [[-7, -26], [0, -32], [7, -25], [-3, -20], [4, -19]].forEach(function (s) {
      ctx.beginPath(); ctx.moveTo(150, 456); ctx.lineTo(150 + s[0], 456 + s[1]); ctx.stroke();
    });
    [[-7, -26, '#e74c3c'], [0, -32, '#f19cb7'], [7, -25, '#f1c40f'], [-3, -20, '#f19cb7'], [4, -19, '#e74c3c']].forEach(function (f) {
      ctx.fillStyle = f[2];
      ctx.beginPath(); ctx.arc(150 + f[0], 456 + f[1], 3.6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#3b6fb6';
    ctx.beginPath(); ctx.moveTo(145, 452); ctx.lineTo(155, 452); ctx.quadraticCurveTo(160, 462, 156, 472); ctx.lineTo(144, 472); ctx.quadraticCurveTo(140, 462, 145, 452); ctx.fill();
    ctx.fillStyle = '#f4f6f8';
    ctx.fillRect(144, 460, 12, 2);
    ctx.fillStyle = '#e8b64c';                           // chuông gọi
    ctx.beginPath(); ctx.arc(290, 472, 6, Math.PI, 0); ctx.fill();
    ctx.fillRect(283, 472, 14, 2);
  }
  // Bàn thờ Ông Địa – Thần Tài đặt sát đất: bệ thấp, khám thờ ngay trên bệ, đồ cúng phía trước.
  function drawOngDia(t) {
    const x = ONG_DIA.x, y = ONG_DIA.y;
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, 48, 8, 0, 0, Math.PI * 2); ctx.fill();
    // khám thờ: vách sau + mái
    ctx.fillStyle = '#9c2a20';
    ctx.fillRect(x - 42, y - 78, 84, 58);
    ctx.fillStyle = '#5a1410';
    ctx.beginPath(); ctx.moveTo(x - 36, y - 20); ctx.lineTo(x - 36, y - 64); ctx.quadraticCurveTo(x, y - 78, x + 36, y - 64); ctx.lineTo(x + 36, y - 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a1f16';
    ctx.beginPath(); ctx.moveTo(x - 50, y - 78); ctx.lineTo(x + 50, y - 78); ctx.lineTo(x + 38, y - 90); ctx.lineTo(x - 38, y - 90); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8b64c';
    ctx.fillRect(x - 50, y - 80, 100, 3);

    // Ông Địa (trái): đầu hói tóc hai bên, cười toe, phanh áo đỏ khoe bụng, cầm quạt mo
    const ox = x - 16;
    ctx.fillStyle = '#c0392b';                                   // áo đỏ phanh ngực
    ctx.beginPath(); ctx.ellipse(ox - 7, y - 32, 6, 11, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ox + 7, y - 32, 6, 11, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0c48e';                                   // bụng phệ
    ctx.beginPath(); ctx.ellipse(ox, y - 30, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c99a6a';
    ctx.beginPath(); ctx.arc(ox, y - 29, 1, 0, Math.PI * 2); ctx.fill(); // rốn
    ctx.fillStyle = '#f0c48e';                                   // đầu hói
    ctx.beginPath(); ctx.arc(ox, y - 48, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2018';                                   // tóc hai bên
    ctx.beginPath(); ctx.ellipse(ox - 7, y - 48, 2.2, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ox + 7, y - 48, 2.2, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7a3a12';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ox - 3, y - 49, 1.6, Math.PI, 0); ctx.stroke();  // mắt híp cười
    ctx.beginPath(); ctx.arc(ox + 3, y - 49, 1.6, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#9c2a20';                                   // miệng cười toe
    ctx.beginPath(); ctx.arc(ox, y - 45, 3.2, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#d9b26a';                                   // quạt mo
    ctx.beginPath(); ctx.ellipse(ox - 15, y - 40, 5, 7, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(ox - 13, y - 34); ctx.lineTo(ox - 10, y - 28); ctx.stroke();

    // Thần Tài (phải): mũ cánh chuồn, râu dài, áo vàng đai đỏ, ôm thỏi vàng
    const tx = x + 16;
    ctx.fillStyle = '#d9a441';                                   // áo vàng
    ctx.beginPath(); ctx.moveTo(tx - 8, y - 42); ctx.lineTo(tx + 8, y - 42); ctx.lineTo(tx + 12, y - 21); ctx.lineTo(tx - 12, y - 21); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(tx - 9, y - 33, 18, 2.5);                       // đai đỏ
    ctx.fillStyle = '#f0c48e';
    ctx.beginPath(); ctx.arc(tx, y - 49, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1d1d1f';                                   // râu dài
    ctx.beginPath(); ctx.moveTo(tx - 4, y - 46); ctx.lineTo(tx + 4, y - 46); ctx.lineTo(tx, y - 34); ctx.closePath(); ctx.fill();
    ctx.fillRect(tx - 5, y - 47.5, 10, 1.6);                     // ria mép
    ctx.fillRect(tx - 7, y - 59, 14, 5);                         // mũ cánh chuồn
    ctx.fillRect(tx - 4, y - 63, 8, 4);
    ctx.beginPath(); ctx.ellipse(tx - 11, y - 57, 4.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(tx + 11, y - 57, 4.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c230';                                   // thỏi vàng
    ctx.beginPath(); ctx.moveTo(tx - 7, y - 28); ctx.quadraticCurveTo(tx, y - 22, tx + 7, y - 28); ctx.lineTo(tx + 4, y - 31); ctx.quadraticCurveTo(tx, y - 27, tx - 4, y - 31); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe58a';
    ctx.beginPath(); ctx.ellipse(tx, y - 30, 2.6, 1.6, 0, 0, Math.PI * 2); ctx.fill();

    // bệ thờ thấp sát đất (kệ đặt đồ cúng)
    ctx.fillStyle = '#9c2a20';
    ctx.fillRect(x - 48, y - 20, 96, 20);
    ctx.fillStyle = '#7a1f16';
    ctx.fillRect(x - 50, y - 22, 100, 5);
    ctx.strokeStyle = '#e8b64c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 45, y - 15, 90, 12);

    // đèn dầu hai góc mái
    [x - 44, x + 44].forEach(function (lx, i) {
      const g = ctx.createRadialGradient(lx, y - 26, 1, lx, y - 26, 11);
      g.addColorStop(0, 'rgba(255,190,90,' + (0.6 + Math.sin(t / 150 + i) * 0.15) + ')');
      g.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(lx, y - 26, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(lx - 3, y - 23, 6, 4);
      ctx.fillStyle = '#ffcf5c';
      ctx.beginPath(); ctx.ellipse(lx, y - 26, 1.5, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    });
    // bình hoa cúc vàng (trái)
    ctx.strokeStyle = '#3d8b3a';
    ctx.lineWidth = 1.2;
    [[-5, -13], [0, -17], [5, -12]].forEach(function (s) { ctx.beginPath(); ctx.moveTo(x - 32, y - 26); ctx.lineTo(x - 32 + s[0], y - 26 + s[1]); ctx.stroke(); });
    ctx.fillStyle = '#f2c230';
    [[-5, -13], [0, -17], [5, -12]].forEach(function (s) { ctx.beginPath(); ctx.arc(x - 32 + s[0], y - 26 + s[1], 3.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#3b6fb6';
    ctx.fillRect(x - 36, y - 28, 8, 7);
    // bát hương + 3 nén nhang (giữa, giữa hai tượng)
    ctx.fillStyle = '#b8862e';
    ctx.beginPath(); ctx.moveTo(x - 7, y - 28); ctx.lineTo(x + 7, y - 28); ctx.lineTo(x + 5, y - 21); ctx.lineTo(x - 5, y - 21); ctx.closePath(); ctx.fill();
    [-3, 0, 3].forEach(function (dx, i) {
      ctx.strokeStyle = '#8b2a1a';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x + dx, y - 28); ctx.lineTo(x + dx * 1.4, y - 46); ctx.stroke();
      ctx.fillStyle = 'rgba(255,120,40,' + (0.7 + Math.sin(t / 200 + i) * 0.3) + ')';
      ctx.beginPath(); ctx.arc(x + dx * 1.4, y - 46, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(230,220,210,.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + dx * 1.4, y - 47);
      for (let k = 1; k <= 6; k++) ctx.lineTo(x + dx * 1.4 + Math.sin(t / 700 + k * 0.7 + i) * k * 0.8, y - 47 - k * 4);
      ctx.stroke();
    });
    // đĩa quả cúng (phải)
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.ellipse(x + 32, y - 23, 10, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f0d27a';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(x + 29, y - 30, 6, Math.PI * 0.1, Math.PI * 0.8); ctx.stroke();
    [[-5, -26], [0, -26], [5, -26], [-2, -31], [3, -31], [0, -36]].forEach(function (f, k) {
      ctx.fillStyle = k === 5 ? '#c0392b' : '#f39c12';
      ctx.beginPath(); ctx.arc(x + 32 + f[0], y + f[1], 2.8, 0, Math.PI * 2); ctx.fill();
    });
  }

  // Một xiên nướng: que tre + 4 miếng thịt xen kẽ. (x, y) là giữa xiên; góc a; k phóng to.
  function drawSkewer(c, id, x, y, a, k, raw) {
    const s = skewerById(id);
    if (!s) return;
    c.save();
    c.translate(x, y);
    c.rotate(a || 0);
    c.scale(k || 1, k || 1);
    c.strokeStyle = '#c9a26a';
    c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(-15, 0); c.lineTo(15, 0); c.stroke();
    for (let i = 0; i < 4; i++) {
      const cx = -8 + i * 5.4;
      c.fillStyle = s.colors[i % 2];
      if (raw) c.globalAlpha = 0.85;
      c.beginPath(); c.ellipse(cx, 0, 2.8, 3.4, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      if (!raw) { c.fillStyle = 'rgba(60,25,10,.45)'; c.fillRect(cx - 2, -1, 4, 0.8); } // vết nướng
    }
    c.restore();
  }

  // Bếp nướng than: thân bếp, than hồng, vỉ, xiên đang nướng + khói; khay xiên sống bên cạnh.
  function drawBBQ(t) {
    const x = BBQ.x, y = BBQ.y;
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, 46, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2f36';                                 // chân bếp
    ctx.fillRect(x - 30, y - 16, 4, 16);
    ctx.fillRect(x + 26, y - 16, 4, 16);
    ctx.fillStyle = '#3a3f45';                                 // thân bếp
    ctx.fillRect(x - 36, y - 34, 72, 20);
    ctx.fillStyle = '#5d6b78';
    ctx.fillRect(x - 38, y - 36, 76, 4);
    const glow = 0.55 + Math.sin(t / 180) * 0.15;              // than hồng
    ctx.fillStyle = 'rgba(230,80,30,' + glow + ')';
    ctx.fillRect(x - 33, y - 36, 66, 5);
    [[-24, -34], [-10, -35], [6, -34], [20, -35]].forEach(function (p, i) {
      ctx.fillStyle = i % 2 ? '#ffb347' : '#ff7a2a';
      ctx.beginPath(); ctx.arc(x + p[0], y + p[1], 2.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = '#9aa3ab';                               // vỉ nướng
    ctx.lineWidth = 1;
    for (let gx = x - 32; gx <= x + 32; gx += 6) { ctx.beginPath(); ctx.moveTo(gx, y - 40); ctx.lineTo(gx, y - 36); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - 34, y - 40); ctx.lineTo(x + 34, y - 40); ctx.stroke();
    // xiên mọi người đang nướng
    const grilling = [];
    if (me.grillUntil > Date.now() && me.grill) grilling.push(me.grill);
    others.forEach(function (o) { if (o.grill) grilling.push(o.grill); });
    grilling.slice(0, 6).forEach(function (id, i) {
      drawSkewer(ctx, id, x - 22 + (i % 3) * 22, y - 42 - Math.floor(i / 3) * 6, 0, 0.9);
    });
    if (grilling.length) {                                      // khói nướng
      ctx.strokeStyle = 'rgba(220,220,220,.35)';
      ctx.lineWidth = 2;
      [-14, 4, 18].forEach(function (dx, i) {
        ctx.beginPath(); ctx.moveTo(x + dx, y - 46);
        for (let k = 1; k <= 6; k++) ctx.lineTo(x + dx + Math.sin(t / 400 + k * 0.8 + i) * k, y - 46 - k * 6);
        ctx.stroke();
      });
    }
    // bảng treo "Nướng BBQ tự phục vụ" ở góc phải bếp (sau khay xiên)
    const sx = x + 112, sy = y - 78;                       // tâm bảng
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(sx, y + 1, 30, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3519';                             // khung gỗ: 2 cột + thanh ngang
    ctx.fillRect(sx - 32, sy - 30, 4, y - sy + 30);
    ctx.fillRect(sx + 28, sy - 30, 4, y - sy + 30);
    ctx.fillRect(sx - 36, sy - 32, 72, 5);
    ctx.strokeStyle = '#3a2414';                           // dây treo
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx - 18, sy - 27); ctx.lineTo(sx - 18, sy - 20); ctx.moveTo(sx + 18, sy - 27); ctx.lineTo(sx + 18, sy - 20); ctx.stroke();
    const bw = 58, bh = 44, r = 6;                         // bảng bo góc
    const bx0 = sx - bw / 2, by0 = sy - 20;
    ctx.fillStyle = '#2f1d10';
    ctx.beginPath();
    ctx.moveTo(bx0 + r, by0);
    ctx.arcTo(bx0 + bw, by0, bx0 + bw, by0 + bh, r);
    ctx.arcTo(bx0 + bw, by0 + bh, bx0, by0 + bh, r);
    ctx.arcTo(bx0, by0 + bh, bx0, by0, r);
    ctx.arcTo(bx0, by0, bx0 + bw, by0, r);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9963a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // ngọn lửa vẽ tay
    const fx = sx, fy = by0 + 11, fl = Math.sin(t / 160) * 0.8;
    ctx.fillStyle = '#ff7a2a';
    ctx.beginPath(); ctx.moveTo(fx, fy - 8 - fl); ctx.quadraticCurveTo(fx + 6, fy - 2, fx + 4, fy + 3); ctx.quadraticCurveTo(fx, fy + 5, fx - 4, fy + 3); ctx.quadraticCurveTo(fx - 6, fy - 2, fx, fy - 8 - fl); ctx.fill();
    ctx.fillStyle = '#ffd36e';
    ctx.beginPath(); ctx.moveTo(fx, fy - 3 - fl); ctx.quadraticCurveTo(fx + 3, fy + 1, fx, fy + 3); ctx.quadraticCurveTo(fx - 3, fy + 1, fx, fy - 3 - fl); ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f5d98b';
    ctx.font = 'bold 7.5px serif';
    ctx.fillText('NƯỚNG BBQ', sx, by0 + 24);
    ctx.fillStyle = '#e8b64c';
    ctx.font = 'italic 8px serif';
    ctx.fillText('Tự phục vụ', sx, by0 + 34);
    // khay xiên sống bên cạnh
    ctx.fillStyle = '#d9d2c2';
    ctx.fillRect(x + 42, y - 26, 34, 18);
    ctx.fillStyle = '#c9c0ac';
    ctx.fillRect(x + 42, y - 10, 34, 3);
    ['xbachi', 'xtom', 'xmuc'].forEach(function (id, i) { drawSkewer(ctx, id, x + 59, y - 22 + i * 5, 0, 0.7, true); });
  }

  // Bình trà đá đỏ nắp trắng trên ghế đẩu, kèm chồng cốc.
  function drawTraDa() {
    const x = TRA_DA.x, y = TRA_DA.y;
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3519';                       // ghế đẩu gỗ
    ctx.fillRect(x - 14, y - 22, 4, 22);
    ctx.fillRect(x + 10, y - 22, 4, 22);
    ctx.fillStyle = '#8a5a3c';
    ctx.fillRect(x - 18, y - 26, 36, 6);
    ctx.fillStyle = '#d62f2a';                       // thân bình đỏ
    ctx.beginPath(); ctx.moveTo(x - 12, y - 26); ctx.lineTo(x - 11, y - 54); ctx.quadraticCurveTo(x, y - 58, x + 11, y - 54); ctx.lineTo(x + 12, y - 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b02420';
    ctx.fillRect(x - 12, y - 44, 24, 3);
    ctx.fillStyle = '#f4f6f8';                       // nắp trắng + quai
    ctx.fillRect(x - 10, y - 62, 20, 6);
    ctx.strokeStyle = '#f4f6f8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y - 62, 6, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#f4f6f8';                       // vòi
    ctx.fillRect(x - 3, y - 32, 6, 4);
    ctx.fillStyle = 'rgba(220,235,245,.85)';         // chồng cốc
    [0, 4, 8].forEach(function (dy) {
      ctx.beginPath(); ctx.moveTo(x + 15, y - 34 + dy); ctx.lineTo(x + 25, y - 34 + dy); ctx.lineTo(x + 24, y - 27 + dy); ctx.lineTo(x + 16, y - 27 + dy); ctx.closePath(); ctx.fill();
    });
  }
  // Cốc trà đá có đá viên (đang cầm uống).
  function drawTeaGlass(gx, gy) {
    ctx.fillStyle = 'rgba(220,235,245,.9)';
    ctx.beginPath(); ctx.moveTo(gx - 5, gy - 8); ctx.lineTo(gx + 5, gy - 8); ctx.lineTo(gx + 4, gy + 4); ctx.lineTo(gx - 4, gy + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(176,112,40,.85)';
    ctx.beginPath(); ctx.moveTo(gx - 4.5, gy - 4); ctx.lineTo(gx + 4.5, gy - 4); ctx.lineTo(gx + 4, gy + 4); ctx.lineTo(gx - 4, gy + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillRect(gx - 3, gy - 5, 2.6, 2.6);
    ctx.fillRect(gx + 0.6, gy - 3, 2.4, 2.4);
  }

  function drawKitchenCounter() {
    drawCounter(1100, 1370, 510, '#cfd5db', '#9aa3ab');
    // món chờ chị Liễu bưng ra
    ['laurieubau', 'comtrang', 'canhchua', 'thitkho', 'cakho', 'galuoc', 'nemran'].forEach(function (id, i) {
      drawDish(ctx, id, 1128 + i * 36, 458, 0.72);
    });
  }

  // Bàn ăn + món đang có trên bàn.
  function drawRestTable(t, ti, now) {
    const hw = TABLE_HW;
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.fillRect(t.x - hw - 2, t.y + 4, hw * 2 + 4, 12);
    // thùng rác dưới gầm bàn
    const bx = t.x + 50, by = t.y + 18;
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(bx, by + 2, 11, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4f7a5a';
    ctx.beginPath(); ctx.moveTo(bx - 9, by - 18); ctx.lineTo(bx + 9, by - 18); ctx.lineTo(bx + 7, by); ctx.lineTo(bx - 7, by); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d6147';
    ctx.fillRect(bx - 10, by - 21, 20, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx - 2, by - 12, 4, 4);
    ctx.fillStyle = '#5a3519';
    ctx.fillRect(t.x - hw + 10, t.y - 4, 9, 24);
    ctx.fillRect(t.x + hw - 19, t.y - 4, 9, 24);
    ctx.fillStyle = '#6b4530';                       // cạnh trước mặt bàn
    ctx.fillRect(t.x - hw, t.y - 10, hw * 2, 10);
    ctx.fillStyle = '#8a5a3c';                       // mặt bàn
    ctx.fillRect(t.x - hw, t.y - 70, hw * 2, 60);
    ctx.fillStyle = '#a8734a';
    ctx.fillRect(t.x - hw, t.y - 70, hw * 2, 6);
    // ống đũa (đầu trái) + hộp giấy ăn (đầu phải)
    ctx.fillStyle = '#6b4320';
    ctx.fillRect(t.x - hw + 8, t.y - 50, 10, 18);
    ctx.strokeStyle = '#e8d39a';
    ctx.lineWidth = 1.2;
    [10.5, 13, 15.5].forEach(function (dx) { ctx.beginPath(); ctx.moveTo(t.x - hw + dx, t.y - 50); ctx.lineTo(t.x - hw + dx - 1, t.y - 61); ctx.stroke(); });
    ctx.fillStyle = '#e88aa8';
    ctx.fillRect(t.x + hw - 26, t.y - 44, 18, 11);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(t.x + hw - 22, t.y - 44); ctx.quadraticCurveTo(t.x + hw - 17, t.y - 55, t.x + hw - 12, t.y - 45); ctx.closePath(); ctx.fill();
    dishes.filter(function (d) { return d.table === ti && now >= d.readyAt; }).forEach(function (d, i) {
      if (i >= 10) return; // tối đa 10 món một bàn: 2 hàng × 5
      drawDish(ctx, d.dish, t.x - 92 + (i % 5) * 46, t.y - 50 + Math.floor(i / 5) * 26, 0.9);
    });
  }
  function drawStool(s) {
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    ctx.beginPath(); ctx.ellipse(s.x, s.y + 4, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3519';
    ctx.fillRect(s.x - 2, s.y - 8, 4, 12);
    ctx.fillStyle = '#9c2a20';
    ctx.beginPath(); ctx.ellipse(s.x, s.y - 8, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Lễ tân và phục vụ (người máy, không phải user).
  const NPC_RECEPTION = { id: 'npc-lt', pose: 'stand', gender: 'f', wear: [], staff: true };
  const NPC_WAITER = { id: 'npc-pv', pose: 'stand', gender: 'f', wear: [], staff: true }; // chị Liễu bưng cơm
  function waiterPos(now) {
    // Món đang được mang ra (chưa tới bàn) → phục vụ đi từ bếp tới bàn đó.
    const going = dishes.filter(function (d) { return now < d.readyAt; }).sort(function (a, b) { return a.readyAt - b.readyAt; })[0];
    if (!going) return { x: KITCHEN.x, y: KITCHEN.y, walking: false, dish: null };
    const t = REST_TABLES[going.table];
    const p = Math.max(0, Math.min(1, 1 - (going.readyAt - now) / going.prep));
    const tx = t.x + TABLE_HW + 22, ty = t.y + 10;
    return { x: KITCHEN.x + (tx - KITCHEN.x) * p, y: KITCHEN.y + (ty - KITCHEN.y) * p, walking: true, dish: going.dish };
  }
  function drawNpc(npc, x, y, t, label, extra) {
    npc.carry = extra || null; // món đang bưng (vẽ trên hai tay)
    const top = drawMonk(npc, x, y, t, false);
    drawLabel(label, x, top - 4);
  }

  // Đang ngồi hàng ghế phía trước bàn ăn (sát người xem)? Người này quay lưng ra ngoài, mặt hướng vào bàn.
  function seatedFacingTable(x, y) {
    return scene === 'restaurant' && REST_SEATS.some(function (s) {
      return s.y > REST_TABLES[s.table].y && Math.abs(x - s.x) < 6 && Math.abs(y - (s.y + 2)) < 6;
    });
  }

  // Đang ngồi đúng ghế văn phòng / ghế nhà hàng? (ngồi ghế thì luôn hướng vào bàn)
  function onSeatFurniture(x, y) {
    const on = function (s) { return Math.abs(x - s.x) < 6 && Math.abs(y - (s.y + 2)) < 6; };
    return (scene === 'office' && ALL_CHAIRS.some(on)) || (scene === 'restaurant' && REST_SEATS.some(on));
  }

  // ---------- Nhân vật phong cách phẳng (hình khối màu trơn, không viền) ----------
  if (!CanvasRenderingContext2D.prototype.roundRect) { // trình duyệt cũ: bo góc đều theo bán kính đầu tiên
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(Array.isArray(r) ? r[0] : r, w / 2, h / 2);
      this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
    };
  }
  // Đơn vị hình vẽ: chân ở y = 0, đầu tròn tâm (0, HY) bán kính HR; cả hình thu nhỏ FIG lần khi vẽ vào cảnh.
  const FIG = 0.8;
  const HY = -92, HR = 21;
  const F_SKIN = '#f8d9c6', F_SKIN_D = '#ecbfa8', F_WHITE = '#ffffff', F_PUPIL = '#2b1a12', F_SHOE = '#3b2a22';
  const F_BLUSH = 'rgba(244,128,128,.38)', F_HAIR = '#1c1614';
  // Màu áo tràng theo áo mua trong shop: [thân, vạt chéo, ống quần]
  const F_ROBES = {
    casa: ['#e8952f', '#cf7a1c', '#b8681a'],
    robebrown: ['#b07a48', '#986336', '#7d5230'],
    robewhite: ['#f4f1ea', '#e2ddd2', '#cfc8ba'],
  };
  const F_ROBE = ['#8fb0d6', '#7a9cc4', '#6683a8'];
  const F_SHOES = { deptoong: ['#7cc6ec', '#a9dcf5'], depda: ['#3a2a20', '#c0392b'], haivang: ['#161616', '#1f8a4c'] };
  let FP = {};     // nhân vật đang vẽ: look, female, items, shoe, robe, days, dark, slap
  let STEP = 0;    // nhịp bước -1..1 (0 khi đứng yên)

  function fShape(col, draw) { ctx.beginPath(); draw(); ctx.fillStyle = col; ctx.fill(); }
  function fCircle(col, x, y, r) { fShape(col, function () { ctx.arc(x, y, r, 0, Math.PI * 2); }); }
  function fLimb(x0, y0, x1, y1, w, col) { // thanh bo tròn hai đầu (ống tay, cánh tay)
    const a = Math.atan2(y1 - y0, x1 - x0), r = w / 2;
    fShape(col, function () { ctx.arc(x0, y0, r, a + Math.PI / 2, a - Math.PI / 2); ctx.arc(x1, y1, r, a - Math.PI / 2, a + Math.PI / 2); ctx.closePath(); });
  }
  function fInHead(draw) { ctx.save(); ctx.beginPath(); ctx.arc(0, HY, HR + 0.3, 0, Math.PI * 2); ctx.clip(); draw(); ctx.restore(); }
  function fHas(id) { return FP.items.has(id); }
  function fSkin() { return FP.dark ? '#7a7a7a' : F_SKIN; }

  // ===== Mặt =====
  function fFrown(x, y, r) { // miệng mếu (cong xuống)
    ctx.save(); ctx.strokeStyle = '#a8655a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; // nâu hồng nhạt, không gắt như đen
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.restore();
  }
  function faceFront(closed, tilt) {
    tilt = tilt || 0;
    fCircle(fSkin(), -HR, HY + 3 - tilt * 6, 4.5); fCircle(fSkin(), HR, HY + 3 - tilt * 6, 4.5);   // tai (cúi thì tai nhích lên)
    fCircle(fSkin(), 0, HY, HR);
    if (tilt) { // cúi xuống: đỉnh đầu sáng, phần cằm khuất tối
      fShape('rgba(255,255,255,' + 0.35 * tilt + ')', function () { ctx.ellipse(-3, HY - 9, 11, 7, -0.3, 0, Math.PI * 2); });
      fShape('rgba(90,40,20,' + 0.16 * tilt + ')', function () { ctx.ellipse(0, HY + 14, 17, 7, 0, 0, Math.PI * 2); });
    }
    ctx.save();
    ctx.translate(0, HY + 4 + tilt * 9); ctx.scale(1, 1 - 0.45 * tilt); ctx.translate(0, -(HY + 4)); // mặt úp xuống: ngũ quan trượt xuống, dẹt lại
    if (closed) { // ngủ: mắt nhắm
      ctx.save(); ctx.strokeStyle = F_PUPIL; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      [-8, 8].forEach(function (x) { ctx.beginPath(); ctx.arc(x, HY - 2, 4.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); });
      ctx.restore();
    } else {
      fCircle(F_WHITE, -8, HY - 2, 6.5); fCircle(F_WHITE, 8, HY - 2, 6.5);    // mắt trắng to
      fCircle(F_PUPIL, -7, HY - 4.5, 3.8); fCircle(F_PUPIL, 9, HY - 4.5, 3.8); // con ngươi nhìn lên
    }
    fCircle(F_BLUSH, -13, HY + 6, 3.6); fCircle(F_BLUSH, 13, HY + 6, 3.6);
    if (FP.slap) fShape('rgba(220,40,40,.6)', function () { ctx.ellipse(12, HY + 6, 6, 5, 0, 0, Math.PI * 2); }); // má đỏ vì bị tát
    if (FP.sad) fFrown(0, HY + 13, 5);                                         // bị tát / bị bắt: mếu, không cười
    else fShape(F_WHITE, function () { ctx.moveTo(-6, HY + 8); ctx.lineTo(6, HY + 8); ctx.arc(0, HY + 8, 6, 0, Math.PI); ctx.closePath(); }); // miệng cười
    ctx.restore();
    if (tilt) fInHead(function () { fShape(fSkin(), function () { ctx.rect(-HR, HY + HR - tilt * 6, HR * 2, 8); }); }); // cằm khuất sau mặt cúi
  }
  function faceSide(bald) { // nhìn chéo 3/4 sang phải: thấy hai mắt (mắt xa nhỏ, sát mép), miệng cười trên mặt
    fCircle(fSkin(), 0, HY, HR);
    if (bald) fCircle(fSkin(), -8, HY + 3, 4.5);
    ctx.save();
    ctx.beginPath(); ctx.arc(0, HY, HR, 0, Math.PI * 2); ctx.clip();
    fCircle(F_WHITE, 7, HY - 2, 6.2);  fCircle(F_PUPIL, 9, HY - 4, 3.6);    // mắt gần
    fCircle(F_WHITE, 18, HY - 2, 4.6); fCircle(F_PUPIL, 19.5, HY - 3.5, 2.8); // mắt xa
    fCircle(FP.slap ? 'rgba(220,40,40,.6)' : F_BLUSH, 2, HY + 6, FP.slap ? 5.5 : 3.6);
    if (FP.sad) fFrown(13, HY + 12.5, 4);
    else fShape(F_WHITE, function () { ctx.moveTo(8, HY + 8); ctx.lineTo(18, HY + 8); ctx.arc(13, HY + 8, 5, 0, Math.PI); ctx.closePath(); });
    ctx.restore();
  }
  function faceBack() {
    fCircle(fSkin(), -HR, HY + 3, 4.5); fCircle(fSkin(), HR, HY + 3, 4.5);
    fCircle(fSkin(), 0, HY, HR);
  }
  function earSide() { fCircle(fSkin(), -7, HY + 2.5, 4.6); fCircle(F_SKIN_D, -6.6, HY + 2.8, 2.2); }

  // ===== Tóc (mỗi kiểu: behind = vẽ trước thân, over = vẽ sau mặt) =====
  function capSide(col) { fInHead(function () { fShape(col, function () { ctx.arc(-17, HY - 10, 23, 0, Math.PI * 2); }); }); }
  function capBack(col, low) {
    fInHead(function () {
      fShape(col, function () {
        ctx.moveTo(-HR - 1, HY + low - 1); ctx.lineTo(-HR - 1, HY - HR - 1); ctx.lineTo(HR + 1, HY - HR - 1); ctx.lineTo(HR + 1, HY + low - 1);
        ctx.lineTo(HR, HY + low - 1); ctx.ellipse(0, HY + low - 1, HR, 6, 0, 0, Math.PI); ctx.closePath();
      });
    });
  }
  // Tóc nam nhìn nghiêng: trùm đỉnh, phía sau dài qua tai, chân tóc vòng sau rồi qua trên tai; front() vẽ mép mái
  function sideHairPath(front) {
    ctx.arc(0, HY, HR + 0.5, -Math.PI * 0.12, Math.PI * 0.82, true);
    ctx.quadraticCurveTo(-13, HY + 11, -11, HY + 4);
    ctx.quadraticCurveTo(-8, HY - 7, 2, HY - 9);
    front();
    ctx.closePath();
  }
  function waves(x0, x1, y, n) { // mép tóc gợn sóng
    const w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) ctx.quadraticCurveTo(x0 + w * (i + 0.5), y + 4.5, x0 + w * (i + 1), y);
  }
  const F_HAIRS = {
    bald: { behind: function () {}, over: function () {} },
    // nữ: rẽ ngôi giữa, búi thấp sau gáy (chùa, nhân viên nhà hàng)
    lowbun: {
      behind: function (v) { if (v === 's') fCircle(F_HAIR, -17, HY + 9, 8.5); },
      over: function (v) {
        if (v === 'f') fInHead(function () {
          fShape(F_HAIR, function () { ctx.arc(-10, HY - 25, 19, 0, Math.PI * 2); });
          fShape(F_HAIR, function () { ctx.arc(10, HY - 25, 19, 0, Math.PI * 2); });
        });
        if (v === 's') capSide(F_HAIR);
        if (v === 'b') { capBack(F_HAIR, 10); fCircle(F_HAIR, 0, HY + 12, 8.5); }
      } },
    // nam văn phòng: rẽ ngôi lệch, vuốt gọn ôm đầu
    neat: {
      behind: function () {},
      over: function (v) {
        if (v === 'f') fInHead(function () {
          fShape(F_HAIR, function () { ctx.arc(-6, HY - 29, 24, 0, Math.PI * 2); });
          fShape(F_HAIR, function () { ctx.arc(13, HY - 26, 17, 0, Math.PI * 2); });
        });
        if (v === 's') { fShape(F_HAIR, function () { sideHairPath(function () { ctx.quadraticCurveTo(13, HY - 13, 18.8, HY - 6.8); }); }); earSide(); }
        if (v === 'b') capBack(F_HAIR, 8);
      } },
    // nữ văn phòng: bob ngang cằm bo tròn góc, mái bằng
    bob: {
      behind: function (v) { if (v === 'f') fShape(F_HAIR, function () { ctx.roundRect(-HR - 4, HY - HR - 2, HR * 2 + 8, HR + 14, [HR + 4, HR + 4, 9, 9]); }); },
      over: function (v) {
        if (v === 'f') fInHead(function () { fShape(F_HAIR, function () { ctx.rect(-HR - 1, HY - HR - 1, HR * 2 + 2, HR - 6); }); });
        if (v === 's') fShape(F_HAIR, function () {
          ctx.arc(0, HY, HR + 2.5, -Math.PI * 0.1, Math.PI, true);
          ctx.lineTo(-HR - 2.5, HY + 3);
          ctx.arcTo(-HR - 2.5, HY + 12, 0, HY + 12, 9);
          ctx.arcTo(0, HY + 12, 0, HY - 8, 6);
          ctx.lineTo(0, HY - 8);
          ctx.lineTo(HR + 1.5, HY - 8);
          ctx.closePath();
        });
        if (v === 'b') fShape(F_HAIR, function () { ctx.roundRect(-HR - 4, HY - HR - 2, HR * 2 + 8, HR + 14, [HR + 4, HR + 4, 9, 9]); });
      } },
    // nam nhà hàng: tóc ôm đầu, mái gợn sóng
    curly: {
      behind: function () {},
      over: function (v) {
        const R = HR + 1;
        if (v === 'f') fShape(F_HAIR, function () {
          ctx.arc(0, HY, R, Math.PI * 0.97, Math.PI * 2.03);
          ctx.lineTo(HR - 2.5, HY);
          ctx.quadraticCurveTo(HR - 3, HY - 6, HR - 7, HY - 8);
          waves(HR - 7, -HR + 7, HY - 8, 3);
          ctx.quadraticCurveTo(-HR + 3, HY - 6, -HR + 2.5, HY);
          ctx.closePath();
        });
        if (v === 's') { fShape(F_HAIR, function () { sideHairPath(function () { waves(4, 19, HY - 8, 2); }); }); earSide(); }
        if (v === 'b') fShape(F_HAIR, function () { ctx.arc(0, HY, R, Math.PI * 0.97, Math.PI * 2.03); waves(R, -R, HY + 1, 3); ctx.closePath(); });
      } },
    // nữ nhà hàng: buộc đuôi ngựa cao, mái chéo, dây buộc hồng
    ponytail: {
      behind: function (v) {
        if (v === 'f') fShape(F_HAIR, function () { ctx.ellipse(HR - 2, HY + 4, 6, 15, -0.25, 0, Math.PI * 2); });
        if (v === 's') fShape(F_HAIR, function () { ctx.ellipse(-HR - 3, HY + 6, 6.5, 17, 0.35, 0, Math.PI * 2); });
      },
      over: function (v) {
        if (v === 'f') fInHead(function () {
          fShape(F_HAIR, function () { ctx.arc(9, HY - 34, 26, 0, Math.PI * 2); });
          fShape(F_HAIR, function () { ctx.arc(-11, HY - 29, 20, 0, Math.PI * 2); });
        });
        if (v === 's') { capSide(F_HAIR); fCircle('#e85a7a', -HR + 1, HY - 9, 3.2); }
        if (v === 'b') {
          capBack(F_HAIR, 6);
          fShape(F_HAIR, function () { ctx.ellipse(0, HY + 8, 6.5, 17, 0, 0, Math.PI * 2); });
          fCircle('#e85a7a', 0, HY - 8, 3.2);
        }
      } },
  };

  // ===== Chân =====
  function fShoe(x, y, w, side) {
    const s = FP.shoe;
    fShape(FP.barefoot ? fSkin() : s ? s[0] : F_SHOE, function () { side ? ctx.roundRect(x - 3.4, y, 10, 3.5, 1.5) : ctx.roundRect(x - w / 2 - 0.6, y, w + 1.2, 3.5, 1.5); });
    if (s && !FP.barefoot) fShape(s[1], function () { ctx.rect(side ? x - 1 : x - w / 2, y - 1, side ? 5 : w, 2); }); // quai dép
  }
  // Đứng / đi: hai chân tách rời; nhìn nghiêng thì đánh kéo quanh hông, chân sau sẫm hơn
  function fLegs(v, top, col, sock) {
    const L = -4 - top;
    if (v === 's') {
      [-1, 1].forEach(function (d) {
        const a = d * STEP * 0.34, knee = Math.max(0, a) * 1;     // bước vừa phải; chân đang ở sau (a > 0) thì co nhẹ gối
        const L1 = L * 0.5, L2 = L - L1;
        ctx.save(); ctx.translate(0, top); ctx.rotate(a);
        fShape(col, function () { ctx.rect(-3.2, 0, 6.4, L1 + 1); });          // đùi
        if (d < 0) fShape('rgba(0,0,0,.14)', function () { ctx.rect(-3.2, 0, 6.4, L1 + 1); }); // chân sau sẫm hơn
        ctx.translate(0, L1); ctx.rotate(knee);
        fShape(col, function () { ctx.rect(-3.2, 0, 6.4, L2); });              // cẳng chân
        if (sock) fShape(sock, function () { ctx.rect(-3.4, Math.max(0, L2 - 18), 6.8, Math.min(18, L2)); });
        fShoe(0, L2, 6.4, true);
        if (d < 0) fShape('rgba(0,0,0,.14)', function () { ctx.rect(-3.2, 0, 6.4, L2); ctx.roundRect(-3.4, L2, 10, 3.5, 1.5); });
        ctx.restore();
      });
      return;
    }
    [-1, 1].forEach(function (d) { // nhìn trước / sau: nhấc chân luân phiên
      const lift = Math.max(0, d * STEP) * 3, x = d * 2.7;
      fShape(col, function () { ctx.rect(x - 2.6, top, 5.2, L - lift); });
      if (sock) fShape(sock, function () { ctx.rect(x - 2.8, -22 - lift, 5.6, 18); });
      fShoe(x + d * 0.8, -4 - lift, 5.2, false);
    });
  }
  // Ngồi ghế: nhìn trước thấy cẳng chân thả xuống; nghiêng thấy đùi duỗi ngang rồi cẳng chân
  function fSeatLegs(v, col, sock) {
    if (v === 'b') return; // quay lưng: chân duỗi phía trước, khuất sau lưng / gầm bàn
    if (v === 's') {
      fShape(col, function () { ctx.roundRect(-5, -17, 18, 7, 3); });               // đùi duỗi ngang trên mặt ghế
      fShape(sock || col, function () { ctx.rect(8, -12, 6, 8); });                   // cẳng chân thả xuống
      fShoe(11, -4, 6, true);
      return;
    }
    fShape(col, function () { ctx.roundRect(-9, -17, 18, 7, 3); });                   // lòng (đùi nhìn từ trước)
    [-1, 1].forEach(function (d) {
      const x = d * 4;
      fShape(sock || col, function () { ctx.rect(x - 2.7, -12, 5.4, 8); });
      fShoe(x, -4, 5.4, false);
    });
  }
  // Thân hạ thấp bao nhiêu theo tư thế; ngồi ghế thì hạ tới khi gấu áo / váy chạm mặt ghế
  function seatDrop(mode, o) { return mode === 'chair' ? Math.max(0, -o.legTop - 14) : F_SEAT_DROP[mode]; }

  // ===== Thân (tam giác áo / váy) + tay =====
  function fTri(col, top, bot, wTop, wBot, v) {
    const k = v === 's' ? 0.62 : 1;
    fShape(col, function () { ctx.moveTo(-wTop * k, top); ctx.lineTo(wTop * k, top); ctx.lineTo(wBot * k, bot); ctx.lineTo(-wBot * k, bot); ctx.closePath(); });
  }
  function fNeck(collar) {
    fShape(fSkin(), function () { ctx.rect(-3.5, -74, 7, 6); });
    if (collar) fShape(collar, function () { ctx.moveTo(-5, -70); ctx.lineTo(5, -70); ctx.lineTo(4, -66); ctx.lineTo(-4, -66); ctx.closePath(); });
  }
  // Tay buông hai bên (vung ngược nhịp chân); sleeve: màu ống tay áo dài; skipR: tay phải đang cầm đồ (vẽ riêng)
  function fHands(v, y, x, sleeve, skipR) {
    if (v === 's') {
      ctx.save(); ctx.translate(1, -67); ctx.rotate(-STEP * 0.4);
      if (sleeve) fLimb(0, 0, 1.5, y + 63, 6, sleeve);
      else { ctx.strokeStyle = F_SKIN_D; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1.5, y + 63); ctx.stroke(); }
      fCircle(fSkin(), 1.5, y + 67, 5);
      ctx.restore();
      return;
    }
    [-1, 1].forEach(function (d) {
      if (d > 0 && skipR) return;
      if (sleeve) fLimb(d * 8, -67, d * (x + 3), y - 5 - d * STEP * 2, 6.5, sleeve);
      fCircle(fSkin(), d * (x + 3), y - d * STEP * 2, 5.5);
    });
  }
  // Hai bàn tay đặt chồng trong lòng (ngồi thiền)
  function fLapHands(v, y) {
    if (v === 'b') return;
    fShape(fSkin(), function () { v === 's' ? ctx.ellipse(7, y, 5, 3.5, 0, 0, Math.PI * 2) : ctx.ellipse(0, y, 8, 4.5, 0, 0, Math.PI * 2); });
  }
  // Tay chắp trước ngực (quỳ, lạy)
  function fPray(v, y) {
    if (v === 'b') return;
    if (v === 's') { fLimb(1, -66, 9, y + 2, FP.outfit === 'robe' ? 6 : 4, FP.outfit === 'robe' ? FP.robe[0] : fSkin()); fShape(fSkin(), function () { ctx.ellipse(10, y, 3.5, 6, 0.3, 0, Math.PI * 2); }); return; }
    fShape(fSkin(), function () { ctx.ellipse(0, y, 5, 7.5, 0, 0, Math.PI * 2); });
  }

  // Trang phục: legs(v) = ống quần / chân; top(v) = thân áo; hand = [x, y, ống tay] cho tay buông
  const F_OUTFITS = {
    robe: { // áo tràng ở chùa (màu theo áo mua), số điểm trên ngực
      legCol: function () { return FP.robe[2]; }, legTop: -14,
      top: function (v) {
        fNeck();
        fTri(FP.robe[0], -70, -10, 6, 23, v);
        if (v !== 'b') fShape(FP.robe[1], function () { const k = v === 's' ? 0.62 : 1; ctx.moveTo(-6 * k, -70); ctx.lineTo(4 * k, -50); ctx.lineTo(6 * k, -70); ctx.closePath(); });
        if (FP.robeId === 'casa' && v === 'f') fShape('#b8521a', function () { ctx.moveTo(-6, -70); ctx.lineTo(-1, -70); ctx.lineTo(19, -13); ctx.lineTo(13, -11); ctx.closePath(); });
        if (v === 'f') {
          ctx.fillStyle = FP.numCol; ctx.font = 'bold 9px sans-serif' + EMOJI_FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(FP.days || 0), 0, -38);
        }
      },
      hand: [22, -11, null], hideSideHand: true },
    officeM: { // sơ mi dài tay xanh nhạt, cà vạt xanh than, quần ghi
      legCol: function () { return '#4a4e57'; }, legTop: -40,
      top: function (v) {
        fNeck();
        fTri('#d8e7f6', -70, -36, 9, 22, v);
        if (v === 'f') fShape('#2c4a80', function () { ctx.moveTo(-2, -68); ctx.lineTo(2, -68); ctx.lineTo(3.5, -48); ctx.lineTo(0, -44); ctx.lineTo(-3.5, -48); ctx.closePath(); });
        if (v === 's') fShape('#2c4a80', function () { ctx.moveTo(4, -68); ctx.lineTo(7, -50); ctx.lineTo(5, -47); ctx.closePath(); });
      },
      hand: [22, -37, '#d8e7f6'] },
    officeF: { // váy xanh than cổ trắng, nơ kem
      legCol: function () { return fSkin(); }, legTop: -28,
      top: function (v) {
        fNeck('#ffffff');
        fTri('#2f3a5a', -68, -26, 5, 28, v);
        if (v === 'f') { fCircle('#f7e7c6', -3.2, -65, 2.6); fCircle('#f7e7c6', 3.2, -65, 2.6); fCircle('#e8cf9c', 0, -65, 1.6); }
      },
      hand: [28, -27, null] },
    casualM: { // áo cam san hô, nơ cổ xanh than, quần jean
      legCol: function () { return '#5372a8'; }, legTop: -40,
      top: function (v) {
        fNeck();
        fTri('#ef7a5a', -70, -36, 10, 22, v);
        if (v === 'f') {
          fShape('#26406e', function () { ctx.moveTo(0, -67); ctx.lineTo(-6, -70.5); ctx.lineTo(-6, -63.5); ctx.closePath(); });
          fShape('#26406e', function () { ctx.moveTo(0, -67); ctx.lineTo(6, -70.5); ctx.lineTo(6, -63.5); ctx.closePath(); });
          fCircle('#1b2f55', 0, -67, 1.8);
        }
        if (v === 's') fShape('#26406e', function () { ctx.moveTo(4.5, -67); ctx.lineTo(9, -70); ctx.lineTo(9, -64); ctx.closePath(); });
      },
      hand: [22, -37, null] },
    casualF: { // váy xanh mint cổ trắng 2 cúc, tất trắng
      legCol: function () { return fSkin(); }, legTop: -28, sock: '#ffffff',
      top: function (v) {
        fNeck('#ffffff');
        fTri('#6cc3a8', -68, -26, 5, 28, v);
        if (v === 'f') { fCircle('#ffffff', 0, -62, 1.4); fCircle('#ffffff', 0, -57.5, 1.4); }
      },
      hand: [28, -27, null] },
    staff: { // nhân viên nhà hàng (lễ tân, chị Liễu): váy nâu, tạp dề kem
      legCol: function () { return fSkin(); }, legTop: -28,
      top: function (v) {
        fNeck('#f4ead8');
        fTri('#8a5a34', -68, -26, 5, 28, v);
        if (v !== 'b') { const k = v === 's' ? 0.62 : 1; fShape('#f4ead8', function () { ctx.moveTo(-9 * k, -54); ctx.lineTo(9 * k, -54); ctx.lineTo(15 * k, -30); ctx.lineTo(-15 * k, -30); ctx.closePath(); }); }
      },
      hand: [28, -27, null] },
    boss: { // sếp: vest đen, sơ mi trắng, cà vạt đỏ
      legCol: function () { return '#1b1f27'; }, legTop: -40,
      top: function (v) {
        fNeck();
        fTri('#232a36', -70, -34, 11, 24, v);
        if (v === 'f') {
          fShape('#f4f6f8', function () { ctx.moveTo(-5, -70); ctx.lineTo(5, -70); ctx.lineTo(0, -56); ctx.closePath(); });
          fShape('#c0392b', function () { ctx.moveTo(-1.5, -68); ctx.lineTo(1.5, -68); ctx.lineTo(2.5, -55); ctx.lineTo(0, -52); ctx.lineTo(-2.5, -55); ctx.closePath(); });
        }
      },
      hand: [24, -35, '#232a36'] },
  };

  // ===== Vật phẩm (chỉ hiện ở chùa; dép hiện ở mọi nơi) =====
  function drawAura(v) {
    if (fHas('halo')) { // vòng sáng thiên thần trên đỉnh đầu
      const ry = HY - HR - 7;
      ctx.save(); ctx.filter = 'blur(2.5px)';
      ctx.strokeStyle = 'rgba(255,222,110,.8)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(0, ry, 12, 3.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      const g = ctx.createLinearGradient(0, ry - 4, 0, ry + 4);
      g.addColorStop(0, '#fffbe0'); g.addColorStop(0.45, '#ffd84d'); g.addColorStop(1, '#ffa41b');
      ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 2.6; ctx.shadowColor = 'rgba(255,210,80,.9)'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.ellipse(0, ry, 12, 3.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    if (fHas('rainbow') && v !== 's') { // cầu vồng pastel sau đầu, chân có mây
      ['#ff8f8f', '#ffbb73', '#ffe27a', '#9fe3a2', '#8fcaff', '#c4a8ff'].forEach(function (col, i) {
        const r = 38 - i * 2.6;
        fShape(col, function () { ctx.arc(0, HY + 8, r, Math.PI, 0); ctx.arc(0, HY + 8, r - 2.6, 0, Math.PI, true); ctx.closePath(); });
      });
      [-1, 1].forEach(function (d) {
        fCircle('#ffffff', d * 31, HY + 8, 6); fCircle('#ffffff', d * 37, HY + 9, 5); fCircle('#ffffff', d * 25.5, HY + 9.5, 4.5);
        fShape('#ffffff', function () { ctx.roundRect(d > 0 ? 24 : -42, HY + 9, 18, 5, 2.5); });
      });
    }
  }
  function drawPet() {
    if (!fHas('cat')) return; // mèo ngồi bên trái
    fShape('#f0a35a', function () { ctx.ellipse(-36, -9, 9, 9, 0, 0, Math.PI * 2); });
    fShape('#f0a35a', function () { ctx.ellipse(-45, -14, 2.2, 8, -0.5, 0, Math.PI * 2); });
    fCircle('#f0a35a', -36, -22, 7);
    fShape('#f0a35a', function () { ctx.moveTo(-42, -25); ctx.lineTo(-41, -32); ctx.lineTo(-37, -28); ctx.closePath(); });
    fShape('#f0a35a', function () { ctx.moveTo(-30, -25); ctx.lineTo(-31, -32); ctx.lineTo(-35, -28); ctx.closePath(); });
    fCircle('#2b1a12', -38.5, -22.5, 1.1); fCircle('#2b1a12', -33.5, -22.5, 1.1);
    fCircle('#fff3e6', -36, -19.5, 2.2);
  }
  function drawNeckItems() {
    if (fHas('beads')) {
      for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; fCircle('#6b3a1a', Math.cos(a) * 8, -69 + Math.sin(a) * 11, 1.8); }
      fCircle('#c0392b', 0, -55.5, 2.4);
    }
    if (fHas('garland')) for (let i = 0; i <= 8; i++) {
      const a = Math.PI * i / 8;
      fCircle(i % 2 ? '#e8902a' : '#f2c230', Math.cos(a) * 9.5, -69 + Math.sin(a) * 12, 3);
    }
    if (fHas('bag')) {
      fShape('#8a5a2e', function () { ctx.moveTo(-7, -70); ctx.lineTo(-3.5, -70); ctx.lineTo(16, -34); ctx.lineTo(12.5, -34); ctx.closePath(); });
      fShape('#a8743e', function () { ctx.roundRect(8, -38, 14, 12, 3); });
    }
  }
  function drawHeadItems(v) {
    if (fHas('hat')) { // mũ ni len: chỏm nâu có gân dọc, viền bo len, núm len
      const R = HR + 1.5, ex = Math.cos(Math.PI * 0.15) * R, ey = HY - Math.sin(Math.PI * 0.15) * R;
      const cap = function () { ctx.arc(0, HY, R, Math.PI * 1.15, Math.PI * 1.85); ctx.quadraticCurveTo(0, HY - 7.5, -ex, ey); ctx.closePath(); };
      fCircle('#6a3f1e', 0, HY - R - 0.5, 3.2);
      fShape('#7a4a24', cap);
      ctx.save(); ctx.beginPath(); cap(); ctx.clip();
      ctx.fillStyle = '#6a3f1e';
      for (let x = -R; x < R; x += 3.6) {
        ctx.beginPath(); ctx.moveTo(x, HY - R - 2); ctx.quadraticCurveTo(x * 0.85, HY - 14, x * 0.92, HY - 4);
        ctx.lineTo(x * 0.92 + 1.5, HY - 4); ctx.quadraticCurveTo(x * 0.85 + 1.5, HY - 14, x + 1.5, HY - R - 2); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      fShape('#5e3517', function () {
        ctx.moveTo(-ex - 0.5, ey - 0.5); ctx.quadraticCurveTo(0, HY - 7.5, ex + 0.5, ey - 0.5);
        ctx.lineTo(ex - 0.3, ey - 4.5); ctx.quadraticCurveTo(0, HY - 11.5, -ex + 0.3, ey - 4.5); ctx.closePath();
      });
    }
    if (fHas('nonla')) {
      fShape('#ead79c', function () { ctx.moveTo(0, HY - 42); ctx.lineTo(34, HY - 10); ctx.quadraticCurveTo(0, HY - 6, -34, HY - 10); ctx.closePath(); });
      fShape('#d8c27e', function () { ctx.moveTo(-20, HY - 20); ctx.quadraticCurveTo(0, HY - 16, 20, HY - 20); ctx.lineTo(18.5, HY - 23); ctx.quadraticCurveTo(0, HY - 19, -18.5, HY - 23); ctx.closePath(); });
    }
    if (fHas('flower') && v === 'f') {
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; fCircle('#f19cb7', 14 + Math.cos(a) * 3.6, HY - 12 + Math.sin(a) * 3.6, 3); }
      fCircle('#f2c230', 14, HY - 12, 2.2);
    }
  }
  function drawHandItems(x, y, noHand) { // đồ cầm tay phải (nhìn trước); noHand: vẽ icon, không có bàn tay
    if (fHas('staff')) {
      fShape('#8a5a2b', function () { ctx.rect(x - 1.5, -112, 3, 108); });
      fShape('#e8b64c', function () { ctx.arc(x, -117, 7, 0, Math.PI * 2); ctx.arc(x, -117, 4.5, 0, Math.PI * 2, true); });
    }
    if (fHas('lantern')) {
      fShape('#3a2414', function () { ctx.rect(x - 0.6, y, 1.2, 6); });
      fShape('#c0392b', function () { ctx.ellipse(x, y + 14, 7, 9, 0, 0, Math.PI * 2); });
      fShape('#e8b64c', function () { ctx.rect(x - 4, y + 4.5, 8, 2); ctx.rect(x - 4, y + 21.5, 8, 2); });
    }
    if (fHas('candle')) {
      fShape('#f6f0e2', function () { ctx.rect(x - 2.5, y - 16, 5, 13); });
      fShape('#f6a623', function () { ctx.ellipse(x, y - 20, 2.4, 4, 0, 0, Math.PI * 2); });
      fShape('#ffe27a', function () { ctx.ellipse(x, y - 19, 1.2, 2.2, 0, 0, Math.PI * 2); });
    }
    if (fHas('bell')) { // chuông cầm tay nghiêng chếch ra ngoài
      ctx.save(); ctx.translate(x, y); ctx.rotate(-1.25); ctx.scale(0.85, 0.85);
      fShape('#6b4f2a', function () { ctx.moveTo(-1.6, 8); ctx.lineTo(-2.4, -9); ctx.arc(0, -9, 2.4, Math.PI, 0); ctx.lineTo(1.6, 8); ctx.closePath(); });
      fShape('#f59e0b', function () { ctx.ellipse(0, 8.5, 4.2, 2.8, 0, 0, Math.PI * 2); });
      fShape('#f9bf13', function () {
        ctx.moveTo(-4.5, 10); ctx.quadraticCurveTo(-5.5, 20, -10.5, 23); ctx.lineTo(10.5, 23);
        ctx.quadraticCurveTo(5.5, 20, 4.5, 10); ctx.quadraticCurveTo(0, 6.5, -4.5, 10); ctx.closePath();
      });
      fShape('#f59e0b', function () { ctx.ellipse(0, 23, 11, 2.6, 0, 0, Math.PI * 2); });
      fShape('#f9bf13', function () { ctx.roundRect(-2, 21.5, 4, 7, 2); });
      ctx.restore();
    }
    if (fHas('book')) {
      fShape('#f2e6c8', function () { ctx.rect(x - 7, y - 25, 16, 20); });
      fShape('#a8322c', function () { ctx.roundRect(x - 8, y - 26, 15, 21, 2); });
      fShape('#7a2420', function () { ctx.rect(x - 8, y - 26, 3, 21); });
      fShape('#e8b64c', function () { ctx.rect(x - 3.5, y - 22, 8, 2); });
      fCircle('#e8b64c', x + 0.5, y - 14, 2.6);
    }
    if (!noHand && (fHas('staff') || fHas('lantern') || fHas('candle') || fHas('bell') || fHas('book'))) fCircle(fSkin(), x, y, 5.5);
    if (fHas('bird')) { // chim sẻ đậu trên vai, thấp hơn cằm
      fShape('#9c6b3e', function () { ctx.ellipse(-17, -63, 6, 4.5, 0, 0, Math.PI * 2); });
      fCircle('#9c6b3e', -13, -67, 3.6);
      fShape('#f2c230', function () { ctx.moveTo(-10, -67.5); ctx.lineTo(-7, -66.5); ctx.lineTo(-10, -65.5); ctx.closePath(); });
      fCircle('#2b1a12', -12.2, -68, 0.9);
      fShape('#7a4f2c', function () { ctx.moveTo(-22, -64); ctx.lineTo(-28, -67); ctx.lineTo(-23, -61); ctx.closePath(); });
    }
  }

  // ===== Đồ ăn cầm tay (vẽ phẳng; tâm món ở (x, y)) =====
  function fBowl(x, y, food, top) { // bát trắng viền xanh, món đầy miệng bát; top(): vẽ thêm trên mặt món
    fShape(food, function () { ctx.ellipse(x, y - 3, 8, 2.8, 0, 0, Math.PI * 2); });
    if (top) top();
    fShape('#f4f2ec', function () { ctx.moveTo(x - 8.5, y - 3); ctx.quadraticCurveTo(x - 7.5, y + 6, x, y + 6); ctx.quadraticCurveTo(x + 7.5, y + 6, x + 8.5, y - 3); ctx.closePath(); });
    fShape('#5b8fd1', function () { ctx.rect(x - 7.6, y + 0.5, 15.2, 1.4); });
  }
  function fPlate(x, y, food) { // đĩa trắng + món đặt lên
    fShape('#f4f2ec', function () { ctx.ellipse(x, y + 3, 10, 3.2, 0, 0, Math.PI * 2); });
    food();
  }
  function blob(col, x, y, rx, ry) { fShape(col, function () { ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); }); }
  const F_FOODS = {
    com: function (x, y) { fBowl(x, y, '#ffffff', function () { blob('#f6f6f0', x, y - 4.5, 6, 2.6); }); },
    comtrang: function (x, y) { F_FOODS.com(x, y); },
    pho: function (x, y) { fBowl(x, y, '#e8c98a', function () { blob('#fff6dc', x - 2, y - 3.5, 3.5, 1.2); blob('#7cbf5a', x + 3, y - 3.2, 1.8, 1); }); },
    bunhen: function (x, y) { fBowl(x, y, '#f0e6cf', function () { blob('#fffaf0', x, y - 3.5, 4.5, 1.3); blob('#d98c3a', x + 3, y - 3.4, 1.5, 0.9); }); },
    xoi: function (x, y) { fBowl(x, y, '#f2d36b', function () { blob('#f7df8a', x, y - 4.5, 6, 2.6); blob('#8fbf5a', x + 2, y - 5.5, 1.6, 1); }); },
    canhchua: function (x, y) { fBowl(x, y, '#f0a04b', function () { blob('#7cbf5a', x - 2, y - 3.3, 1.8, 0.9); blob('#e8584a', x + 2.5, y - 3.3, 1.6, 0.9); }); },
    thitkho: function (x, y) { fBowl(x, y, '#9a5a2a', function () { blob('#fff6dc', x - 2.5, y - 4, 2.3, 1.8); blob('#f2c230', x - 2.5, y - 4, 1.1, 0.9); blob('#7a3e1a', x + 2.8, y - 3.8, 2.6, 1.6); }); },
    cakho: function (x, y) { fBowl(x, y, '#8a4a1e', function () { blob('#c87a3a', x, y - 4, 5, 1.8); }); },
    laurieubau: function (x, y) { fBowl(x, y, '#e8584a', function () { blob('#f2a45a', x - 2, y - 3.5, 2.6, 1); blob('#7cbf5a', x + 3, y - 3.3, 1.8, 0.9); }); },
    lauriebo: function (x, y) { F_FOODS.laurieubau(x, y); },
    lauthai: function (x, y) { fBowl(x, y, '#e8762a', function () { blob('#f08a8a', x - 2, y - 3.5, 2.2, 1); blob('#7cbf5a', x + 3, y - 3.3, 1.8, 0.9); }); },
    trungran: function (x, y) { fPlate(x, y, function () { blob('#ffffff', x, y + 1, 7, 2.6); blob('#f2b51e', x, y + 0.6, 2.8, 1.6); }); },
    raumuong: function (x, y) { fPlate(x, y, function () { blob('#5aa83a', x, y + 0.5, 7, 2.8); blob('#f6efd8', x + 2, y, 1, 0.8); }); },
    nomchanvit: function (x, y) { fPlate(x, y, function () { blob('#8fcf6a', x, y + 0.5, 6.5, 2.6); blob('#f0d9b0', x - 2, y, 2, 1); blob('#e8584a', x + 2.5, y - 0.2, 1, 0.8); }); },
    dauphu: function (x, y) { fPlate(x, y, function () { blob('#d9482f', x, y + 0.8, 7, 2.6); [-3, 0, 3].forEach(function (d) { fShape('#f2d28a', function () { ctx.rect(x + d - 1.3, y - 1, 2.6, 2.4); }); }); }); },
    nemran: function (x, y) { fPlate(x, y, function () { [-3, 0, 3].forEach(function (d) { fShape('#d9902e', function () { ctx.roundRect(x + d - 1.4, y - 2.5, 2.8, 6, 1.4); }); }); }); },
    vangdau: function (x, y) { F_FOODS.nemran(x, y); },
    banhtrang: function (x, y) { fPlate(x, y, function () { [-3, 0, 3].forEach(function (d) { fShape('#f6efe0', function () { ctx.roundRect(x + d - 1.4, y - 2.5, 2.8, 6, 1.4); }); }); }); },
    suonxao: function (x, y) { fPlate(x, y, function () { [-3.5, 0, 3.5].forEach(function (d) { blob('#a8401e', x + d, y + 0.5, 2.2, 1.8); }); }); },
    galuoc: function (x, y) { fPlate(x, y, function () { blob('#f2c870', x, y + 0.5, 6, 2.8); blob('#7cbf5a', x + 3, y - 0.8, 1.6, 0.8); }); },
    banhxeo: function (x, y) { fPlate(x, y, function () { fShape('#f2b51e', function () { ctx.arc(x, y + 1.8, 6.5, Math.PI, 0); ctx.closePath(); }); }); },
    sushi: function (x, y) { fPlate(x, y, function () { [-3.2, 3.2].forEach(function (d) { blob('#ffffff', x + d, y + 0.8, 2.8, 2); blob('#f28a5a', x + d, y - 0.3, 2.6, 1.2); }); }); },
    banhbao: function (x, y) { fShape('#f6f2e8', function () { ctx.arc(x, y + 2, 6, Math.PI, 0); ctx.closePath(); }); blob('#e8e0cc', x, y - 3.6, 1.4, 0.9); },
    chuoi: function (x, y) { fShape('#f5d33a', function () { ctx.arc(x + 2, y - 6, 9, Math.PI * 0.55, Math.PI * 0.95); ctx.arc(x + 4, y - 9, 9, Math.PI * 0.95, Math.PI * 0.55, true); ctx.closePath(); }); },
    cam: function (x, y) { fCircle('#f39a2a', x, y, 5.5); blob('#5aa83a', x + 2, y - 5.5, 2.2, 1.1); },
    dao: function (x, y) { fCircle('#f7a1a8', x, y, 5.5); fCircle('#f28a96', x + 2, y + 1, 3); blob('#5aa83a', x - 2, y - 5.5, 2.2, 1.1); },
    tra: function (x, y) { fShape('#f4f2ec', function () { ctx.moveTo(x - 5, y - 4); ctx.lineTo(x + 5, y - 4); ctx.lineTo(x + 3.5, y + 4); ctx.lineTo(x - 3.5, y + 4); ctx.closePath(); }); blob('#9cbf5a', x, y - 4, 4.6, 1.3); },
    cafe: function (x, y) { fShape('#f4f2ec', function () { ctx.roundRect(x - 4.5, y - 4, 9, 9, 2); }); blob('#6a3f1e', x, y - 4, 4, 1.2); },
    comhop: function (x, y) { fShape('#d9482f', function () { ctx.roundRect(x - 7, y - 3, 14, 8, 2); }); fShape('#ffffff', function () { ctx.rect(x - 5.5, y - 4.5, 11, 3); }); },
  };

  // Đầu + tóc + đồ đội theo hướng nhìn
  function fHead(v, hair, closed, tilt) {
    if (v === 'f') faceFront(closed, tilt); else if (v === 's') faceSide(hair === F_HAIRS.bald); else faceBack();
    if (!(v === 'f' && fHas('nonla'))) hair.over(v);
    drawHeadItems(v);
  }

  // Vẽ cả người ở gốc toạ độ (chân y = 0), v: 'f' trước, 's' nghiêng phải, 'b' sau (trái thì lật gương ở ngoài).
  // mode: 'stand' | 'chair' | 'floor' (ngồi thiền) | 'kneel' | 'bow'; hold: 'eat' | 'drink' | 'bbq' | null
  function drawFigure(p, v, mode, t, hold, bend) {
    const o = F_OUTFITS[FP.outfit], hair = F_HAIRS[FP.hair];
    drawAura(v);
    if (v !== 'b') drawPet();
    hair.behind(v);
    const seated = seatDrop(mode, o);
    const lapCol = FP.outfit === 'robe' ? FP.robe[2] : o.legCol();
    if (mode === 'stand') fLegs(v, o.legTop, o.legCol(), o.sock);
    else if (mode === 'chair') fSeatLegs(v, o.legCol(), o.sock);
    else if (mode === 'floor') fShape(lapCol, function () { ctx.ellipse(v === 's' ? 5 : 0, -7, v === 's' ? 20 : 29, 9, 0, 0, Math.PI * 2); }); // xếp bằng: lòng rộng
    else fShape(lapCol, function () { ctx.ellipse(v === 's' ? -9 : 0, -5, v === 's' ? 13 : 17, 6, 0, 0, Math.PI * 2); });                    // quỳ: cẳng chân gập gọn (nghiêng: ra sau)
    ctx.save();
    ctx.translate(0, seated - (mode === 'stand' ? Math.abs(STEP) * 1.5 : 0));
    const ground = mode === 'floor' || mode === 'kneel' || mode === 'bow';
    if (mode === 'bow' && v === 's') { ctx.translate(0, -10); ctx.rotate(bend * 1.0); ctx.translate(0, 10); }
    if (mode === 'bow' && v !== 's') { ctx.translate(0, -10); ctx.scale(1, 1 - 0.35 * bend); ctx.translate(0, 10); }
    const bowing = mode === 'bow' && v !== 's';
    if (bowing && v === 'b') { // nhìn sau: đầu cúi thấp, vẽ trước để lưng che dần
      ctx.save(); ctx.translate(0, -10); ctx.scale(1, 1 / (1 - 0.35 * bend)); ctx.translate(0, 10 + bend * 26);
      fHead(v, hair, false);
      ctx.restore();
    }
    o.top(v);
    if (bowing) { // khối thân cúi: vai sáng, ngực / bụng khuất bóng
      fShape('rgba(255,255,255,' + 0.18 * bend + ')', function () { ctx.ellipse(0, -64, 15, 5, 0, 0, Math.PI * 2); });
      fShape('rgba(40,30,60,' + 0.22 * bend + ')', function () { ctx.moveTo(-20, -18); ctx.quadraticCurveTo(0, -46, 20, -18); ctx.lineTo(23, -10); ctx.lineTo(-23, -10); ctx.closePath(); });
    }
    if (v === 'f') drawNeckItems();
    const hx = o.hand[0], hy = o.hand[1];
    if (mode === 'floor') fLapHands(v, -24);
    else if (ground) fPray(v, mode === 'bow' ? -55 + bend * 30 : -55); // chắp tay ngang ngực, không che số trên áo
    else if (hold === 'carry') { /* bê món: hai tay vẽ sau đầu, trước ngực */ }
    else if (hold) fHands(v, hy, hx, o.hand[2], true);
    else if (!(o.hideSideHand && v === 's')) fHands(v, hy, hx, o.hand[2], false);
    if (bowing && v === 'f') { // đầu cúi về phía người xem: hạ xuống, to lên một chút
      ctx.translate(0, -10); ctx.scale(1, 1 / (1 - 0.35 * bend)); ctx.translate(0, 10 + bend * 24);
      ctx.translate(0, HY); ctx.scale(1 + 0.1 * bend, 1 + 0.1 * bend); ctx.translate(0, -HY);
    }
    if (!(bowing && v === 'b')) fHead(v, hair, p.pose === 'sleep', bowing ? bend : 0);
    if (hold === 'carry') { // bê món bằng hai tay trước ngực
      [-1, 1].forEach(function (d) { fLimb(d * 8, -67, d * 9, -47, 4, o.hand[2] || fSkin()); });
      ctx.save(); ctx.translate(0, -54); ctx.scale(1.6, 1.6);
      (F_FOODS[p.carry] || F_FOODS.com)(0, 0);
      ctx.restore();
      fCircle(fSkin(), -9, -46, 4.5); fCircle(fSkin(), 9, -46, 4.5);
    } else if (hold) { // tay phải đưa đồ ăn / cốc / xiên lên miệng, vẽ trước mặt
      const ph = ((t + (p.seed || 0) * 1700) % 1700) / 1700;
      const lift = ph < 0.3 ? ph / 0.3 : ph < 0.6 ? 1 : ph < 0.85 ? 1 - (ph - 0.6) / 0.25 : 0;
      const rx = hx + 3 - lift * 13, ry = hy - lift * (hy - HY - 20);   // tay phải đưa từ hông lên, món chạm đúng miệng
      const sleeve = o.hand[2] || (FP.outfit === 'robe' ? FP.robe[0] : null);       // áo dài tay / áo tràng: tay áo; áo cộc: tay trần
      fLimb(8, -67, rx, ry, sleeve ? 6.5 : 4, sleeve || fSkin());
      if (hold === 'drink') drawTeaGlass(rx - 2, ry - 6);
      if (hold === 'bbq') drawSkewer(ctx, p.food, rx - 4, ry - 8, -1.1, 0.9);
      if (hold === 'eat') { // món nằm ngay dưới miệng, phóng to cho dễ nhìn
        ctx.save(); ctx.translate(rx - 2, ry - 8); ctx.scale(1.3, 1.3);
        (F_FOODS[p.food] || F_FOODS.com)(0, 0);
        ctx.restore();
      }
      fCircle(fSkin(), rx, ry, 5.5);
    }
    if (FP.outfit === 'boss' && v !== 'b') { // kính đen của sếp
      fShape('#111', function () { v === 's' ? ctx.roundRect(10, HY - 8, 11, 7, 2) : (ctx.roundRect(-15, HY - 8, 12, 7, 2), ctx.roundRect(3, HY - 8, 12, 7, 2)); });
      if (v === 'f') fShape('#111', function () { ctx.rect(-3, HY - 6, 6, 2); });
    }
    if (v === 'f' && !ground && !hold) drawHandItems(hx + 3, hy);
    ctx.restore();
    return -(HR - HY) - (fHas('nonla') ? 22 : fHas('halo') || fHas('staff') || fHas('rainbow') ? 13 : 4); // chừa chỗ cho đồ cao hơn đầu
  }

  // Icon vật phẩm vẽ bằng chính hình trên nhân vật: [vẽ, tâm x, tâm y, phóng to] (đơn vị hình vẽ)
  const ITEM_PICS = {
    casa: [robePic, 0, -40, 1.25], robebrown: [robePic, 0, -40, 1.25], robewhite: [robePic, 0, -40, 1.25],
    beads: [drawNeckItems, 0, -62, 4.4], garland: [drawNeckItems, 0, -62, 3.6], bag: [drawNeckItems, 7, -48, 1.8],
    hat: [headPic, 0, HY - 16, 2.2], nonla: [headPic, 0, HY - 24, 1.2], flower: [headPic, 14, HY - 12, 4.5],
    staff: [handPic, 0, -62, 0.72], lantern: [handPic, 0, 14, 2.6], candle: [handPic, 0, -12, 2.7],
    bell: [handPic, 9, 8, 2.6], book: [handPic, 0, -15, 2.6],
    halo: [drawAura, 0, HY - HR - 7, 3], rainbow: [drawAura, 0, HY - 6, 1.05],
    cat: [drawPet, -37, -17, 2.3], bird: [handPic, -18, -64, 4],
  };
  function robePic() { F_OUTFITS.robe.top('f'); }
  function headPic() { drawHeadItems('f'); }
  function handPic() { drawHandItems(0, 0, true); }
  // Vẽ một icon phẳng 96×96 bằng chính các hàm vẽ trong game (tạm trỏ ctx sang canvas nhỏ), có bộ nhớ đệm.
  const flatPicCache = new Map();
  function flatPic(key, draw, cx, cy, k, fp) {
    if (flatPicCache.has(key)) return flatPicCache.get(key);
    const cv = document.createElement('canvas');
    cv.width = cv.height = 96;
    const mainCtx = ctx, mainFP = FP;
    try { // luôn trả ctx về canvas chính, kể cả khi vẽ icon lỗi
      ctx = cv.getContext('2d');
      FP = fp || { items: new Set(), dark: false };
      ctx.translate(48, 48); ctx.scale(k, k); ctx.translate(-cx, -cy);
      draw();
    } finally {
      ctx = mainCtx; FP = mainFP;
    }
    const url = cv.toDataURL();
    flatPicCache.set(key, url);
    return url;
  }
  function itemPic(id) {
    const spec = ITEM_PICS[id];
    if (!spec) return null;
    return flatPic('item:' + id, function () { spec[0]('f'); }, spec[1], spec[2], spec[3],
      { items: new Set([id]), robeId: id, robe: F_ROBES[id] || F_ROBE, numCol: 'transparent', days: '', outfit: 'robe' });
  }
  function foodPic(id) {
    const draw = F_FOODS[id];
    return draw ? flatPic('food:' + id, function () { draw(0, 0); }, 0, 0, 4) : null;
  }
  // Đồ dâng lễ (vẽ phẳng)
  const OFFER_DRAW = {
    nen: function () {
      fShape('#f6f0e2', function () { ctx.rect(-3.5, -6, 7, 16); });
      fShape('#f6a623', function () { ctx.ellipse(0, -11, 3, 5, 0, 0, Math.PI * 2); });
      fShape('#ffe27a', function () { ctx.ellipse(0, -10, 1.5, 2.8, 0, 0, Math.PI * 2); });
    },
    tra: function () { F_FOODS.tra(0, 0); },
    hoa: function () { // hoa sen hồng
      [[-6, 0.6], [6, -0.6], [0, 0]].forEach(function (p) { fShape(p[0] ? '#f7a8c0' : '#f28aac', function () { ctx.ellipse(p[0] * 0.8, -1, 4, 8, p[1], 0, Math.PI * 2); }); });
      fShape('#7cbf5a', function () { ctx.ellipse(0, 7, 10, 2.6, 0, 0, Math.PI * 2); });
    },
    den: function () { // đèn dầu: đĩa đồng + ngọn lửa
      fShape('#c98a2a', function () { ctx.moveTo(-9, 2); ctx.quadraticCurveTo(0, 10, 9, 2); ctx.closePath(); });
      fShape('#b8741e', function () { ctx.rect(-2, 6, 4, 4); ctx.roundRect(-6, 9, 12, 2.5, 1.2); });
      fShape('#f6a623', function () { ctx.ellipse(0, -4, 3, 5.5, 0, 0, Math.PI * 2); });
      fShape('#ffe27a', function () { ctx.ellipse(0, -3, 1.5, 3, 0, 0, Math.PI * 2); });
    },
    qua: function () { // mâm quả: đĩa + cam, chuối, đào
      fShape('#d9a21c', function () { ctx.ellipse(0, 6, 12, 3.5, 0, 0, Math.PI * 2); });
      F_FOODS.cam(-4, 0); F_FOODS.dao(4.5, 1); F_FOODS.chuoi(-1, 4);
    },
  };
  function offerPic(id) {
    const draw = OFFER_DRAW[id];
    return draw ? flatPic('offer:' + id, draw, 0, 0, 3.6) : null;
  }
  // Ô icon ảnh phẳng (thay cho emoji)
  function picSpan(url, alt, cls) {
    if (!url) { const e = document.createElement('span'); e.className = cls || 'emoji'; e.textContent = '🍽️'; return e; } // chưa có hình
    const s = document.createElement('span');
    s.className = (cls || 'emoji') + ' pic-ic';
    const img = document.createElement('img');
    img.src = url; img.alt = alt;
    s.appendChild(img);
    return s;
  }
  const F_SEAT_DROP = { stand: 0, chair: 12, floor: 16, kneel: 4, bow: 10 }; // thân hạ thấp bao nhiêu theo tư thế
  // Ai mặc gì ở đâu
  function lookFor(p) {
    const f = p.gender === 'f';
    if (p.boss) return ['boss', 'neat'];
    if (p.staff) return ['staff', 'lowbun'];
    if (scene === 'temple') return ['robe', 'bald']; // đi chùa: ai cũng đầu trọc
    if (scene === 'restaurant') return f ? ['casualF', 'ponytail'] : ['casualM', 'curly'];
    return f ? ['officeF', 'bob'] : ['officeM', 'neat'];
  }

  // Vẽ một người chơi / NPC; trả về độ cao đỉnh đầu (để đặt tên / bong bóng chat).
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
    const slapAgo = Date.now() - (slaps.get(p.id) || 0);
    if (slapAgo < 600) ctx.translate(Math.sin(t / 22) * 3 * (1 - slapAgo / 600), 0); // rung người khi bị tát
    const look = lookFor(p);
    const temple = scene === 'temple' && !p.boss && !p.staff;
    const robeId = temple ? (p.wear || []).find(function (w) { return F_ROBES[w]; }) : null;
    const shoeId = (p.wear || []).find(function (w) { return F_SHOES[w]; });
    FP = {
      outfit: look[0], hair: look[1],
      items: temple ? new Set(p.wear || []) : new Set(),
      robeId: robeId, robe: F_ROBES[robeId] || F_ROBE,
      numCol: robeId === 'robewhite' ? '#8a7a5a' : '#ffffff',
      shoe: F_SHOES[shoeId] || null,
      barefoot: temple, // vào chùa để dép ở kệ: đi chân trần
      days: p.days,
      dark: (blackFaces.get(p.id) || 0) > Date.now(),
      slap: slapAgo < 3000,
      sad: slapAgo < 3000 || (p === me ? Date.now() < me.caughtUntil : !!p.caught), // bị tát / bị sếp bắt: mếu
    };
    ctx.scale(FIG, FIG);

    const VIEW = { d: 'f', u: 'b', r: 's', l: 'l' };
    let v = VIEW[p.face] || 'f', mode = 'stand', hold = null, bend = 0;
    STEP = 0;
    if (p.pose === 'sleep') { // nằm ngang dưới gầm bàn, đầu bên trái
      ctx.translate(40, -8); ctx.rotate(-Math.PI / 2); ctx.scale(0.75, 0.75);
      drawFigure(p, 'f', 'stand', t, null, 0);
      ctx.restore();
      return y - 26;
    }
    if (p.pose === 'sit' || p.pose === 'eat') {
      const facingTable = seatedFacingTable(x, y);
      if (facingTable) { v = 'b'; mode = 'chair'; }
      else if (temple && !onSeatFurniture(x, y)) mode = 'floor';
      else { mode = 'chair'; if (scene === 'restaurant' && onSeatFurniture(x, y)) v = 'f'; } // văn phòng: quay theo hướng người chơi
      if (p.pose === 'eat' && !facingTable) { v = 'f'; hold = 'eat'; } // đang ăn: quay mặt ra trước để thấy món
    } else if (p.pose === 'kneel') mode = 'kneel';
    else if (p.pose === 'bow') {
      mode = 'bow';
      const ph = ((t + (p.seed || 0) * 3000) % 3200) / 3200;
      bend = ph < 0.35 ? ph / 0.35 : ph < 0.65 ? 1 : 1 - (ph - 0.65) / 0.35;
    } else {
      const walking = p.pose === 'walk' || (p.pose === 'bbq' && p.moving);
      if (walking) STEP = Math.sin(t / 110);
      if (p.pose === 'drink' || p.pose === 'bbq') { v = 'f'; hold = p.pose; }
      if (p.carry) { v = 'f'; hold = 'carry'; } // phục vụ đang bê món
    }
    if (v === 'l') { ctx.scale(-1, 1); v = 's'; }
    if (mode === 'bow') fShape('rgba(0,0,0,' + 0.12 * bend + ')', function () { ctx.ellipse(0, -2, 30 + bend * 8, 8, 0, 0, Math.PI * 2); });
    let top = drawFigure(p, v, mode, t, hold, bend);
    top += seatDrop(mode, F_OUTFITS[FP.outfit]) + (mode === 'bow' && v !== 's' ? bend * (v === 'b' ? 18 : 24) : 0); // lạy: tên hạ theo đầu
    ctx.restore();
    return y + top * FIG;
  }

  function drawLabel(name, x, y) {
    // Điện thoại dọc: cảnh bị thu nhỏ nên phóng chữ lại, để tên luôn cao ~10px trên màn hình.
    const size = cw < ch || IS_TOUCH ? 10 / scale : 8;
    ctx.font = size + 'px sans-serif' + EMOJI_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = size / 4;
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
    ctx.font = 'bold 13px sans-serif' + EMOJI_FONT;
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
  const BOSS = { id: 'boss', boss: true, gender: 'm', pose: 'walk', face: 'r', wear: [] }; // đi tuần từ trái sang phải
  function drawBoss(x, y, t) {
    const top = drawMonk(BOSS, x, y, t, false);
    ctx.font = 'bold 11px sans-serif' + EMOJI_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.strokeText('SẾP', x, top - 4);
    ctx.fillStyle = '#c0392b';
    ctx.fillText('SẾP', x, top - 4);
  }

  function drawZzz(x, y, t) {
    ctx.save();
    ctx.font = 'bold 11px sans-serif' + EMOJI_FONT;
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
    ctx.font = 'bold 16px sans-serif' + EMOJI_FONT;
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
    ctx.font = '13px sans-serif' + EMOJI_FONT;
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
      CHAIRS.forEach(function (c) {
        items.push({ y: c.y, draw: function () { drawChair(c); } });
        if (chairFace(c) === 'u') items.push({ y: c.y + 3, draw: function () { drawChairBack(c.x, c.y); } });
      });
      PLANTS.forEach(function (p) { items.push({ y: p.y, draw: function () { drawPlant(p); } }); });
      const mwLeft = Math.max(0, (me.heatUntil || 0) - Date.now());
      let mwOn = mwLeft > 0;
      others.forEach(function (o) { if (o.heating) mwOn = true; });
      items.push({ y: 492, draw: function () { drawPantryCounter(now, mwOn, mwLeft); } });
      items.push({ y: ROUND_TABLE.y, draw: drawRoundTable });
      items.push({ y: MEET_TABLE.y, draw: drawMeetTable });
      items.push({ y: 836, draw: drawMeetSign });
      MEET_CHAIRS.forEach(function (c) {
        items.push({ y: c.y, draw: function () { drawChair(c); } });
        if (chairFace(c) === 'u') items.push({ y: c.y + 3, draw: function () { drawChairBack(c.x, c.y); } });
      });
      const bp = bossPos(Date.now());
      if (bp) items.push({ y: bp.y, draw: function () { drawBoss(bp.x, bp.y, now); } });
    } else if (scene === 'restaurant') {
      drawRestWall();
      drawRestFloor();
      items.push({ y: RECEPTION.y, draw: function () { drawNpc(NPC_RECEPTION, RECEPTION.x, RECEPTION.y, now, 'Lễ tân'); } });
      items.push({ y: 520, draw: drawReception });
      items.push({ y: ONG_DIA.y, draw: function () { drawOngDia(now); } });
      items.push({ y: 510, draw: drawKitchenCounter });
      items.push({ y: TRA_DA.y, draw: drawTraDa });
      items.push({ y: BBQ.y, draw: function () { drawBBQ(now); } });
      REST_PLANTS.forEach(function (p) { items.push({ y: p.y, draw: function () { drawPlant(p); } }); });
      REST_TABLES.forEach(function (t, ti) { items.push({ y: t.y, draw: function () { drawRestTable(t, ti, Date.now()); } }); });
      REST_SEATS.forEach(function (s) { items.push({ y: s.y - 1, draw: function () { drawStool(s); } }); });
      const wp = waiterPos(Date.now());
      NPC_WAITER.pose = wp.walking ? 'walk' : 'stand';
      items.push({ y: wp.y, draw: function () { drawNpc(NPC_WAITER, wp.x, wp.y, now, 'Liễu', wp.dish); } });
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
