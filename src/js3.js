/* ---------- router + render ---------- */
const cur = () => { const s = ui.stacks[ui.tab]; return s[s.length - 1]; };
const cp = () => cur().a.pid;
const nm = p => p.name.replace(/ \(.*/, '').replace(/ with .*/, '');
let lastTab = null;
function render(keep, dir) {
  const scr = $('#screen'), old = scr.querySelector('.scroll'), y = keep && old ? old.scrollTop : 0;
  const c = ui.started ? cur() : { n: ui.pre, a: {} };
  scr.className = 'screen';
  scr.innerHTML = V[c.n](c.a);
  if (dir) { void scr.offsetWidth; scr.classList.add('go-' + dir); }
  $('#tabs').hidden = !ui.started;
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-current', b.dataset.t === ui.tab ? 'page' : 'false'));
  if (ui.tab !== lastTab) {
    const chip = document.querySelector(`#tabs button[data-t="${ui.tab}"] .ic`);
    if (chip) { chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop'); }
    lastTab = ui.tab;
  }
  const sc = scr.querySelector('.scroll');
  if (sc) sc.scrollTop = c.n === 'ai' ? sc.scrollHeight : y;
  if (dir) { const h = scr.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  saveNav();
}
const push = (n, a) => { settleSheet(); ui.stacks[ui.tab].push({ n, a: a || {} }); pushNav(); render(0, 'fwd'); };

/* ---------- real back-gesture / hardware-back support ----------
   The app keeps its own navigation stacks, but a mobile back gesture or
   hardware back button only has anything to "step through" if we mirror
   each forward move onto the real browser History API. Every screen
   push, tab switch, auth-flow step and sheet-open below calls pushNav();
   the single popstate handler is the only place that applies a state
   change, so gesture-back and our own in-app back button both funnel
   through one path and never fall out of sync. */
let applyingNav = false;
function navState() {
  if ($('#sheet') && !$('#sheet').hidden) return { k: 'sheet' };
  if (!ui.started) return { k: 'pre', pre: ui.pre, onbStep: ui.onbStep || 0 };
  return { k: 'app', tab: ui.tab, depth: ui.stacks[ui.tab].length };
}
function pushNav() { if (!applyingNav) window.history.pushState(navState(), ''); }
function replaceNav() { window.history.replaceState(navState(), ''); }
function applyNavState(state) {
  applyingNav = true;
  closeSheet();
  if (!state) {
    if (ui.started) ui.stacks[ui.tab].length = 1; else ui.pre = 'splash';
  } else if (state.k === 'pre') {
    ui.started = false; ui.pre = state.pre; ui.onbStep = state.onbStep || 0;
  } else if (state.k === 'app') {
    ui.started = true; ui.tab = state.tab;
    const s = ui.stacks[state.tab]; if (s) s.length = Math.max(1, Math.min(state.depth, s.length));
  }
  render(0, 'back');
  applyingNav = false;
}
window.addEventListener('popstate', e => applyNavState(e.state));
function dismissSheet() { if (window.history.state && window.history.state.k === 'sheet') window.history.back(); else closeSheet(); }
function settleSheet() { closeSheet(); replaceNav(); }
function primeHistory() {
  if (ui.started) {
    const depth = ui.stacks[ui.tab].length;
    window.history.replaceState({ k: 'app', tab: ui.tab, depth: 1 }, '');
    for (let d = 2; d <= depth; d++) window.history.pushState({ k: 'app', tab: ui.tab, depth: d }, '');
  } else {
    window.history.replaceState({ k: 'pre', pre: ui.pre, onbStep: ui.onbStep || 0 }, '');
  }
}
function applyA11y() {
  const a = S.a11y, app = $('#app');
  app.classList.toggle('hc', !!a.hc);
  document.documentElement.style.fontSize = { s: '14px', m: '16px', l: '18.5px' }[a.fs] || '16px';
  app.style.filter = a.cb === 'normal' ? '' : `url(#f-${a.cb})`;
}
let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }
function openSheet(html) { const s = $('#sheet'); s.innerHTML = `<div class="scrim" data-act="closesheet"></div><div class="sheetc" role="dialog" aria-modal="true">${html}</div>`; s.hidden = false; pushNav(); const b = s.querySelector('button,select,input'); if (b) b.focus({ preventScroll: true }); }
function closeSheet() { const s = $('#sheet'); s.hidden = true; s.innerHTML = ''; }

function doSearch(q) {
  q = q.trim();
  if (!q) return toast('Type a product name to search');
  S.recent = [q, ...S.recent.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 5); save();
  ui.q = ''; push('select', { q });
}
function checkAlerts() {
  S.alerts.forEach(al => {
    const p = byId(al.pid), b = bestOf(p);
    if (b.price <= al.target && !al.notified) {
      al.notified = true;
      S.notifs.unshift({ id: Date.now() + Math.random(), type: 'drop', title: 'Price Drop Alert!', body: `${nm(p)} is now ${inr(b.price)} on ${b.pl.name}, below your ${inr(al.target)} target`, ts: Date.now(), read: false, pid: p.id });
      toast(`Target reached: ${nm(p)} is ${inr(b.price)}`);
    }
  });
  save();
}
function setAlert(pid, v) {
  const b = bestOf(byId(pid)).price;
  if (!v || v <= 0) return toast('Enter a target price'), false;
  if (v >= b) return toast(`Pick a target below today's best price (${inr(b)})`), false;
  S.alerts = S.alerts.filter(a => a.pid !== pid); S.alerts.unshift({ pid, target: v }); save();
  return true;
}

/* ---------- actions ---------- */
const A = {
  start() { ui.started = true; pushNav(); render(0, 'fwd'); },
  golog() { ui.pre = 'login'; pushNav(); render(0, 'fwd'); },
  gosign() { ui.pre = 'signup'; pushNav(); render(0, 'fwd'); },
  dologin() { if (!S.onboarded) { ui.onbStep = 0; ui.pre = 'onboard'; pushNav(); render(0, 'fwd'); } else A.start(); },
  dosignup() { ui.onbStep = 0; ui.pre = 'onboard'; pushNav(); render(0, 'fwd'); },
  gmail() {
    toast('Signed in with Gmail (prototype)');
    if (!S.onboarded) { ui.onbStep = 0; ui.pre = 'onboard'; pushNav(); render(0, 'fwd'); } else A.start();
  },
  onbnext() { ui.onbStep = (ui.onbStep || 0) + 1; pushNav(); render(0, 'fwd'); },
  onbskip() { S.onboarded = true; save(); ui.onbStep = 0; ui.pre = 'splash'; A.start(); },
  onbdone() { S.onboarded = true; save(); ui.onbStep = 0; ui.pre = 'splash'; A.start(); },
  back() { window.history.back(); },
  tab(d) { if (d.t === ui.tab) ui.stacks[d.t].length = 1; ui.tab = d.t; settleSheet(); pushNav(); render(0); },
  open(d) { ui.f = FDEF(); ui.off = {}; ui.view = 'cards'; push('compare', { pid: d.pid }); },
  try() { doSearch('boAt 141 Airdopes'); },
  rs(d) { doSearch(d.q); },
  clearrecent() { S.recent = []; save(); render(1); toast('Search history cleared'); },
  notifs() { push('notifs'); }, settings() { push('settings'); }, alerts() { push('alerts'); }, hist() { push('hist'); },
  loc() {
    const ad = S.addr;
    openSheet(`<h3>Delivery location</h3><p class="body">Prices, stock and delivery times can vary by pincode. Set where you want your orders delivered.</p>
<form id="addrform">
<div class="field"><label for="alabel">Label</label><input id="alabel" type="text" placeholder="Home, Work…" value="${esc(ad.label)}" required></div>
<div class="field"><label for="aline">Address</label><input id="aline" type="text" placeholder="House no., street, area" value="${esc(ad.line)}" required></div>
<div class="field"><label for="acity">City</label><input id="acity" type="text" placeholder="City" value="${esc(ad.city)}" required></div>
<div class="field"><label for="apin">Pincode</label><input id="apin" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="6-digit pincode" value="${esc(ad.pin)}" required></div>
<button class="cta full" type="submit">Save address</button>
</form>
<button class="btn2 full" data-act="usedefaddr">Use default: 14 Dwarka Greens, Delhi 110078</button>`);
  },
  usedefaddr() { S.addr = { label: 'Home', line: '14 Dwarka Greens', city: 'Delhi', pin: '110078' }; save(); settleSheet(); render(1); toast('Delivery location set to Delhi 110078'); },
  access() { push('access'); }, privacy() { push('privacy'); }, help() { push('help'); }, about() { push('about'); },
  filters() { push('filters', { pid: cp() }); },
  track(d) { push('tracking', { pid: d.pid || cp() }); },
  wish(d) { const i = S.wish.indexOf(d.pid); if (i > -1) { S.wish.splice(i, 1); toast('Removed from wishlist'); } else { S.wish.push(d.pid); toast('Saved to wishlist'); } save(); render(1); },
  view(d) { ui.view = d.v; render(1); },
  buy(d) { push('confirm', { pid: cp(), k: d.k }); },
  swap(d) { const pid = cp(); ui.stacks[ui.tab].pop(); push('confirm', { pid, k: d.k }); },
  go(d) {
    const p = byId(cp()), l = listings(p).find(x => x.k === d.k);
    openSheet(`<h3>Prototype checkpoint</h3><p class="body">In the live app this opens ${l.pl.name} so you can finish checkout there. In this prototype you stay here.</p><button class="cta full" data-act="bought" data-k="${d.k}">I bought it: add to Purchase History</button><button class="btn2 full" data-act="closesheet">Keep comparing</button>`);
  },
  bought(d) {
    const pid = cp(), p = byId(pid), L = listings(p), l = L.find(x => x.k === d.k), hi = Math.max(...L.map(x => x.price));
    S.hist.unshift({ pid, k: d.k, price: l.price, saved: hi - l.price, ts: Date.now() }); save();
    settleSheet(); ui.tab = 'profile'; ui.stacks.profile = [{ n: 'profile', a: {} }, { n: 'hist', a: {} }]; pushNav(); render(0, 'fwd'); toast('Added to Purchase History');
  },
  closesheet() { dismissSheet(); },
  hdet(d) {
    const h = S.hist[+d.i], p = byId(h.pid);
    openSheet(`<h3>${esc(p.name)}</h3><dl class="dl"><div><dt>Platform</dt><dd>${PL[h.k].name}</dd></div><div><dt>Price paid</dt><dd>${inr(h.price)}</dd></div><div><dt>Saved vs. priciest listing</dt><dd>${inr(h.saved)}</dd></div><div><dt>Date</dt><dd>${fdate(h.ts)}</dd></div></dl><button class="cta full" data-act="open" data-pid="${p.id}">Compare prices again</button><button class="btn2 full" data-act="closesheet">Close</button>`);
  },
  /* filters */
  fsort(d) { ui.f.sort = d.v; render(1); },
  fspeed(d) { ui.f.speed = d.v; render(1); },
  frate(d) { const v = +d.v; ui.f.minR = ui.f.minR === v ? 0 : v; render(1); },
  ftog(d, el) { ui.f[d.k] = el.checked; render(1); },
  fplat(d, el) {
    const all = listings(byId(cp())).map(l => l.k);
    let sel = ui.f.plats || all.slice();
    sel = el.checked ? [...new Set([...sel, d.k])] : sel.filter(k => k !== d.k);
    if (!sel.length) { toast('Keep at least one platform selected'); return render(1); }
    ui.f.plats = sel.length === all.length ? null : sel; render(1);
  },
  freset() { ui.f = FDEF(); render(1); },
  lg(d) { ui.off[d.k] = !ui.off[d.k]; render(1); },
  /* alerts */
  delalert(d) { S.alerts = S.alerts.filter(a => a.pid !== d.pid); save(); render(1); toast('Alert removed'); },
  newalert() {
    const av = P.filter(p => !S.alerts.some(a => a.pid === p.id));
    if (!av.length) return toast('You already have an alert on every product');
    openSheet(`<h3>New price alert</h3><label for="nap">Product</label><select id="nap">${av.map(p => `<option value="${p.id}">${esc(nm(p))}</option>`).join('')}</select><label for="nat">Target price (₹)</label><input id="nat" type="number" inputmode="numeric" value="${Math.round(bestOf(av[0]).price * .92 / 10) * 10}"><p class="hint" id="nah">Best price now: ${inr(bestOf(av[0]).price)}</p><button class="cta full" data-act="mkalert">Create alert</button>`);
  },
  mkalert() { if (setAlert($('#nap').value, Math.round(+$('#nat').value))) { settleSheet(); render(1); toast('Alert created'); } },
  sim(d) {
    const al = S.alerts.find(a => a.pid === d.pid), p = byId(d.pid);
    let n = 0;
    while (bestOf(p).price > al.target && n++ < 12) S.drop[p.id] = (S.drop[p.id] || 1) * (al.target * .96 / bestOf(p).price);
    al.notified = false; checkAlerts(); render(1);
  },
  /* notifications */
  nopen(d) { const n = S.notifs.find(x => String(x.id) === d.id); if (n) { n.read = true; save(); A.open({ pid: n.pid }); } },
  readall() { S.notifs.forEach(n => n.read = true); save(); render(1); },
  /* settings */
  sw(d) {
    if (d.k === 'hc') S.a11y.hc = !S.a11y.hc; else S.prefs[d.k] = !S.prefs[d.k];
    save(); applyA11y(); render(1);
  },
  cb(d) { S.a11y.cb = d.v; save(); applyA11y(); render(1); },
  fs(d) { S.a11y.fs = d.v; save(); applyA11y(); render(1); },
  logout() { ui.started = false; ui.tab = 'home'; ui.pre = 'splash'; Object.keys(ui.stacks).forEach(k => ui.stacks[k].length = 1); replaceNav(); render(0); },
  reset() { S = seedState(); save(); ui.f = FDEF(); ui.chat.length = 1; ui.q = ''; applyA11y(); render(1); toast('Prototype data reset'); },
  toast(d) { toast(d.m); },
  ask(d) { send(d.q); }
};

/* ---------- assistant (rule-based, answers from the sample catalogue) ---------- */
const CATS = [['earbuds', /ear ?buds?|earphones?|tws|airpods|airdopes/], ['headphones', /headphones?|headset/], ['phone', /\bphones?\b|mobiles?|smartphones?/], ['watch', /smart ?watch|\bwatch/], ['band', /\bband|fitness|tracker/], ['laptop', /laptops?|notebook/]];
function budgetOf(t) {
  t = t.replace(/,/g, '');
  const m = t.match(/(?:under|below|less than|within|upto|up to|max|budget(?: of)?|<)\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d+)?)\s*(k|l|lakh)?/) || t.match(/(?:₹|rs\.?)\s*(\d+(?:\.\d+)?)\s*(k|l|lakh)?/);
  if (!m) return null;
  let v = parseFloat(m[1]); if (m[2] === 'k') v *= 1e3; else if (m[2]) v *= 1e5;
  return v;
}
function botReply(text) {
  const t = text.toLowerCase(), budget = budgetOf(t), cheap = (a, b) => bestOf(a).price - bestOf(b).price;
  if (/^(hi|hello|hey|namaste)\b/.test(t)) return { t: 'Hello! Tell me what you want to buy and your budget, for example “best earbuds under ₹2000”. I can also compare two products or point you to price alerts.' };
  if (/thank/.test(t)) return { t: 'Happy to help! Ask me about another product any time.' };
  if (/what can you|^help\b/.test(t)) return { t: 'I can recommend products by budget or need, compare two products, and summarise the deals on a product. Try “Compare iPhone 15 Pro and Galaxy S24”.' };
  if (/compare|\bvs\.?\b|versus/.test(t)) {
    const ps = t.replace(/compare|between/g, ' ').split(/\bvs\.?\b|versus|\band\b|,|&/).map(s => s.trim()).filter(Boolean).map(s => search(s)[0]).filter((p, i, a) => p && a.indexOf(p) === i).slice(0, 2);
    if (ps.length === 2) {
      const [a, b] = ps, pa = bestOf(a), pb = bestOf(b), lo = pa.price <= pb.price ? a : b, hi = lo === a ? b : a;
      return { t: `${nm(a)}: ${inr(pa.price)} on ${pa.pl.name}\n${nm(b)}: ${inr(pb.price)} on ${pb.pl.name}\n\n${nm(lo)} costs ${inr(Math.abs(pa.price - pb.price))} less. ${nm(lo)}: ${lo.pitch.toLowerCase()}. ${nm(hi)}: ${hi.pitch.toLowerCase()}.`, ps: [a.id, b.id] };
    }
  }
  if (/alert|notify|tell me when|price drop/.test(t)) {
    const p = search(t.replace(/alert|notify|tell me when|price drop|set|me|an|for|on|the|a/g, ' '))[0];
    if (p) return { t: `I can watch ${nm(p)} for you. Its best price today is ${inr(bestOf(p).price)}. Pick a target below that and PriceWise will flag it.`, acts: [{ l: 'Set price alert', act: 'track', pid: p.id }] };
    return { t: 'Open any product and tap the trend icon to set a price alert. All alerts live under Profile > Price Alerts.' };
  }
  const cat = CATS.find(c => c[1].test(t));
  let pool = null;
  if (cat) pool = P.filter(p => cat[0] === 'band' || cat[0] === 'watch' ? ['band', 'watch'].includes(p.cat) : p.cat === cat[0]);
  else if (/student|college/.test(t)) pool = P.filter(p => p.cat === 'laptop');
  if (pool) {
    const label = pool[0].label.toLowerCase();
    let list = budget ? pool.filter(p => bestOf(p).price <= budget) : pool;
    if (budget && !list.length) { list = [...pool].sort(cheap).slice(0, 2); return { t: `Nothing in the sample catalogue is under ${inr(budget)}. The closest ${label} start at ${inr(bestOf(list[0]).price)}:`, ps: list.map(p => p.id) }; }
    list = list.sort((a, b) => /camera|photo/.test(t) ? (b.cam || 0) - (a.cam || 0) : /battery/.test(t) ? (b.bat || 0) - (a.bat || 0) : /student|cheap|budget|affordable/.test(t) ? cheap(a, b) : b.r - a.r || cheap(a, b)).slice(0, 3);
    const ask = !budget && !/budget|cheap|student|affordable/.test(t) && ['phone', 'laptop'].includes(pool[0].cat) ? `\n\nWhat's your budget? This will help me narrow down the best options for you.` : '';
    return { t: `${budget ? `Top ${label} under ${inr(budget)}` : `Top picks in ${label}`}${/camera|photo/.test(t) ? ', ranked by camera' : /battery/.test(t) ? ', ranked by battery' : ''}:${ask}`, ps: list.map(p => p.id) };
  }
  const q = t.replace(/\b(best|price|prices|deal|deals|for|of|on|the|a|an|is|what|whats|what's|how|much|show|me|find|cheapest|buy|where|to|about|tell)\b/g, ' ');
  const hit = search(q)[0];
  if (hit) return { t: summary(hit).lines.join('\n'), ps: [hit.id] };
  return { t: 'I could not match that to the sample catalogue. Try a product type like earbuds, phone, watch or laptop, add a budget, or say “compare X and Y”.' };
}
function send(text) {
  text = text.trim();
  if (!text || ui.typing) return;
  ui.chat.push({ who: 'me', t: text }); ui.typing = true; render(1);
  const i = $('#cq'); if (i) i.focus({ preventScroll: true });
  setTimeout(() => { ui.chat.push(Object.assign({ who: 'bot' }, botReply(text))); ui.typing = false; render(1); const j = $('#cq'); if (j && cur().n === 'ai') j.focus({ preventScroll: true }); }, 700);
}

/* ---------- events ---------- */
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; const f = A[el.dataset.act]; if (f) f(el.dataset, el); });
document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target.id;
  if (f === 'sform') doSearch($('#q').value);
  else if (f === 'cform') { const v = $('#cq').value; send(v); }
  else if (f === 'aform') { const pid = e.target.dataset.pid; if (setAlert(pid, Math.round(+$('#tgt').value))) { render(1); toast(`Alert set at ${inr(S.alerts[0].target)}`); } }
  else if (f === 'loginform') A.dologin();
  else if (f === 'signupform') A.dosignup();
  else if (f === 'addrform') {
    const pin = $('#apin').value.trim();
    if (!/^\d{6}$/.test(pin)) return toast('Enter a valid 6-digit pincode');
    S.addr = { label: $('#alabel').value.trim() || 'Home', line: $('#aline').value.trim(), city: $('#acity').value.trim(), pin };
    save(); settleSheet(); render(1); toast('Delivery location updated');
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') { ui.q = t.value; $('#sugg').innerHTML = suggHtml(); }
  else if (t.id === 'fmax') { const hi = +t.max; ui.f.max = +t.value >= hi ? null : +t.value; $('#fmaxv').textContent = ui.f.max == null ? 'No limit' : inr(ui.f.max); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'nap') { const b = bestOf(byId(e.target.value)).price; $('#nat').value = Math.round(b * .92 / 10) * 10; $('#nah').textContent = 'Best price now: ' + inr(b); }
  else if (e.target.id === 'fmax') render(1);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheet').hidden) dismissSheet(); });
function scrub(e) {
  const svg = e.target.closest && e.target.closest('#chart'), c = ui.cd;
  if (!svg || !c) return;
  const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * c.W, i = Math.max(0, Math.min(29, Math.round((x - c.ml) / ((c.W - c.ml - c.mr) / 29)))), xs = c.X(i);
  const xh = $('#xh'); xh.setAttribute('x1', xs); xh.setAttribute('x2', xs); xh.setAttribute('opacity', 1);
  $('#dots').innerHTML = c.H.map(({ l, h }) => marker(l.pl.shape, xs, c.Y(h[i]), l.pl.col)).join('');
  const tip = $('#tip'), rows = [...c.H].sort((a, b) => a.h[i] - b.h[i]);
  tip.innerHTML = `<b>${new Date(c.dates[i]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</b>${rows.map(({ l, h }) => `<span><i style="background:${l.pl.col}"></i>${l.pl.name}<em>${inr(h[i])}</em></span>`).join('')}`;
  tip.hidden = false; tip.classList.toggle('flip', i > 14); tip.style.left = (xs / c.W * r.width) + 'px';
}
document.addEventListener('pointermove', scrub);
document.addEventListener('pointerdown', scrub);

/* ---------- boot ---------- */
$('#tabs').innerHTML = [['home', 'home', 'Home'], ['ai', 'spark', 'AI Assistant'], ['wish', 'heart', 'Wishlist'], ['profile', 'user', 'Profile']].map(t => `<button data-act="tab" data-t="${t[0]}">${ic(t[1], 22)}<span>${t[2]}</span></button>`).join('');
applyA11y();
primeHistory();
render(0);
