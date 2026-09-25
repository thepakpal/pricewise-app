'use strict';
/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const short = n => n >= 1e5 ? (n / 1e5).toFixed(2).replace(/\.?0+$/, '') + 'L' : n >= 1000 ? (n / 1000).toFixed(2).replace(/\.?0+$/, '') + 'k' : String(n);
const fdate = ts => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const ago = ts => { const m = Math.max(1, Math.round((Date.now() - ts) / 6e4)); return m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' hours ago' : Math.round(m / 1440) + ' days ago'; };
/* mini wave sparkline (dot-matrix hero decoration): smoothed curve + emphasis dots */
const sparkline = (vals, w = 140, h = 36, color = 'currentColor') => {
  const n = vals.length; if (n < 2) return '';
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = (mx - mn) || 1;
  const pts = vals.map((v, i) => [i / (n - 1) * w, h - 5 - (v - mn) / rng * (h - 11)]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx2 = (x0 + x1) / 2, my2 = (y0 + y1) / 2; d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${mx2.toFixed(1)} ${my2.toFixed(1)}`; }
  d += ` L${pts[n - 1][0].toFixed(1)} ${pts[n - 1][1].toFixed(1)}`;
  const marks = [0, Math.floor((n - 1) / 2), n - 1].map((i, k) => `<circle class="sdot" style="animation-delay:${.5 + k * .12}s" cx="${pts[i][0].toFixed(1)}" cy="${pts[i][1].toFixed(1)}" r="2.8" fill="${color}"/>`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false"><path class="sline" pathLength="1" d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1"/>${marks}</svg>`;
};

/* ---------- icons (24px line set) ---------- */
/* PriceWise mark: a five-colour badge ring (the app's own rickshaw-stripe palette, one hue per side) framing a rupee pentagon */
const GICON = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.9 6.1C12.3 13.3 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.6c-.5 2.9-2.2 5.4-4.7 7l7.6 5.9c4.4-4.1 7-10.1 7-17.2z"/><path fill="#FBBC05" d="M10.4 19.3a14.5 14.5 0 0 0 0 9.4l-7.9 6.1a24 24 0 0 1 0-21.6z"/><path fill="#34A853" d="M24 48c6.3 0 11.9-2.1 15.9-5.6l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.4 0-11.7-3.8-13.6-9.3l-7.9 6.1C6.4 42.6 14.6 48 24 48z"/></svg>`;
const LOGOMARK = `<svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="PriceWise"><defs><radialGradient id="lg-fill" cx="30%" cy="20%" r="90%"><stop offset="0%" stop-color="#D6007F"/><stop offset="55%" stop-color="#4B1E78"/><stop offset="100%" stop-color="#170B33"/></radialGradient></defs><path d="M105.62 8.17 A92 92 0 0 1 185.60 66.28" stroke="#D6007F" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M189.07 76.97 A92 92 0 0 1 158.52 170.99" stroke="#D97A0A" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M149.43 177.59 A92 92 0 0 1 50.57 177.59" stroke="#2F7A45" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M41.48 170.99 A92 92 0 0 1 10.93 76.97" stroke="#0E6B78" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M14.40 66.28 A92 92 0 0 1 94.38 8.17" stroke="#6A2FA6" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M100.00 28.00 L168.48 77.75 L142.32 158.25 L57.68 158.25 L31.52 77.75 Z" fill="url(#lg-fill)"/><text x="97" y="130" font-family="'Baloo 2','Segoe UI',Arial,sans-serif" font-weight="800" font-size="76" fill="#FFF8EE" text-anchor="middle">₹</text><path d="M138 52l3.6 9.6 9.6 3.6-9.6 3.6-3.6 9.6-3.6-9.6-9.6-3.6 9.6-3.6z" fill="#D97A0A"/></svg>`;
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.1c0 5.8-8 10.4-8 10.4z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  left: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  tdown: '<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  sliders: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  award: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13.5 7 21l5-3 5 3-1.5-7.5"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  star: '<path fill="currentColor" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  wallet: '<path d="M4 7h15a1 1 0 0 1 1 1v11H5a1 1 0 0 1-1-1z"/><path d="M4 7l12-3v3"/><circle cx="16" cy="13" r="1"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  type: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path fill="currentColor" d="M12 3a9 9 0 0 1 0 18z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h0"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h0"/>',
  logout: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 8v4l3 2"/>',
  cart: '<path d="M3 4h2l2.4 11h11l2-8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  cards: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'
};
const ic = (n, s = 18, cls = '') => `<svg class="ic ${cls}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- product art (inline SVG, no external images) ---------- */
const ART = {
  earbuds: (c, d) => `<rect x="13" y="15" width="17" height="35" rx="8.5" fill="${c}"/><rect x="34" y="15" width="17" height="35" rx="8.5" fill="${c}"/><circle cx="21.5" cy="25" r="3.4" fill="${d}"/><circle cx="42.5" cy="25" r="3.4" fill="${d}"/><rect x="17.5" y="38" width="8" height="11" rx="4" fill="${d}"/><rect x="38.5" y="38" width="8" height="11" rx="4" fill="${d}"/>`,
  phone: (c, d) => `<rect x="19" y="7" width="26" height="50" rx="6" fill="${c}"/><rect x="22" y="11" width="20" height="40" rx="3" fill="#0f1024"/><rect x="26" y="17" width="12" height="4" rx="2" fill="${d}"/><rect x="26" y="25" width="8" height="3" rx="1.5" fill="${d}" opacity=".6"/>`,
  watch: (c, d) => `<rect x="26" y="5" width="12" height="14" rx="3" fill="${d}"/><rect x="26" y="45" width="12" height="14" rx="3" fill="${d}"/><rect x="17" y="16" width="30" height="32" rx="9" fill="${c}"/><rect x="20.5" y="19.5" width="23" height="25" rx="6" fill="#0f1024"/><path d="M32 26v7l4 3" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  band: (c, d) => `<rect x="26" y="4" width="12" height="56" rx="6" fill="${d}"/><rect x="23" y="19" width="18" height="26" rx="6" fill="${c}"/><rect x="26.5" y="23" width="11" height="18" rx="3" fill="#0f1024"/>`,
  headphones: (c, d) => `<path d="M14 40v-8a18 18 0 0 1 36 0v8" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="10" y="36" width="11" height="17" rx="5" fill="${c}"/><rect x="43" y="36" width="11" height="17" rx="5" fill="${c}"/><rect x="12" y="40" width="4" height="9" rx="2" fill="${d}"/>`,
  laptop: (c, d) => `<rect x="14" y="14" width="36" height="25" rx="3" fill="${c}"/><rect x="17" y="17" width="30" height="19" rx="1.5" fill="#0f1024"/><path d="M8 43h48l-4 7H12z" fill="${d}"/>`
};
/* per-product silhouette overrides so items in the same category read as distinct products */
const ARTP = {
  iphone15pro: (c, d) => `<rect x="19" y="6" width="26" height="52" rx="7" fill="${c}"/><rect x="21.5" y="9" width="21" height="46" rx="4" fill="#101025"/><rect x="27.5" y="12.5" width="9" height="3.2" rx="1.6" fill="${d}"/><g fill="${d}"><circle cx="26" cy="20" r="2.1"/><circle cx="32" cy="20" r="2.1"/><circle cx="26" cy="26" r="2.1"/></g>`,
  s24: (c, d) => `<rect x="19" y="6" width="26" height="52" rx="7" fill="${c}"/><rect x="21.5" y="9" width="21" height="46" rx="4" fill="#101025"/><circle cx="32" cy="13" r="1.7" fill="${d}"/><g fill="${d}"><circle cx="25.5" cy="21" r="2"/><circle cx="25.5" cy="27" r="2"/><circle cx="25.5" cy="33" r="2"/></g>`,
  pixel8: (c, d) => `<rect x="19" y="6" width="26" height="52" rx="7" fill="${c}"/><rect x="21.5" y="9" width="21" height="46" rx="4" fill="#101025"/><rect x="19" y="17" width="26" height="8" rx="3" fill="${d}"/><circle cx="27" cy="21" r="2.4" fill="#101025"/><circle cx="36" cy="21" r="2.4" fill="#101025"/>`,
  narzo: (c, d) => `<rect x="19" y="6" width="26" height="52" rx="7" fill="${c}"/><rect x="21.5" y="9" width="21" height="46" rx="4" fill="#101025"/><circle cx="32" cy="13" r="1.7" fill="${d}"/><rect x="24" y="18" width="16" height="16" rx="5" fill="${d}"/><g fill="#101025"><circle cx="28.4" cy="22.4" r="1.7"/><circle cx="35.6" cy="22.4" r="1.7"/><circle cx="28.4" cy="29.6" r="1.7"/><circle cx="35.6" cy="29.6" r="1.7"/></g>`,
  boat141pro: (c, d) => `${ART.earbuds(c, d)}<circle cx="21.5" cy="19" r="1.6" fill="${d}" opacity=".85"/><circle cx="42.5" cy="19" r="1.6" fill="${d}" opacity=".85"/>`,
  boat141blk: (c, d) => ART.earbuds('#33364a', d),
  boat141bun: (c, d) => `${ART.earbuds(c, d)}<path d="M9 52q6 6 12 0" stroke="${d}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  noise: (c, d) => `<rect x="26" y="4" width="12" height="13" rx="3" fill="${d}"/><rect x="26" y="47" width="12" height="13" rx="3" fill="${d}"/><rect x="16" y="15" width="32" height="34" rx="7" fill="${c}"/><rect x="19.5" y="18.5" width="25" height="27" rx="4" fill="#0f1024"/>`
};
const artFor = p => ARTP[p.id] || ART[p.cat];
const DUO = [['#CFE4D9', '#2F8367'], ['#EBDCB4', '#96700A'], ['#E3CFC2', '#A85732'], ['#D3D9C9', '#5C6B4A']];
const BACK = [['#E9F5EF', '#D3E9DF'], ['#FBF1DD', '#F3E3BE'], ['#FBEDE4', '#F3DACB'], ['#EEF1E7', '#DDE3D2'], ['#EAF0FC', '#D6E2F7'], ['#F6ECFB', '#E8D8F5']];
/* real product photos, supplied by the user and hosted as artifact assets — used where available, SVG art elsewhere */
const PHOTO = {
  boat141: 'assets/products/boat141.png',
  watch9: 'assets/products/watch9.png',
  s24: 'assets/products/s24.png',
  sonyxm5: 'assets/products/sonyxm5.png',
  pixel8: 'assets/products/pixel8.png',
  iphone15pro: 'assets/products/iphone15pro.png',
  noise: 'assets/products/noise.png',
  hp15: 'assets/products/hp15.png',
  lenovo: 'assets/products/lenovo.png'
};
const img = (p, s = 56) => {
  if (PHOTO[p.id]) return `<span class="pimg photo" style="width:${s}px;height:${s}px"><img src="${PHOTO[p.id]}" alt="" width="${s}" height="${s}" loading="lazy"></span>`;
  const [d, c] = DUO[hash(p.id) % DUO.length], [b1, b2] = BACK[hash(p.id + 'bg') % BACK.length];
  return `<span class="pimg" style="width:${s}px;height:${s}px;background:linear-gradient(150deg,${b1},${b2})"><svg viewBox="0 0 64 64" width="${Math.round(s * .78)}" height="${Math.round(s * .78)}" aria-hidden="true">${artFor(p)(d, c)}</svg></span>`;
};

/* ---------- retailer brand marks — real logos supplied by the user, hosted as artifact assets ---------- */
const LOGO = {
  amazon: 'assets/logos/amazon.png',
  flipkart: 'assets/logos/flipkart.png',
  meesho: 'assets/logos/meesho.png',
  zepto: 'assets/logos/zepto.png',
  blinkit: 'assets/logos/blinkit.png',
  instamart: 'assets/logos/instamart.png'
};
const brandMark = (k, s = 22) => `<span class="bmark" style="width:${s}px;height:${s}px"><img src="${LOGO[k]}" alt="${PL[k].name}" width="${s}" height="${s}" loading="lazy"></span>`;
const brandChip = (k, s = 22) => `<span class="bchip">${brandMark(k, s)}<b>${PL[k].name}</b></span>`;

/* ---------- catalogue (sample data for the prototype) ---------- */
const PL = {
  amazon:   { name: 'Amazon',           col: '#E69F00', dash: '',         shape: 'c',  eta: 360,  etaTxt: 'Today',    ret: 10, r: 4.5, rc: 12543 },
  flipkart: { name: 'Flipkart',         col: '#0072B2', dash: '7 4',      shape: 's',  eta: 1440, etaTxt: 'Tomorrow', ret: 7,  r: 4.4, rc: 8921 },
  meesho:   { name: 'Meesho',           col: '#CC79A7', dash: '2 3',      shape: 't',  eta: 4320, etaTxt: '2-3 days', ret: 7,  r: 4.3, rc: 3201 },
  zepto:    { name: 'Zepto',            col: '#009E73', dash: '9 3 2 3',  shape: 'd',  eta: 15,   etaTxt: '15 mins',  ret: 2,  r: 4.3, rc: 421 },
  blinkit:  { name: 'Blinkit',          col: '#D55E00', dash: '1 4',      shape: 'co', eta: 10,   etaTxt: '10 mins',  ret: 2,  r: 4.2, rc: 542 },
  instamart:{ name: 'Swiggy Instamart', col: '#56B4E9', dash: '12 4',     shape: 'so', eta: 20,   etaTxt: '20 mins',  ret: 2,  r: 4.1, rc: 312 }
};
const PRE = {
  acc:    { amazon: 1, flipkart: 1.04, meesho: 1.07, zepto: 1.19, blinkit: 1.23, instamart: 1.31 },
  phone:  { amazon: 1, flipkart: .985, zepto: 1.03, blinkit: 1.02 },
  watch:  { amazon: 1, flipkart: 1.02, blinkit: 1.03, instamart: 1.04 },
  audio:  { amazon: 1.01, flipkart: .97, blinkit: 1.06, instamart: 1.08 },
  laptop: { amazon: 1, flipkart: .98 }
};
const P = [
  { id: 'boat141', name: 'boAt Airdopes 141 Bluetooth Truly Wireless', label: 'Wireless Earbuds', cat: 'earbuds', tags: ['42H Playtime', '8mm Drivers', 'IPX4'], mrp: 2999, base: 1299, pre: 'acc', r: 4.4, rv: '26K+', kw: 'boat airdopes 141 earbuds earphones tws audio', pitch: 'Best value pick with 42H playtime', bat: 9 },
  { id: 'boat141pro', name: 'boAt Airdopes 141 Pro with ENx™ Technology', label: 'Wireless Earbuds', cat: 'earbuds', tags: ['ENx Tech', '42H Playtime', 'ASAP Charge'], mrp: 3499, base: 1499, pre: 'acc', r: 4.3, rv: '9K+', kw: 'boat airdopes 141 pro earbuds earphones tws audio enx', pitch: 'ENx mics for clearer calls', bat: 9, pop: .7 },
  { id: 'boat141blk', name: 'boAt Airdopes 141 - Active Black', label: 'Wireless Earbuds', cat: 'earbuds', tags: ['Bluetooth v5.0', '42H Playtime', 'Voice Assistant'], mrp: 2499, base: 1199, pre: 'acc', r: 4.3, rv: '12K+', kw: 'boat airdopes 141 black earbuds earphones tws audio', pitch: 'Cheapest 141 variant', bat: 9, pop: .8 },
  { id: 'boat141bun', name: 'boAt Airdopes 141 TWS Earbuds Bundle', label: 'Wireless Earbuds', cat: 'earbuds', tags: ['Bundle Pack', '42H Total', 'IPX4 Water Resistant'], mrp: 3999, base: 1899, pre: 'acc', r: 4.2, rv: '3K+', kw: 'boat airdopes 141 bundle earbuds earphones tws audio', pitch: 'Bundle with extras', bat: 9, pop: .3 },
  { id: 'iphone15pro', name: 'Apple iPhone 15 Pro (128 GB)', label: 'Smartphones', cat: 'phone', tags: ['A17 Pro', '48MP Camera', 'Titanium'], mrp: 134900, base: 129900, pre: 'phone', r: 4.6, rv: '18K+', kw: 'apple iphone 15 pro phone smartphone mobile', pitch: 'Best overall camera and video', cam: 10, bat: 7, pop: 1.4 },
  { id: 's24', name: 'Samsung Galaxy S24 (8GB/256GB)', label: 'Smartphones', cat: 'phone', tags: ['Galaxy AI', '50MP Camera', '120Hz'], mrp: 89999, base: 74999, nine: 1, pre: 'phone', r: 4.4, rv: '14K+', kw: 'samsung galaxy s24 phone smartphone mobile android', pitch: 'Great value with flagship features', cam: 9, bat: 8, pop: 1.2 },
  { id: 'pixel8', name: 'Google Pixel 8 (128 GB)', label: 'Smartphones', cat: 'phone', tags: ['Tensor G3', 'Magic Editor', '7 yrs updates'], mrp: 75999, base: 59999, nine: 1, pre: 'phone', r: 4.3, rv: '7K+', kw: 'google pixel 8 phone smartphone mobile android', pitch: 'Best AI photography', cam: 9.5, bat: 7, pop: .8 },
  { id: 'narzo', name: 'realme Narzo 60x 5G (6GB/128GB)', label: 'Smartphones', cat: 'phone', tags: ['5G', '5000mAh', '33W Charge'], mrp: 16999, base: 12499, nine: 1, pre: 'phone', r: 4.2, rv: '31K+', kw: 'realme narzo 60x 5g phone smartphone mobile android budget', pitch: 'Best budget 5G phone', cam: 6, bat: 9, pop: 1.3 },
  { id: 'watch9', name: 'Apple Watch Series 9 (GPS, 41mm)', label: 'Wearables', cat: 'watch', tags: ['Always-On', 'ECG', 'Crash Detection'], mrp: 41900, base: 39900, pre: 'watch', r: 4.7, rv: '5K+', kw: 'apple watch series 9 smartwatch wearable', pitch: 'Most complete smartwatch for iPhone users', bat: 5, pop: .6 },
  { id: 'noise', name: 'Noise ColorFit Pro 4 Smartwatch', label: 'Wearables', cat: 'watch', tags: ['1.85" AMOLED', 'BT Calling', '7-Day Battery'], mrp: 6999, base: 3499, pre: 'acc', r: 4.1, rv: '19K+', kw: 'noise colorfit pro 4 smartwatch watch wearable fitness tracker', pitch: 'Budget fitness tracking with calling', bat: 8 },
  { id: 'miband', name: 'Mi Smart Band 8', label: 'Fitness Bands', cat: 'band', tags: ['16-Day Battery', '150+ Sports', '1.62" AMOLED'], mrp: 3499, base: 2499, pre: 'acc', r: 4.3, rv: '22K+', kw: 'mi xiaomi smart band 8 fitness tracker wearable', pitch: 'Longest battery, best value tracker', bat: 10 },
  { id: 'sonyxm5', name: 'Sony WH-1000XM5 Wireless Headphones', label: 'Audio', cat: 'headphones', tags: ['Active Noise Cancelling', '30H Battery', 'LDAC'], mrp: 34990, base: 26999, nine: 1, pre: 'audio', r: 4.5, rv: '6K+', kw: 'sony wh-1000xm5 xm5 headphones headset noise cancelling audio wireless', pitch: 'Best noise cancelling', bat: 9, pop: .5 },
  { id: 'hp15', name: 'HP 15s Laptop (Core i3, 8GB, 512GB SSD)', label: 'Laptops', cat: 'laptop', tags: ['Intel Core i3', '8GB RAM', '512GB SSD'], mrp: 46999, base: 34999, nine: 1, pre: 'laptop', r: 4.1, rv: '9K+', kw: 'hp 15s laptop notebook student budget', pitch: 'Solid all-rounder for students', pop: .3 },
  { id: 'lenovo', name: 'Lenovo IdeaPad Slim 3 (Ryzen 5, 16GB)', label: 'Laptops', cat: 'laptop', tags: ['Ryzen 5', '16GB RAM', '1.6 kg'], mrp: 62990, base: 41999, nine: 1, pre: 'laptop', r: 4.3, rv: '4K+', kw: 'lenovo ideapad slim 3 laptop notebook student coding', pitch: 'More power for coding and design', pop: .25 }
];
const byId = id => P.find(p => p.id === id);
const TRENDING = ['boat141', 'iphone15pro', 'watch9', 's24', 'sonyxm5', 'pixel8'];

/* ---------- state (persisted, per-viewer) ---------- */
const KEY = 'pricewise.proto.v2';
const DAY = 864e5;
const seedState = () => {
  const now = Date.now();
  return {
    wish: ['boat141', 'iphone15pro', 'watch9', 's24', 'sonyxm5', 'hp15'],
    alerts: [{ pid: 'boat141', target: 1200 }, { pid: 'iphone15pro', target: 120000 }, { pid: 'watch9', target: 38000 }],
    hist: [
      { pid: 'boat141', k: 'amazon', price: 1299, saved: 1700, ts: now - 3 * DAY },
      { pid: 's24', k: 'flipkart', price: 74999, saved: 15000, ts: now - 16 * DAY },
      { pid: 'watch9', k: 'amazon', price: 39900, saved: 2000, ts: now - 29 * DAY }
    ],
    recent: ['Sony WH-1000XM5', 'iPhone 15 Pro', 'Noise ColorFit Pro 4'],
    notifs: [
      { id: 1, type: 'drop', title: 'Price Drop Alert!', body: 'boAt Airdopes 141 is now ₹1,299 (57% below MRP)', ts: now - 2 * 36e5, read: false, pid: 'boat141' },
      { id: 2, type: 'fast', title: 'Fast Delivery Available', body: 'iPhone 15 Pro can be delivered in 10 mins via Blinkit', ts: now - 5 * 36e5, read: false, pid: 'iphone15pro' },
      { id: 3, type: 'rec', title: 'New Recommendation', body: 'Based on your interests: Samsung Galaxy S24', ts: now - DAY, read: true, pid: 's24' },
      { id: 4, type: 'drop', title: 'Price Drop Alert!', body: 'Apple Watch Series 9 dropped by ₹2,000', ts: now - 2 * DAY, read: true, pid: 'watch9' }
    ],
    drop: {},
    a11y: { cb: 'normal', fs: 'm', hc: false },
    prefs: { push: true, email: false, analytics: false },
    onboarded: false,
    addr: { label: 'Home', line: '14 Dwarka Greens', city: 'Delhi', pin: '110078' },
    theme: 'system',
    account: { name: 'Guest User', email: 'guest@pricewise.example' }
  };
};
let S = seedState();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(seedState(), JSON.parse(raw)); } catch (e) { /* storage unavailable: run in memory */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

/* ---------- pincode-based serviceability ---------- */
const QUICK = ['zepto', 'blinkit', 'instamart'];
const METRO_PIN = ['110', '111', '122', '120', '201', '400', '401', '410', '411', '560', '562', '600', '601', '500', '501', '700', '701', '380', '382', '360', '390', '395', '226', '800', '834', '641', '682'];
const quickOk = pin => !!pin && METRO_PIN.some(pre => pin.startsWith(pre));
function stockOk(pid, k, pin) {
  if (!pin) return true;
  let h = 0; const s = pid + k + pin;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 100) >= 9;
}

/* ---------- pricing engine ---------- */
function offersFor(k, price) {
  const big = price > 5000, huge = price > 50000, o = [];
  if (k === 'amazon') o.push({ t: 'cash', x: big ? '₹500 Amazon Pay' : '₹100 Amazon Pay' }, { t: 'card', x: big ? `Up to ${huge ? '₹5,000' : '₹1,500'} off with ICICI` : '10% off with ICICI' }, { t: 'coupon', x: big ? 'Code: SAVE500' : 'Code: SAVE10' });
  if (k === 'flipkart') o.push({ t: 'cash', x: big ? '₹500 SuperCoins' : '₹80 SuperCoins' }, big ? { t: 'card', x: 'No Cost EMI' } : { t: 'card', x: '5% off with Axis card' });
  if (k === 'meesho') o.push({ t: 'ship', x: 'Free delivery' }, { t: 'coupon', x: '₹50 off first order' });
  if (k === 'zepto') o.push({ t: 'ship', x: 'Ultra-fast delivery' }, { t: 'coupon', x: big ? 'Code: ZEPTO250' : '₹75 off with ZEPTO75' });
  if (k === 'blinkit') o.push({ t: 'ship', x: 'Instant delivery' }, { t: 'card', x: big ? 'Up to ₹300 off with Paytm' : '5% off with Paytm' });
  if (k === 'instamart') o.push({ t: 'ship', x: 'Quick delivery' }, { t: 'cash', x: '₹60 Swiggy Money' });
  return o;
}
function listings(p) {
  const pre = PRE[p.pre], mult = S.drop[p.id] || 1, pin = (S.addr && S.addr.pin) || '', out = [];
  for (const k in pre) {
    if (QUICK.includes(k) && pin && !quickOk(pin)) continue;
    const pl = PL[k], raw = p.base * pre[k] * mult;
    const price = raw < 10000 ? Math.round(raw / 50) * 50 - 1 : Math.round(raw / 100) * 100 - (p.nine ? 1 : 0);
    const disc = Math.max(0, Math.round((1 - price / p.mrp) * 100));
    const off = offersFor(k, price);
    if (disc > 0) off.unshift({ t: 'disc', x: disc + '% off' });
    const inStock = stockOk(p.id, k, pin);
    out.push({ k, pl, price, mrp: p.mrp, disc, offers: off, rating: Math.min(4.9, Math.round((pl.r - 4.4 + p.r) * 10) / 10), rc: Math.round(pl.rc * (p.pop || 1)), eta: pl.eta, etaTxt: pl.etaTxt, ret: pl.ret, inStock });
  }
  return out.some(l => l.inStock) ? out : out.map(l => Object.assign({}, l, { inStock: true }));
}
const bestOf = p => {
  const L = listings(p), av = L.filter(l => l.inStock);
  return (av.length ? av : L).reduce((a, b) => (b.price < a.price ? b : a));
};
function priceHistory(p, l) {
  const r = rng(hash(p.id + l.k)), start = l.price * (1.07 + r() * .17), out = [];
  for (let i = 0; i < 30; i++) {
    const t = i / 29, v = start + (l.price - start) * Math.pow(t, .85);
    out.push(Math.round(v * (1 + (r() - .5) * .024)));
  }
  out[29] = l.price;
  return out;
}
function stats(h) {
  const cur = h[h.length - 1], min = Math.min(...h), max = Math.max(...h), avg = Math.round(h.reduce((a, b) => a + b, 0) / h.length), ch = (cur - h[0]) / h[0];
  return { cur, min, max, avg, ch, trend: ch < -.02 ? 'Decreasing' : ch > .02 ? 'Increasing' : 'Stable' };
}
function search(q) {
  const toks = q.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  if (!toks.length) return [];
  const words = p => (p.name + ' ' + p.kw + ' ' + p.label).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
  const res = P.map(p => { const w = words(p); return { p, s: toks.filter(t => w.some(x => x.startsWith(t))).length }; }).filter(x => x.s > 0);
  const full = res.filter(x => x.s === toks.length);
  return (full.length ? full : res.filter(x => x.s >= Math.ceil(toks.length / 2))).sort((a, b) => b.s - a.s).map(x => x.p);
}
function summary(p) {
  const L = listings(p).sort((a, b) => a.price - b.price), best = L[0], next = L[1];
  const fast = [...L].sort((a, b) => a.eta - b.eta)[0];
  const h = priceHistory(p, best), st = stats(h), lines = [];
  lines.push(next ? `Cheapest on ${best.pl.name} at ${inr(best.price)}, ${inr(next.price - best.price)} below ${next.pl.name}.` : `Only listed on ${best.pl.name} at ${inr(best.price)}.`);
  lines.push(fast.k === best.k ? `${best.pl.name} is also the fastest option (${best.etaTxt}).` : `Fastest is ${fast.pl.name} (${fast.etaTxt}) for ${inr(fast.price - best.price)} more.`);
  const above = (best.price - st.min) / st.min;
  lines.push(above <= .02 ? `Price is near its 30-day low (${inr(st.min)}).` : `Now ${Math.round(above * 100)}% above its 30-day low of ${inr(st.min)}.`);
  return { lines, buy: above <= .02, best, st };
}
