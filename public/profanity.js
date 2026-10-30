// Phát hiện lời bậy trong chat — dùng chung cho trình duyệt (window.hasProfanity) và server (require).
(function (root) {
  'use strict';

  // Từ đơn (so khớp nguyên từ, sau khi chuẩn hoá NFC + chữ thường).
  // Chỉ đưa vào dạng không dấu khi không trùng từ thường (vd. bỏ "lon", "cac", "buoi", "deo").
  const WORDS = [
    'đụ', 'địt', 'đĩ', 'lồn', 'buồi', 'cặc', 'đéo', 'loz',
    'đm', 'đmm', 'đcm', 'đkm', 'dm', 'dmm', 'dcm', 'dkm', 'dmcs', 'đmcs',
    'vcl', 'vkl', 'vl', 'vcc', 'clm', 'cmm', 'cc', 'cl',
    'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bitch', 'cunt', 'asshole', 'dick', 'pussy',
  ];
  // Cụm hai từ.
  const PHRASES = [
    'đụ má', 'đụ mẹ', 'địt mẹ', 'địt mày', 'chó đẻ', 'mẹ mày', 'má mày',
    'du ma', 'du me', 'dit me', 'dit may', 'cho de', 'vai lon', 'vai loz',
  ];

  const wordSet = new Set(WORDS);
  const phraseSet = new Set(PHRASES);

  // "fuckkk" → "fuck", "đụuu" → "đụ"
  // (tách dấu ra để "ụuu" — u + dấu nặng rồi u lặp — cũng rút được về "ụ")
  function squeeze(w) {
    return w.normalize('NFD').replace(/(\p{L})(\p{M}*)\1+/gu, '$1$2').normalize('NFC');
  }
  function bad(w) { return wordSet.has(w) || wordSet.has(squeeze(w)); }

  function hasProfanity(text) {
    const tokens = String(text || '').normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    for (let i = 0; i < tokens.length; i++) {
      if (bad(tokens[i])) return true;
      const next = tokens[i + 1];
      if (!next) continue;
      if (phraseSet.has(tokens[i] + ' ' + next) || phraseSet.has(squeeze(tokens[i]) + ' ' + squeeze(next))) return true;
      // Lách bằng dấu chấm/cách: "đ.m", "d m"
      if (tokens[i].length === 1 && next.length <= 2 && bad(tokens[i] + next)) return true;
    }
    return false;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = hasProfanity;
  else root.hasProfanity = hasProfanity;
})(this);
