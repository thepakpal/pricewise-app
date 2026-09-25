/* ---------- UI state (per session) ---------- */
const FDEF = () => ({ sort: 'price', max: null, minR: 0, speed: 'any', cash: false, card: false, coupon: false, plats: null });
const ui = {
  tab: 'home', started: false, pre: 'splash', onbStep: 0, f: FDEF(), view: 'cards', off: {}, q: '', typing: false, cd: null,
  stacks: { home: [{ n: 'home', a: {} }], ai: [{ n: 'ai', a: {} }], wish: [{ n: 'wish', a: {} }], profile: [{ n: 'profile', a: {} }] },
  chat: [{ who: 'bot', t: "Hi! I'm your AI Shopping Assistant. I can help you find the best products based on your needs. What are you looking for today?" }]
};
const SORTL = { price: 'Lowest Price First', delivery: 'Fastest Delivery', rating: 'Highest Rated', discount: 'Best Discount' };
const SPEEDL = { instant: 'Instant (10-30 mins)', same: 'Same Day', next: 'Next Day', any: 'Any' };
const OI = { disc: 'tdown', cash: 'wallet', card: 'card', coupon: 'ticket', ship: 'zap' };
const unread = () => S.notifs.filter(n => !n.read).length;
const activeF = f => (f.max != null) + (f.minR > 0) + (f.speed !== 'any') + f.cash + f.card + f.coupon + (f.plats != null);
function applyF(L, f) {
  const lim = { instant: 30, same: 720, next: 1440, any: 1e9 }[f.speed];
  const has = (l, t) => l.offers.some(o => o.t === t);
  const cmp = { price: (a, b) => a.price - b.price, delivery: (a, b) => a.eta - b.eta || a.price - b.price, rating: (a, b) => b.rating - a.rating, discount: (a, b) => b.disc - a.disc }[f.sort];
  return L.filter(l => (f.max == null || l.price <= f.max) && l.rating >= f.minR && (!f.plats || f.plats.includes(l.k)) && l.eta <= lim && (!f.cash || has(l, 'cash')) && (!f.card || has(l, 'card')) && (!f.coupon || has(l, 'coupon'))).sort(cmp);
}

/* ---------- shared fragments ---------- */
const backBtn = `<button class="ib" data-act="back" aria-label="Back">${ic('left', 22)}</button>`;
const backBtnS = `<button class="ib on-strong" data-act="back" aria-label="Back">${ic('left', 22)}</button>`;
const hdrP = (title, sub, right = '', root = false) => `<header class="hp"><div class="hp-row">${root ? '' : backBtn}<div class="grow"></div>${right}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;
const MESH = { amber: 'mesh-warm', ai: 'mesh-ai' };
const hdrG = (title, sub, right = '', cls = '', root = false) => `<header class="hg ${MESH[cls] || 'mesh-cool'} ${cls}"><div class="hp-row">${root ? '' : backBtnS}<div class="grow"></div>${right}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;
const empty = (icon, title, text, extra = '') => `<div class="empty">${ic(icon, 30)}<b>${title}</b><p>${text}</p>${extra}</div>`;
const chipsTrending = () => `<div class="chips">${TRENDING.slice(0, 4).map(id => `<button class="chip" data-act="open" data-pid="${id}">${esc(byId(id).name.split(' ').slice(0, 3).join(' '))}</button>`).join('')}</div>`;
const row = (icon, label, act, d = '', badge = 0, cls = '') => `<button class="mrow ${cls}" data-act="${act}" ${d}><span class="mi">${ic(icon, 18)}</span><span class="grow">${label}</span>${badge ? `<i class="badge">${badge}</i>` : ''}${cls ? '' : ic('right', 16)}</button>`;
const gtile = (icon, tone, label, act, d = '', sub = '', badge = 0) => `<button class="gtile ${tone}" data-act="${act}" ${d}><span class="mi ${tone}">${ic(icon, 19)}</span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}${badge ? `<i class="badge">${badge}</i>` : ic('right', 16, 'chev')}</button>`;
const toggle = (id, on, label, sub = '') => `<div class="trow"><div class="grow"><b>${label}</b>${sub ? `<span class="mute">${sub}</span>` : ''}</div><button id="${id}" class="sw" role="switch" aria-checked="${on}" aria-label="${label}" data-act="sw" data-k="${id}"><i></i></button></div>`;
const monoOf = l => brandMark(l.k, 30);
const offerRows = l => l.offers.slice(0, 4).map(o => `<div class="off ${o.t}">${ic(OI[o.t], 14)}<span>${esc(o.x)}</span></div>`).join('');
const ldr = (label, val, cls = '') => `<div class="ldr ${cls}"><span>${label}</span><i></i><b>${val}</b></div>`;

/* ---------- views ---------- */
const V = {};

V.splash = () => `<section class="splash mesh-cool"><div class="logo mark">${LOGOMARK}</div><h1>PriceWise</h1><div class="rule"></div><p class="tag">Find the best deals, instantly</p>
<ul class="vals">
<li>${ic('search', 20)}<div><b>Smart Search</b><span>Search products across multiple platforms with AI-powered matching</span></div></li>
<li>${ic('trend', 20)}<div><b>Compare Prices</b><span>See side-by-side prices from shopping and quick-commerce apps</span></div></li>
<li>${ic('spark', 20)}<div><b>Best Deals</b><span>Smart summaries and recommendations to help you find the perfect deal every time</span></div></li>
</ul><button class="cta gold full" data-act="gosign">Get Started</button><p class="switchline light">Already have an account? <button class="light" data-act="golog">Log in</button></p><p class="proto">MINIMUM VIABLE PROTOTYPE · SAMPLE DATA</p></section>`;

V.login = () => `<section class="auth">
<div class="abar"><button class="ib" data-act="gosplash" aria-label="Back">${ic('left', 22)}</button></div>
<h1>Welcome back</h1><p class="sub">Log in to track prices and pick up where you left off.</p>
<form id="loginform">
<div class="field"><label for="lem">Email</label><input id="lem" type="email" autocomplete="email" placeholder="you@example.com" required></div>
<div class="field"><label for="lpw">Password</label><input id="lpw" type="password" autocomplete="current-password" placeholder="••••••••" required></div>
<button class="lnk fpw" type="button" data-act="toast" data-m="Password reset isn't wired up in this prototype">Forgot password?</button>
<button class="cta full" type="submit">Log In</button>
</form>
<div class="divider"><span>or continue with</span></div>
<button class="gbtn" data-act="gmail">${GICON}Continue with Gmail</button>
<p class="switchline">New to PriceWise? <button data-act="gosign">Create account</button></p>
<p class="proto2">MINIMUM VIABLE PROTOTYPE · No real account is created</p>
</section>`;

V.signup = () => `<section class="auth">
<div class="abar"><button class="ib" data-act="golog" aria-label="Back">${ic('left', 22)}</button></div>
<h1>Create your account</h1><p class="sub">Track prices, save wishlists and never overpay again.</p>
<form id="signupform">
<div class="field"><label for="snm">Full name</label><input id="snm" type="text" autocomplete="name" placeholder="Your name" required></div>
<div class="field"><label for="sem">Email</label><input id="sem" type="email" autocomplete="email" placeholder="you@example.com" required></div>
<div class="field"><label for="spw">Password</label><input id="spw" type="password" autocomplete="new-password" placeholder="At least 6 characters" minlength="6" required></div>
<button class="cta full" type="submit">Create Account</button>
</form>
<div class="divider"><span>or continue with</span></div>
<button class="gbtn" data-act="gmail">${GICON}Continue with Gmail</button>
<p class="switchline">Already have an account? <button data-act="golog">Log in</button></p>
<p class="proto2">MINIMUM VIABLE PROTOTYPE · No real account is created</p>
</section>`;

const ONB = [
  { ic: 'search', t: 'Search Anything', d: 'Type any product name and PriceWise instantly matches it across every major platform.' },
  { ic: 'trend', t: 'Compare Prices Live', d: 'See side-by-side prices, delivery times and offers, sorted exactly the way you like.' },
  { ic: 'heart', t: 'Save & Get Alerts', d: 'Wishlist the products you want and set a target price, we will nudge you the moment it drops.' },
  { ic: 'spark', t: 'Ask the AI Assistant', d: 'Not sure what to buy? Describe your need and budget, and get instant, ranked picks.' }
];
V.onboard = () => {
  const i = Math.min(ui.onbStep || 0, ONB.length - 1), s = ONB[i], last = i === ONB.length - 1;
  return `<section class="onb mesh-cool">
<div class="onb-top"><span class="onb-count">${i + 1} / ${ONB.length}</span><button class="lnk light" data-act="onbskip">Skip</button></div>
<div class="onb-body"><div class="onb-ic">${ic(s.ic, 38)}</div><h1>${s.t}</h1><p>${s.d}</p></div>
<div class="onb-dots">${ONB.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
<button class="cta gold full" data-act="${last ? 'onbdone' : 'onbnext'}">${last ? 'Start Exploring' : 'Next'}</button>
</section>`;
};

const suggHtml = () => {
  const q = ui.q.trim();
  if (!q) return '';
  const rs = search(q).slice(0, 4);
  return `<div class="sugg" role="listbox" aria-label="Suggestions">${rs.length ? rs.map(p => `<button class="srow" data-act="open" data-pid="${p.id}">${img(p, 36)}<span class="grow">${esc(p.name)}</span><b>${inr(bestOf(p).price)}</b></button>`).join('') : `<p class="mute pad-s">No quick matches. Press search to see all results.</p>`}</div>`;
};
V.home = () => {
  const un = unread(), ad = S.addr;
  return `<header class="hg home mesh-cool"><div class="hp-row"><div><h1>Find Your Best Deal</h1><p>Compare prices instantly</p></div><div class="grow"></div>
<button class="ib on-strong" data-act="notifs" aria-label="Notifications${un ? ', ' + un + ' unread' : ''}">${ic('bell', 20)}${un ? '<i class="pip"></i>' : ''}</button>
<button class="ib on-strong" data-act="tab" data-t="ai" aria-label="AI assistant">${ic('spark', 20)}</button></div></header>
<div class="scroll pad"><button class="locbar" data-act="loc" aria-label="Change delivery location">${ic('pin', 15)}<span><b>${esc(ad.label)}</b> · ${esc(ad.line)}, ${esc(ad.city)} ${esc(ad.pin)}</span>${ic('down', 14)}</button>
<section class="searchcard">
<form id="sform" class="sbar light" role="search">${ic('search', 18)}<input id="q" type="search" placeholder="Search any product…" autocomplete="off" value="${esc(ui.q)}" aria-label="Search products"><button class="sgo" aria-label="Search">${ic('right', 18)}</button></form>
<button class="try light" data-act="try">Try: “boAt 141 Airdopes”</button></section>
<div id="sugg">${suggHtml()}</div>
<h2 class="sh">${ic('trend', 18)} Trending Products</h2>
<div class="bento">${TRENDING.map((id, i) => { const p = byId(id), b = bestOf(p), feat = i === 0; return `<button class="tcard ${feat ? 'feat' : ''}" data-act="open" data-pid="${id}">${img(p, feat ? 128 : 84)}<div class="tcbody">${feat ? `<span class="bd good">${ic('crown', 11)} Top pick</span>` : ''}<b>${esc(p.name.replace(/ \(.*/, '').replace(/ with .*/, ''))}</b><span class="mute">${p.label}</span><span class="tcfoot"><span class="from">From ${inr(b.price)}</span>${brandMark(b.k, 16)}</span></div></button>`; }).join('')}</div>
<div class="sh-row"><h2 class="sh">${ic('clock', 18)} Recent Searches</h2>${S.recent.length ? '<button class="lnk" data-act="clearrecent">Clear</button>' : ''}</div>
${S.recent.length ? `<div class="list">${S.recent.map(r => `<button class="rrow" data-act="rs" data-q="${esc(r)}"><span>${esc(r)}</span>${ic('search', 16)}</button>`).join('')}</div>` : '<p class="mute">Your searches will show up here.</p>'}
<aside class="note">${ic('info', 16)}<span>This is a minimum viable prototype. Prices, offers and delivery times are sample data.</span></aside></div>`;
};

V.select = a => {
  const rs = search(a.q);
  return `${hdrP('Select Your Product', `Search: “${esc(a.q)}”`)}<div class="scroll pad"><p class="cnt">${rs.length ? `We found ${rs.length} matching product${rs.length > 1 ? 's' : ''}` : 'No matching products'}</p>
${rs.map(p => `<button class="prow" data-act="open" data-pid="${p.id}">${img(p, 60)}<div class="grow"><b>${esc(p.name)}</b><span class="mute">${p.label}</span><div class="tags">${p.tags.map(t => `<i>${esc(t)}</i>`).join('')}</div></div>${ic('right', 18)}</button>`).join('')}
${rs.length ? '' : empty('search', `Nothing matched “${esc(a.q)}”`, 'Try a brand or product type, or pick a trending product.', chipsTrending())}</div>`;
};

function cardFeat(l, fast, top) {
  const bs = [`<span class="bd good">${ic('crown', 12)} Best price</span>`, l === fast ? `<span class="bd">${ic('zap', 12)} Fastest</span>` : '', l === top ? `<span class="bd">${ic('star', 12)} Top rated</span>` : '', l.inStock ? '' : `<span class="bd bad">${ic('x', 12)} Out of stock</span>`].join('');
  return `<article class="lc best feat ${l.inStock ? '' : 'oos'}" aria-label="${l.pl.name}, ${inr(l.price)}, best price${l.inStock ? '' : ', out of stock at your pincode'}">
<div class="lc-top"><div class="plat">${monoOf(l)}<b>${l.pl.name}</b></div><button class="buy" data-act="buy" data-k="${l.k}" aria-label="Buy on ${l.pl.name}" ${l.inStock ? '' : 'disabled aria-disabled="true"'}>${l.inStock ? 'Buy' : 'Notify me'}</button></div>
<div class="price"><b>${inr(l.price)}</b><s>${inr(l.mrp)}</s>${bs}</div>
<div class="facts"><span>${ic('clock', 14)} Delivery: ${l.inStock ? l.etaTxt : 'Not available at your pincode'}</span><span>${ic('shield', 14)} ${l.ret} days return</span></div>
<div class="facts"><span class="star">${ic('star', 13)} ${l.rating}</span><span class="mute">(${l.rc.toLocaleString('en-IN')})</span></div>
<div class="offs">${offerRows(l)}</div></article>`;
}
function cardCompact(l, fast, top) {
  const bs = [l === fast ? `<span class="bd">${ic('zap', 10)} Fastest</span>` : '', l === top ? `<span class="bd">${ic('star', 10)} Top rated</span>` : '', l.inStock ? '' : `<span class="bd bad">${ic('x', 10)} Out of stock</span>`].join('');
  const top2 = l.offers.slice(0, 2), rest = l.offers.length - top2.length;
  return `<article class="lc compact ${l.inStock ? '' : 'oos'}" style="--c:${l.pl.col}" aria-label="${l.pl.name}, ${inr(l.price)}${l.inStock ? '' : ', out of stock at your pincode'}">
<div class="lc-top">${monoOf(l)}<button class="buy sm" data-act="buy" data-k="${l.k}" aria-label="Buy on ${l.pl.name}" ${l.inStock ? '' : 'disabled aria-disabled="true"'}>${l.inStock ? 'Buy' : 'Notify'}</button></div>
<b class="cplat">${l.pl.name}</b>
<div class="price"><b>${inr(l.price)}</b></div>
${bs ? `<div class="bdrow">${bs}</div>` : ''}
<div class="facts sm"><span>${ic('clock', 12)} ${l.inStock ? l.etaTxt : 'Unavailable'}</span><span class="star">${ic('star', 11)} ${l.rating}</span></div>
<div class="offs sm">${top2.map(o => `<div class="off ${o.t} sm">${ic(OI[o.t], 11)}<span>${esc(o.x)}</span></div>`).join('')}${rest > 0 ? `<span class="more">+${rest} more offer${rest > 1 ? 's' : ''}</span>` : ''}</div>
</article>`;
}
function tableHtml(rs, best) {
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Platform</th><th scope="col">Price</th><th scope="col">Delivery</th><th scope="col">Return</th><th scope="col">Rating</th><th scope="col"><span class="sr">Buy</span></th></tr></thead><tbody>
${rs.map(l => `<tr class="${l === best ? 'best' : ''} ${l.inStock ? '' : 'oos'}"><th scope="row"><span class="tplat">${brandMark(l.k, 20)}${l.pl.name}</span>${l === best ? `<span class="bd good">Best</span>` : ''}${l.inStock ? '' : `<span class="bd bad">${ic('x', 10)} Out of stock</span>`}</th><td><b>${inr(l.price)}</b></td><td>${l.inStock ? l.etaTxt : '—'}</td><td>${l.ret}d</td><td>${l.rating}</td><td><button class="buy sm" data-act="buy" data-k="${l.k}" aria-label="Buy on ${l.pl.name}" ${l.inStock ? '' : 'disabled aria-disabled="true"'}>${l.inStock ? 'Buy' : 'Notify'}</button></td></tr>`).join('')}</tbody></table></div>`;
}
V.compare = a => {
  const p = byId(a.pid), f = ui.f, L = listings(p), rs0 = applyF(L, f), n = activeF(f), liked = S.wish.includes(p.id);
  const rs = [...rs0].sort((x, y) => (x.inStock === y.inStock) ? 0 : x.inStock ? -1 : 1);
  const right = `<button class="ib" data-act="wish" data-pid="${p.id}" aria-pressed="${liked}" aria-label="${liked ? 'Remove from wishlist' : 'Save to wishlist'}">${ic('heart', 21)}</button><button class="ib" data-act="track" aria-label="Price tracking">${ic('trend', 21)}</button><button class="ib" data-act="filters" aria-label="Filters and sorting${n ? ', ' + n + ' active' : ''}">${ic('sliders', 21)}${n ? `<i class="pip num">${n}</i>` : ''}</button>`;
  const pin = S.addr.pin, avail = L.filter(l => l.inStock).length, skippedQuick = !quickOk(pin) ? QUICK.filter(k => PRE[p.pre][k] != null).length : 0;
  const locNote = `${ic('pin', 13)} <span>${avail} of ${L.length} platforms deliver to <b>${esc(pin)}</b>${skippedQuick ? ` · quick-commerce not serviceable here` : ''}</span>`;
  let body = '';
  if (rs.length) {
    const avPool = rs.filter(l => l.inStock), pool = avPool.length ? avPool : rs;
    const best = pool.reduce((x, y) => (y.price < x.price ? y : x)), hi = Math.max(...L.map(x => x.price));
    const next = pool.filter(x => x !== best).sort((x, y) => x.price - y.price)[0];
    const fast = [...pool].sort((x, y) => x.eta - y.eta)[0], top = [...pool].sort((x, y) => y.rating - x.rating)[0];
    const sm = summary(p), bh = history(p, best), bspark = sparkline([bh[0], bh[7], bh[14], bh[21], bh[29]], 108, 30, 'rgba(255,255,255,.9)');
    body = `<section class="banner mesh-cool"><div class="row1"><div class="seal">${ic('crown', 17)}</div><div class="grow"><span class="bt">Best deal found</span><div class="bp">${inr(best.price)}</div><p>Cheapest on ${best.pl.name}${next ? ` · ${inr(next.price - best.price)} below ${next.pl.name}` : ''}</p></div>${bspark}</div>${ldr('You save vs. priciest listing', inr(hi - best.price), 'inv')}<button class="cta gold full" data-act="buy" data-k="${best.k}">Buy Now on ${best.pl.name}</button></section>
<details class="smart" open><summary>${ic('spark', 16)}<span>Smart Summary</span><span class="verdict ${sm.buy ? 'good' : 'warn'}">${sm.buy ? 'Good time to buy' : 'Consider waiting'}</span></summary><ul>${sm.lines.map(t => `<li>${esc(t)}</li>`).join('')}</ul>${sm.buy ? '' : `<button class="lnk" data-act="track">Set a price alert ${ic('right', 14)}</button>`}<small>Generated from this comparison and the 30-day price history.</small></details>
<div class="sec"><h2>All Platforms (${rs.length})</h2><div class="seg" role="group" aria-label="Layout"><button data-act="view" data-v="cards" aria-pressed="${ui.view === 'cards'}">${ic('cards', 15)} Cards</button><button data-act="view" data-v="table" aria-pressed="${ui.view === 'table'}">${ic('table', 15)} Table</button></div></div>
${ui.view === 'cards' ? `<div class="bento">${cardFeat(best, fast, top)}${rs.filter(l => l !== best).map(l => cardCompact(l, fast, top)).join('')}</div>` : tableHtml(rs, best)}`;
  } else body = empty('sliders', 'No platform matches your filters', 'Loosen a filter to see prices again.', '<button class="cta sm" data-act="freset">Reset filters</button>');
  return `<header class="hp cmp"><div class="hp-row">${backBtn}<div class="grow"></div>${right}</div><div class="pinfo">${img(p, 66)}<div><h1>${esc(p.name)}</h1><p>${p.tags.map(esc).join(' | ')}</p><span class="rt">${ic('star', 13)} ${p.r} · ${p.rv} reviews</span></div></div>
<div class="sortline">Sorted by: <span class="pill">${SORTL[f.sort]}</span>${n ? `<span class="pill f">${n} filter${n > 1 ? 's' : ''} on</span>` : ''}</div>
<button class="locline" data-act="loc" aria-label="Change delivery location">${locNote}${ic('right', 13)}</button></header>
<div class="scroll pad">${body}<aside class="note">${ic('info', 16)}<span>Sample data for this prototype. Prices and offers are illustrative.</span></aside></div>`;
};

V.filters = a => {
  const p = byId(a.pid), f = ui.f, L = listings(p), pr = L.map(x => x.price);
  const lo = Math.floor(Math.min(...pr) * .9 / 100) * 100, hi = Math.ceil(Math.max(...pr) / 100) * 100, cur = f.max == null ? hi : Math.min(f.max, hi), step = hi > 20000 ? 500 : hi > 5000 ? 100 : 50;
  const opt = (act, key, v, label, icon, on) => `<button class="opt ${on ? 'on' : ''}" data-act="${act}" data-v="${v}" role="radio" aria-checked="${on}">${ic(icon, 17)}<span class="grow">${label}</span><span class="rd" aria-hidden="true"></span></button>`;
  const chk = (k, label, icon, on) => `<label class="chk"><span>${ic(icon, 16)} ${label}</span><input type="checkbox" data-act="ftog" data-k="${k}" ${on ? 'checked' : ''}></label>`;
  return `${hdrP('Filters &amp; Sorting', '', '<button class="lnk" data-act="freset">Reset All</button>')}
<div class="scroll pad gap"><section class="fc"><h2>Sort By</h2><div class="opts" role="radiogroup" aria-label="Sort by">${opt('fsort', 'sort', 'price', SORTL.price, 'tag', f.sort === 'price')}${opt('fsort', 'sort', 'delivery', SORTL.delivery, 'zap', f.sort === 'delivery')}${opt('fsort', 'sort', 'rating', SORTL.rating, 'star', f.sort === 'rating')}${opt('fsort', 'sort', 'discount', SORTL.discount, 'tdown', f.sort === 'discount')}</div></section>
<section class="fc"><h2>Maximum Price</h2><input id="fmax" type="range" min="${lo}" max="${hi}" step="${step}" value="${cur}" aria-label="Maximum price"><div class="rng"><span>${inr(lo)}</span><b id="fmaxv">${f.max == null ? 'No limit' : inr(cur)}</b><span>${inr(hi)}</span></div></section>
<section class="fc"><h2>Minimum Rating</h2><div class="pills">${[3, 3.5, 4, 4.5].map(r => `<button class="pl ${f.minR === r ? 'on' : ''}" data-act="frate" data-v="${r}" aria-pressed="${f.minR === r}">${r}+</button>`).join('')}</div></section>
<section class="fc"><h2>Delivery Speed</h2><div class="opts" role="radiogroup" aria-label="Delivery speed">${['instant', 'same', 'next', 'any'].map(s => opt('fspeed', 'speed', s, SPEEDL[s], s === 'instant' ? 'zap' : s === 'same' ? 'box' : s === 'next' ? 'truck' : 'clock', f.speed === s)).join('')}</div></section>
<section class="fc"><h2>Additional Filters</h2>${chk('cash', 'Has Cashback', 'wallet', f.cash)}${chk('card', 'Has Card Offer', 'card', f.card)}${chk('coupon', 'Has Coupon Code', 'ticket', f.coupon)}</section>
<section class="fc"><h2>Select Platforms</h2><div class="plgrid">${L.map(l => `<label class="pc ${!f.plats || f.plats.includes(l.k) ? 'on' : ''}"><span>${l.pl.name}</span><input type="checkbox" data-act="fplat" data-k="${l.k}" ${!f.plats || f.plats.includes(l.k) ? 'checked' : ''}></label>`).join('')}</div></section></div>
<div class="foot"><button class="cta full" data-act="back">Apply Filters${activeF(f) ? ` (${applyF(L, f).length} of ${L.length} platforms)` : ''}</button></div>`;
};

/* ----- price tracking + chart ----- */
const niceStep = x => { const m = Math.pow(10, Math.floor(Math.log10(x))), r = x / m; return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * m; };
const marker = (s, x, y, c) => {
  const o = s === 'co' || s === 'so', fill = o ? 'var(--card)' : c, st = `fill="${fill}" stroke="${c}" stroke-width="2"`;
  if (s === 'c' || s === 'co') return `<circle cx="${x}" cy="${y}" r="4" ${st}/>`;
  if (s === 's' || s === 'so') return `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" ${st}/>`;
  if (s === 't') return `<path d="M${x} ${y - 5}L${x + 5} ${y + 4}H${x - 5}z" ${st}/>`;
  return `<path d="M${x} ${y - 5}L${x + 5} ${y}L${x} ${y + 5}L${x - 5} ${y}z" ${st}/>`;
};
const legendSample = l => `${brandMark(l.k, 16)}<svg width="18" height="10" viewBox="0 0 18 10" aria-hidden="true"><path d="M1 5H17" stroke="${l.pl.col}" stroke-width="2" stroke-dasharray="${l.pl.dash}" fill="none"/></svg>`;
function chartHtml(H) {
  const W = 340, HT = 214, ml = 46, mr = 16, mt = 12, mb = 28, vis = H.filter(x => !ui.off[x.l.k]);
  const all = (vis.length ? vis : H).flatMap(x => x.h), mn = Math.min(...all), mx = Math.max(...all);
  const step = niceStep(((mx - mn) || mx * .1) / 4), y0 = Math.floor(mn / step) * step, y1 = Math.ceil(mx / step) * step || step;
  const X = i => ml + i * (W - ml - mr) / 29, Y = v => mt + (1 - (v - y0) / (y1 - y0)) * (HT - mt - mb);
  const dates = Array.from({ length: 30 }, (_, i) => Date.now() - (29 - i) * DAY);
  ui.cd = { W, ml, mr, mt, HT, mb, H: vis, dates, X, Y };
  let g = '';
  for (let v = y0; v <= y1 + 1e-6; v += step) g += `<line x1="${ml}" x2="${W - mr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"/><text x="${ml - 6}" y="${Y(v) + 3.5}" text-anchor="end" font-size="10" font-family="Manrope,sans-serif" fill="var(--ink2)">${short(Math.round(v * 100) / 100)}</text>`;
  [0, 7, 14, 21, 29].forEach(i => { g += `<text x="${X(i)}" y="${HT - 8}" text-anchor="${i === 29 ? 'end' : i === 0 ? 'start' : 'middle'}" font-size="10" font-family="Manrope,sans-serif" fill="var(--ink2)">${new Date(dates[i]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</text>`; });
  vis.forEach(({ l, h }) => {
    g += `<path d="${h.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('')}" fill="none" stroke="${l.pl.col}" stroke-width="2.2" stroke-dasharray="${l.pl.dash}" stroke-linejoin="round" stroke-linecap="round"/>`;
  });
  vis.forEach(({ l, h }) => { g += marker(l.pl.shape, X(29), Y(h[29]), l.pl.col); });
  return `<div class="chart"><svg id="chart" class="cwipe" viewBox="0 0 ${W} ${HT}" role="img" aria-label="Price history for the last 30 days, one line per platform">${g}<line id="xh" x1="0" x2="0" y1="${mt}" y2="${HT - mb}" stroke="var(--ink2)" stroke-width="1" stroke-dasharray="3 3" opacity="0"/><g id="dots"></g><rect id="hit" x="${ml}" y="0" width="${W - ml - mr}" height="${HT}" fill="transparent"/></svg><div id="tip" class="tip" hidden></div></div>`;
}
V.tracking = a => {
  const p = byId(a.pid), L = listings(p).sort((x, y) => x.price - y.price), H = L.map(l => ({ l, h: history(p, l) })), best = L[0], al = S.alerts.find(x => x.pid === p.id);
  const def = al ? al.target : Math.round(best.price * .92 / 10) * 10, sb = stats(H[0].h);
  const days = H[0].h.map((_, i) => H.reduce((m, x) => (x.h[i] < m.v ? { v: x.h[i], k: x.l.k } : m), { v: 1e12, k: '' }).k);
  const cheapDays = days.filter(k => k === best.k).length, above = (best.price - sb.min) / sb.min;
  const tr = { Decreasing: ['tdown', 'good'], Increasing: ['trend', 'bad'], Stable: ['dot', 'mute'] };
  return `${hdrP('Price Tracking', esc(p.name))}<div class="scroll pad gap">
<form id="aform" class="alertc mesh-ai" data-pid="${p.id}"><div class="ah"><div><b>Set Price Alert</b><p>Get notified when the best price drops below your target</p></div>${ic('bell', 22)}</div>
<label class="sr" for="tgt">Target price in rupees</label><div class="arow"><span class="rs">₹</span><input id="tgt" type="number" inputmode="numeric" min="1" value="${def}"><button class="cta white sm" type="submit">${al ? 'Update Alert' : 'Set Alert'}</button></div>
<p class="ahint">Best price now: <b>${inr(best.price)}</b> on ${best.pl.name}</p>${al ? `<button type="button" class="lnk light" data-act="delalert" data-pid="${p.id}">Remove alert at ${inr(al.target)}</button>` : ''}</form>
<section class="cc"><h2>Price History (Last 30 Days)</h2>${chartHtml(H)}<p class="hint">Touch or hover the chart to compare prices on any day.</p>
<div class="legend">${L.map(l => `<button class="lg" data-act="lg" data-k="${l.k}" aria-pressed="${!ui.off[l.k]}">${legendSample(l)}${l.pl.name}</button>`).join('')}</div></section>
<h2 class="sh">Platform Statistics</h2>
${H.map(({ l, h }) => { const s = stats(h), t = tr[s.trend]; return `<section class="ps"><div class="ph"><b>${l.pl.name}</b><span class="trend ${t[1]}">${ic(t[0], 14)} ${s.trend}</span></div><div class="g4"><div class="t cur"><span>Current Price</span><b>${inr(s.cur)}</b></div><div class="t low"><span>Lowest Price</span><b>${inr(s.min)}</b></div><div class="t high"><span>Highest Price</span><b>${inr(s.max)}</b></div><div class="t avg"><span>Average Price</span><b>${inr(s.avg)}</b></div></div></section>`; }).join('')}
<section class="ins"><h2>${ic('spark', 16)} Insights</h2><ul>
<li>${ic('check', 15)}<span>${sb.ch <= 0 ? `Prices have dropped by ${Math.round(-sb.ch * 100)}% in the last 30 days` : `Prices have risen by ${Math.round(sb.ch * 100)}% in the last 30 days`}</span></li>
<li>${ic('check', 15)}<span>${best.pl.name} has been the cheapest on ${cheapDays} of the last 30 days</span></li>
<li>${ic('check', 15)}<span>${above <= .02 ? 'Good time to buy: prices are near their 30-day low' : `Prices are ${Math.round(above * 100)}% above the 30-day low. An alert can catch the next dip`}</span></li></ul></section></div>`;
};

V.confirm = a => {
  const p = byId(a.pid), L = listings(p), l = L.find(x => x.k === a.k), ch = L.reduce((x, y) => (y.price < x.price ? y : x)), isBest = ch.k === l.k, hi = Math.max(...L.map(x => x.price)), sv = hi - l.price;
  const trust = [['shield', 'You pay the retailer', `Checkout happens on ${l.pl.name}`], ['lock', 'No card details here', 'PriceWise never sees your payment info'], ['award', 'Return window', `${l.ret} days, as listed by the retailer`], ['check', 'Price checked', 'Sample data in this prototype']];
  return `<div class="scroll"><section class="okhead ${isBest ? 'mesh-cool' : 'alt mesh-warm'}"><button class="ib on-strong" data-act="back" aria-label="Back">${ic('left', 22)}</button><div class="okc">${ic('check', 28)}</div><h1>${isBest ? 'Great Choice!' : 'Good pick'}</h1><p>${isBest ? "You're getting the best price available" : `${ch.pl.name} is ${inr(l.price - ch.price)} cheaper`}</p>${isBest ? '' : `<button class="cta white sm" data-act="swap" data-k="${ch.k}">Switch to ${ch.pl.name}</button>`}</section>
<div class="pad gap"><section class="sumc"><div class="pinfo">${img(p, 56)}<div><b>${esc(p.name)}</b><p>${p.tags.map(esc).join(' | ')}</p></div></div>
<dl class="dl"><div><dt>Platform</dt><dd class="ddplat">${brandMark(l.k, 18)}${l.pl.name}</dd></div><div><dt>Price</dt><dd>${inr(l.price)} <s>${inr(l.mrp)}</s></dd></div>${sv > 0 ? `<div class="sv"><dt>You save vs. priciest listing</dt><dd>${inr(sv)} (${Math.round(sv / hi * 100)}%)</dd></div>` : ''}<div><dt>Delivery</dt><dd>${l.etaTxt}</dd></div><div><dt>Return Policy</dt><dd>${l.ret} days</dd></div></dl></section>
<h2 class="sh">Why Shop with Confidence</h2><div class="tg">${trust.map(t => `<div class="tc">${ic(t[0], 18)}<b>${t[1]}</b><span>${t[2]}</span></div>`).join('')}</div>
${l.disc ? `<div class="spec mesh-warm"><span>Special Offer</span><b>${l.disc}% off MRP</b></div>` : ''}
<aside class="note info">${ic('info', 16)}<span>You'll be redirected to ${l.pl.name}'s official website to complete your purchase. PriceWise is a comparison platform and does not process payments directly.</span></aside>
<button class="cta full" data-act="go" data-k="${l.k}">Continue to ${l.pl.name} ${ic('ext', 16)}</button></div></div>`;
};

V.wish = () => {
  const items = S.wish.map(byId).filter(Boolean);
  return `${hdrG('Wishlist', `${items.length} saved · ${S.alerts.length} price alerts`, '', '', true)}<div class="scroll pad">
${items.length ? items.map(p => { const b = bestOf(p), st = stats(history(p, b)), al = S.alerts.find(x => x.pid === p.id); return `<article class="wrow"><button class="wmain" data-act="open" data-pid="${p.id}">${img(p, 58)}<div class="grow"><b>${esc(p.name)}</b><span class="mute best-on">Best on ${brandMark(b.k, 15)}${b.pl.name}</span><div class="wp"><strong>${inr(b.price)}</strong><span class="trend ${st.ch < -.02 ? 'good' : st.ch > .02 ? 'bad' : 'mute'}">${ic(st.ch < -.02 ? 'tdown' : st.ch > .02 ? 'trend' : 'dot', 13)} ${st.ch < 0 ? '' : '+'}${(st.ch * 100).toFixed(0)}% / 30d</span></div></div></button>
<div class="wact">${al ? `<span class="bd">${ic('bell', 12)} ${inr(al.target)}</span>` : `<button class="lnk" data-act="track" data-pid="${p.id}">Set alert</button>`}<button class="ib" data-act="wish" data-pid="${p.id}" aria-pressed="true" aria-label="Remove ${esc(p.name)} from wishlist">${ic('heart', 20)}</button></div></article>`; }).join('') : empty('heart', 'Nothing saved yet', 'Tap the heart on any product to keep an eye on its price.', chipsTrending())}
<button class="mrow big" data-act="alerts"><span class="mi">${ic('bell', 18)}</span><span class="grow">Price Alerts</span><i class="badge">${S.alerts.length}</i>${ic('right', 16)}</button></div>`;
};

V.alerts = () => `${hdrG('Price Alerts', `${S.alerts.length} active alert${S.alerts.length === 1 ? '' : 's'}`, `<button class="ib on-strong" data-act="newalert" aria-label="Add price alert">${ic('plus', 22)}</button>`, 'amber')}<div class="scroll pad">
${S.alerts.length ? S.alerts.map(al => { const p = byId(al.pid), b = bestOf(p), hit = b.price <= al.target; return `<article class="acard ${hit ? 'hit' : ''}"><button class="amain" data-act="open" data-pid="${p.id}">${img(p, 52)}<div class="grow"><b>${esc(p.name)}</b><span class="mute best-on">Best on ${brandMark(b.k, 15)}${b.pl.name}</span><div class="ap">${ldr('Current Price', inr(b.price))}${ldr('Target Price', `<span class="tv">${inr(al.target)}</span>`)}</div></div></button>
<button class="ib" data-act="delalert" data-pid="${p.id}" aria-label="Delete alert for ${esc(p.name)}">${ic('trash', 18)}</button>
<div class="afoot">${hit ? `<span class="bd good">${ic('check', 12)} Target reached</span>` : `<span class="mute">${inr(b.price - al.target)} to go</span><button class="lnk" data-act="sim" data-pid="${p.id}">Demo: simulate a price drop</button>`}</div></article>`; }).join('') : empty('bell', 'No alerts yet', 'Add one and PriceWise will tell you when a price drops below your target.', '<button class="cta sm" data-act="newalert">Add an alert</button>')}</div>`;

const stat = (icon, tone, big, label, act, d = '') => `<button class="btile ${tone}" data-act="${act}" ${d}><span class="mi ${tone}">${ic(icon, 17)}</span><b class="num">${big}</b><span>${label}</span></button>`;
V.profile = () => {
  const tot = S.hist.reduce((s, h) => s + h.saved, 0), avgOff = S.hist.length ? Math.round(S.hist.reduce((s, h) => { const L = listings(byId(h.pid)), hi = Math.max(...L.map(x => x.price)); return s + h.saved / hi; }, 0) / S.hist.length * 100) : 0;
  const seq = [...S.hist].sort((a, b) => a.ts - b.ts).reduce((acc, h) => { acc.push((acc[acc.length - 1] || 0) + h.saved); return acc; }, [0]);
  const savSpark = sparkline(seq.length > 1 ? seq : [0, tot || 1], 160, 40, 'rgba(255,255,255,.85)');
  return `<header class="hg prof mesh-cool"><div class="pav">${ic('user', 26)}</div><div><h1>Guest User</h1><p>guest@pricewise.example</p></div></header><div class="scroll pad gap">
<section class="sav mesh-cool"><span>Total Savings</span><b>${inr(tot)}</b>${savSpark}<p>Saved across ${S.hist.length} purchase${S.hist.length === 1 ? '' : 's'}, vs. the priciest listing</p></section>
<div class="bento2">${stat('heart', 'violet', S.wish.length, 'Wishlist', 'tab', 'data-t="wish"')}${stat('bell', 'blue', S.alerts.length, 'Price Alerts', 'alerts')}${stat('history', 'green', S.hist.length, 'Purchases', 'hist')}${stat('tag', 'amber', avgOff + '%', 'Avg. saved', 'hist')}</div>
<div class="list">${row('gear', 'Settings', 'settings')}${row('help', 'Help &amp; Support', 'help')}</div></div>`;
};
V.hist = () => `${hdrP('Purchase History', `${S.hist.length} purchase${S.hist.length === 1 ? '' : 's'}`)}<div class="scroll pad">
${S.hist.length ? S.hist.map((h, i) => { const p = byId(h.pid); return `<article class="hcard"><div class="hm">${img(p, 52)}<div class="grow"><b>${esc(p.name)}</b><span class="mute best-on">${brandMark(h.k, 15)}${PL[h.k].name}</span><span class="ok">${ic('check', 13)} Purchased</span></div><div class="hr"><b>${inr(h.price)}</b><span class="sv">Saved ${inr(h.saved)}</span></div></div><div class="hf"><span class="mute">${fdate(h.ts)}</span><button class="lnk" data-act="hdet" data-i="${i}">View Details</button></div></article>`; }).join('') : empty('history', 'No purchases yet', 'When you finish a purchase from a comparison, it shows up here.')}</div>`;

V.notifs = () => `${hdrP('Notifications', '', S.notifs.some(n => !n.read) ? '<button class="lnk" data-act="readall">Mark all read</button>' : '')}<div class="scroll pad">
${S.notifs.map(n => `<button class="ncard ${n.read ? '' : 'new'}" data-act="nopen" data-id="${n.id}"><span class="ni ${n.type}">${ic(n.type === 'drop' ? 'tdown' : n.type === 'fast' ? 'box' : 'spark', 16)}</span><div class="grow"><b>${n.title}</b><span>${esc(n.body)}</span><small class="mute">${ago(n.ts)}</small></div>${n.read ? '' : '<i class="dotn" aria-label="Unread"></i>'}</button>`).join('')}</div>`;

V.settings = () => `${hdrG('Settings', '')}<div class="scroll pad gap"><h3 class="cap">Preferences</h3><div class="bento2">${gtile('bell', 'blue', 'Notifications', 'notifs', '', 'Drops & recs', unread())}${gtile('eye', 'violet', 'Accessibility', 'access', '', 'Colour & text')}</div>
<h3 class="cap">Account &amp; Support</h3><div class="bento2">${gtile('shield', 'green', 'Privacy &amp; Security', 'privacy', '', 'What we store')}${gtile('help', 'pink', 'Help &amp; Support', 'help', '', 'FAQs & contact')}${gtile('info', 'amber', 'About', 'about', '', 'Version & scope')}</div>
<button class="mrow danger" data-act="logout"><span class="mi">${ic('logout', 18)}</span><span class="grow">Log Out</span></button><p class="ver">Version 3.0.0 · Prototype</p></div>`;

V.access = () => {
  const a = S.a11y, cbs = [['normal', 'Normal Vision', 'Standard color display'], ['prot', 'Protanopia', 'Red-green color blindness (red weak)'], ['deut', 'Deuteranopia', 'Red-green color blindness (green weak)'], ['trit', 'Tritanopia', 'Blue-yellow color blindness'], ['mono', 'Monochromacy', 'Complete color blindness']];
  return `${hdrP('Accessibility Settings', 'Customize your viewing experience')}<div class="scroll pad gap">
<section class="fc"><div class="ah2"><span class="mi">${ic('eye', 18)}</span><div><h2>Color Blind Mode</h2><span class="mute">Preview PriceWise through each vision type</span></div></div><div class="opts" role="radiogroup" aria-label="Color blind mode">${cbs.map(c => `<button class="opt two ${a.cb === c[0] ? 'on' : ''}" data-act="cb" data-v="${c[0]}" role="radio" aria-checked="${a.cb === c[0]}"><span class="grow"><b>${c[1]}</b><small>${c[2]}</small></span><span class="rd" aria-hidden="true"></span></button>`).join('')}</div>
<div class="prev"><span>Color Preview</span><div><i style="background:#D6007F"></i><i style="background:#2F7A45"></i><i style="background:#0E6B78"></i><i style="background:#D97A0A"></i><i style="background:#6A2FA6"></i></div></div></section>
<section class="fc"><div class="ah2"><span class="mi">${ic('type', 18)}</span><div><h2>Font Size</h2><span class="mute">Adjust text size for better readability</span></div></div><div class="opts" role="radiogroup" aria-label="Font size">${[['s', 'Small'], ['m', 'Medium'], ['l', 'Large']].map(f => `<button class="opt ${a.fs === f[0] ? 'on' : ''}" data-act="fs" data-v="${f[0]}" role="radio" aria-checked="${a.fs === f[0]}"><span class="grow">${f[1]} - The quick brown fox jumps</span><span class="rd" aria-hidden="true"></span></button>`).join('')}</div></section>
<section class="fc">${toggle('hc', a.hc, 'High Contrast Mode', 'Increase contrast for better visibility')}</section>
<aside class="note info">${ic('info', 16)}<span>These settings are applied immediately and remembered on this device.</span></aside></div>`;
};
V.privacy = () => `${hdrP('Privacy &amp; Security', 'You control what is stored')}<div class="scroll pad gap"><section class="fc">${toggle('push', S.prefs.push, 'Price-drop notifications', 'Alerts when a target price is reached')}${toggle('email', S.prefs.email, 'Weekly deals email', 'A summary of your wishlist prices')}${toggle('analytics', S.prefs.analytics, 'Share anonymous usage data', 'Helps improve PriceWise')}</section>
<aside class="note info">${ic('lock', 16)}<span>PriceWise never handles payments. You always pay on the retailer's own site.</span></aside>
<div class="list"><button class="mrow" data-act="clearrecent"><span class="mi">${ic('clock', 18)}</span><span class="grow">Clear search history</span></button><button class="mrow" data-act="reset"><span class="mi">${ic('history', 18)}</span><span class="grow">Reset prototype data</span></button></div></div>`;
V.help = () => {
  const faq = [['How does PriceWise work?', 'You search a product, pick the exact model, and PriceWise lines up its price, delivery time, returns and offers across shopping and quick-commerce apps. You then buy on the retailer’s own site.'], ['Are the prices accurate?', 'In this prototype every price is sample data. A live version would refresh prices from retailer sources and show when they were last checked.'], ['How do I set price alerts?', 'Open any product and tap the trend icon, then enter a target price. You can manage all alerts from Profile.'], ['Is my data secure?', 'PriceWise never sees your card or bank details because purchases happen on the retailer’s site. Your saved lists live only on this device in the prototype.']];
  return `${hdrG('Help &amp; Support', "We're here to help you")}<div class="scroll pad gap"><h3 class="cap">Contact Us</h3><div class="bento2">
${gtile('chat', 'blue', 'Live Chat', 'tab', 'data-t="ai"', 'Ask the AI assistant')}
${gtile('mail', 'violet', 'Email Support', 'toast', 'data-m="Prototype: this would open your mail app"', 'support@pricewise.example')}
${gtile('phone', 'green', 'Phone Support', 'toast', 'data-m="Prototype: this would start a call"', '1800-000-0000 (sample)')}
</div>
<h3 class="cap">Frequently Asked Questions</h3><div class="list faq">${faq.map(f => `<details><summary>${f[0]}${ic('down', 16)}</summary><p>${f[1]}</p></details>`).join('')}</div></div>`;
};
V.about = () => `${hdrP('About', 'PriceWise 2.0.0 · Prototype')}<div class="scroll pad gap"><section class="fc"><h2>What this is</h2><p class="body">A minimum viable prototype of PriceWise, a price-comparison app that lines up shopping and quick-commerce prices in one place. It comes from the UI/UX case study “The Illusion of Best Deals”.</p></section>
<section class="fc"><h2>What is real, what is sample</h2><ul class="bl"><li>Navigation, search, filters, sorting, alerts, wishlist, accessibility modes and the assistant all work.</li><li>Prices, offers, ratings and 30-day histories are generated sample data.</li><li>The assistant answers from the sample catalogue using rules, not a live AI model.</li><li>Your wishlist, alerts and settings are saved on this device only.</li></ul></section></div>`;

V.ai = () => `${hdrG('AI Shopping Assistant', 'Answers from the sample catalogue', '', 'ai', true)}<div class="scroll chat" id="chat" aria-live="polite">
${ui.chat.map(m => m.who === 'me' ? `<div class="bub me">${esc(m.t)}</div>` : `<div class="bub bot"><span class="who">${ic('spark', 13)} AI Assistant</span><p>${esc(m.t).replace(/\n/g, '<br>')}</p>${(m.ps || []).map(id => { const p = byId(id), b = bestOf(p); return `<button class="pmini" data-act="open" data-pid="${id}">${img(p, 40)}<span class="grow"><b>${esc(p.name.replace(/ \(.*/, ''))}</b><small>${esc(p.pitch)}</small></span><strong>${inr(b.price)}</strong></button>`; }).join('')}${(m.acts || []).map(x => `<button class="chip" data-act="${x.act}" data-pid="${x.pid}">${x.l}</button>`).join('')}</div>`).join('')}
${ui.typing ? '<div class="bub bot typing" aria-label="Assistant is typing"><i></i><i></i><i></i></div>' : ''}
${ui.chat.length <= 1 ? `<div class="qs"><p class="mute">Quick suggestions:</p>${['Best wireless earbuds under ₹2000', 'Latest smartphones with good camera', 'Fitness tracker recommendations', 'Budget laptop for students', 'Compare iPhone 15 Pro and Galaxy S24'].map(q => `<button class="qrow" data-act="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>` : ''}</div>
<form id="cform" class="cbar"><label class="sr" for="cq">Message</label><input id="cq" type="text" placeholder="Ask me anything about products…" autocomplete="off"><button class="send" aria-label="Send">${ic('send', 18)}</button></form>`;
