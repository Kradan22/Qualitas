'use strict';

/* ---------- Tárolás ---------- */
const STORE_KEY = 'qualitas.entries.v1';
const CFG_KEY = 'qualitas.cfg.v1';

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch { return []; }
}
function saveEntries(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
function loadCfg() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); }
  catch { return {}; }
}
function saveCfg(cfg) { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }

let entries = loadEntries();

/* ---------- Segédek ---------- */
const $ = (id) => document.getElementById(id);
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function fmtNum(n) {
  return (Math.round(n * 100) / 100).toString().replace('.', ',');
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function fmtDateTime(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ---------- Magyar óra-értelmezés ---------- */
const NUM_WORDS = {
  'nulla':0,'egy':1,'kettő':2,'ket':2,'két':2,'kettu':2,'harom':3,'három':3,'negy':4,'négy':4,
  'öt':5,'ot':5,'hat':6,'hét':7,'het':7,'nyolc':8,'kilenc':9,'tíz':10,'tiz':10,
  'tizenegy':11,'tizenkettő':12,'tizenket':12,'tizenkét':12
};
// Beszélt szövegből próbál órát kinyerni: "2,5", "2.5", "két és fél óra", "másfél óra", "negyed óra"
function parseHours(text) {
  if (!text) return null;
  let s = text.toLowerCase();
  // számjegyes alak (2,5 / 2.5 / 2)
  const digit = s.match(/(\d+([.,]\d+)?)/);
  if (digit) return parseFloat(digit[1].replace(',', '.'));
  let total = 0, found = false;
  if (/másfél|masfel/.test(s)) return 1.5;
  // egész szám szó
  for (const w in NUM_WORDS) {
    const re = new RegExp('\\b' + w + '\\b');
    if (re.test(s)) { total = NUM_WORDS[w]; found = true; break; }
  }
  if (/\bés fél\b|\bes fel\b|\bfél\b|\bfel\b/.test(s)) { total += 0.5; found = true; }
  else if (/negyed/.test(s)) { total += 0.25; found = true; }
  else if (/háromnegyed|haromnegyed/.test(s)) { total += 0.75; found = true; }
  return found ? total : null;
}

// Egy mondatból projekt / idő / tevékenység kinyerése
function parseUtterance(text) {
  const out = { proj: '', hours: '', act: '' };
  if (!text) return out;
  let t = text.trim();

  // Kulcsszavas felbontás, ha van
  const projM = t.match(/projekt[:\s]+(.+?)(?=\s*(idő|ido|óra|ora|tevékenység|tevekenyseg|feladat|,|;|$))/i);
  const actM  = t.match(/(tevékenység|tevekenyseg|feladat)[:\s]+(.+)$/i);

  // Idő: keressünk óra környékén
  const hoursM = t.match(/([\wáéíóöőúüű.,]+(?:\s+(?:és|es)\s+fél|\s+fél)?)\s*ór(a|át|ák)/i)
             || t.match(/(\d+([.,]\d+)?)/);
  let hours = null;
  if (hoursM) hours = parseHours(hoursM[0]);

  if (projM) out.proj = clean(projM[1]);
  if (actM) out.act = clean(actM[2]);
  if (hours != null) out.hours = fmtNum(hours);

  // Ha nem volt kulcsszó, próbáljunk vesszős tagolást: "projekt, idő, tevékenység"
  if (!projM && !actM) {
    const parts = t.split(/[,;]|\bés\b/).map(clean).filter(Boolean);
    if (parts.length >= 1 && out.proj === '') out.proj = parts[0];
    if (parts.length >= 3) out.act = parts.slice(2).join(', ');
    else if (parts.length === 2 && hours == null) out.act = parts[1];
    // az idő-részt vegyük ki a tevékenységből, ha az volt
  }
  // Végső fallback: ha semmi tevékenység, tegyük az egészet oda
  if (!out.act && !projM) {
    const withoutHours = hoursM ? t.replace(hoursM[0], '').trim() : t;
    if (!out.proj) out.proj = clean(withoutHours);
  }
  return out;
}
function clean(s) {
  return (s || '').replace(/\s+/g, ' ')
    .replace(/^(projekt|tevékenység|tevekenyseg|feladat)[:\s]*/i, '')
    .replace(/[.,;\s]+$/, '').trim();
}

/* ---------- Beszédfelismerés ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let speechSupported = !!SR;

function listenOnce(onResult, onEnd, btn) {
  if (!SR) {
    toast('A böngésző nem támogatja a diktálást – koppints a mezőre és használd a billentyűzet mikrofonját.');
    onEnd && onEnd();
    return;
  }
  const rec = new SR();
  rec.lang = 'hu-HU';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  let got = false;
  btn && btn.classList.add('listening');
  rec.onresult = (e) => { got = true; onResult(e.results[0][0].transcript); };
  rec.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed')
      toast('Engedélyezd a mikrofont a böngésző beállításaiban.');
    else if (e.error === 'no-speech') toast('Nem hallottam semmit – próbáld újra.');
  };
  rec.onend = () => { btn && btn.classList.remove('listening'); onEnd && onEnd(got); };
  try { rec.start(); } catch { btn && btn.classList.remove('listening'); }
}

/* ---------- UI események ---------- */
if (!speechSupported) {
  $('speechHint').textContent =
    'Ez a böngésző nem támogatja az automatikus diktálást. Koppints egy mezőre, majd a billentyűzet 🎤 gombjával mondd be – iPhone-on ez mindig működik.';
}

// Nagy „mondj el mindent" gomb
$('dictateAll').addEventListener('click', () => {
  const btn = $('dictateAll');
  $('dictateAllLabel').textContent = 'Beszélj...';
  listenOnce(
    (text) => {
      const p = parseUtterance(text);
      if (p.proj) $('proj').value = p.proj;
      if (p.hours) $('hours').value = p.hours;
      if (p.act) $('act').value = p.act;
      toast('Felismerve – ellenőrizd és mentsd.');
    },
    () => { $('dictateAllLabel').textContent = 'Diktálás – mondj el mindent'; },
    btn
  );
});

// Mezőnkénti mikrofonok
document.querySelectorAll('.mic-mini').forEach((b) => {
  b.addEventListener('click', () => {
    const target = $(b.dataset.target);
    listenOnce((text) => {
      if (b.dataset.target === 'hours') {
        const h = parseHours(text);
        target.value = h != null ? fmtNum(h) : text.trim();
      } else {
        target.value = clean(text);
      }
    }, null, b);
  });
});

$('clearBtn').addEventListener('click', () => {
  $('proj').value = ''; $('hours').value = ''; $('act').value = '';
  $('proj').focus();
});

$('saveBtn').addEventListener('click', async () => {
  const proj = $('proj').value.trim();
  const hoursRaw = $('hours').value.trim();
  const act = $('act').value.trim();
  const hours = parseHours(hoursRaw);
  if (!proj && !act) { toast('Adj meg legalább projektet vagy tevékenységet.'); return; }
  if (hours == null) { toast('Add meg az időt (pl. 2 vagy 2,5).'); $('hours').focus(); return; }

  const entry = { id: Date.now(), ts: new Date().toISOString(), proj, hours, act };
  entries.unshift(entry);
  saveEntries(entries);
  render();
  $('proj').value = ''; $('hours').value = ''; $('act').value = '';
  toast('Mentve ✅');
  trySync(entry);
});

/* ---------- Felhő-szinkron (opcionális Google Form) ---------- */
function refreshSyncBadge() {
  const cfg = loadCfg();
  const on = cfg.url && cfg.proj && cfg.hours && cfg.act;
  $('syncBadge').textContent = on ? 'bekapcsolva' : 'kikapcsolva';
}
function loadCfgIntoForm() {
  const cfg = loadCfg();
  $('cfgUrl').value = cfg.url || '';
  $('cfgProj').value = cfg.proj || '';
  $('cfgHours').value = cfg.hours || '';
  $('cfgAct').value = cfg.act || '';
  refreshSyncBadge();
}
$('cfgSave').addEventListener('click', () => {
  saveCfg({
    url: $('cfgUrl').value.trim(),
    proj: $('cfgProj').value.trim(),
    hours: $('cfgHours').value.trim(),
    act: $('cfgAct').value.trim(),
  });
  refreshSyncBadge();
  toast('Beállítás mentve.');
});
function trySync(entry) {
  const cfg = loadCfg();
  if (!(cfg.url && cfg.proj && cfg.hours && cfg.act)) return;
  const params = new URLSearchParams();
  params.set(cfg.proj, entry.proj);
  params.set(cfg.hours, fmtNum(entry.hours));
  params.set(cfg.act, entry.act);
  // no-cors: az űrlap elfogadja, választ nem olvasunk
  fetch(cfg.url, { method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString() })
    .catch(() => {/* offline: helyben már elmentve */});
}

/* ---------- Megjelenítés ---------- */
function startOfWeek(d) {
  const x = new Date(d); const day = (x.getDay() + 6) % 7; // hétfő = 0
  x.setHours(0,0,0,0); x.setDate(x.getDate() - day); return x;
}
function render() {
  const list = $('list');
  list.innerHTML = '';
  if (entries.length === 0) {
    list.innerHTML = '<div class="empty">Még nincs bejegyzés. Nyomd meg a diktálás gombot!</div>';
  } else {
    for (const e of entries) {
      const el = document.createElement('div');
      el.className = 'entry';
      el.innerHTML = `
        <div class="body">
          <div class="top">
            <span class="proj"></span>
            <span class="hrs">${fmtNum(e.hours)} ó</span>
          </div>
          <div class="act"></div>
          <div class="meta">${fmtDateTime(e.ts)}</div>
        </div>
        <button class="del" title="Törlés" data-id="${e.id}">✕</button>`;
      el.querySelector('.proj').textContent = e.proj || '(nincs projekt)';
      el.querySelector('.act').textContent = e.act || '';
      list.appendChild(el);
    }
    list.querySelectorAll('.del').forEach((b) => b.addEventListener('click', () => {
      const id = Number(b.dataset.id);
      entries = entries.filter((x) => x.id !== id);
      saveEntries(entries); render();
      toast('Bejegyzés törölve.');
    }));
  }
  // összesítők
  const now = new Date();
  const today0 = new Date(now); today0.setHours(0,0,0,0);
  const week0 = startOfWeek(now);
  let td = 0, wk = 0;
  for (const e of entries) {
    const t = new Date(e.ts);
    if (t >= today0) td += e.hours;
    if (t >= week0) wk += e.hours;
  }
  $('sumToday').textContent = fmtNum(td);
  $('sumWeek').textContent = fmtNum(wk);
  $('sumCount').textContent = entries.length;
}

/* ---------- Export ---------- */
$('exportBtn').addEventListener('click', () => {
  if (entries.length === 0) { toast('Nincs mit exportálni.'); return; }
  const rows = [['Dátum', 'Projekt', 'Idő (óra)', 'Tevékenység']];
  for (const e of [...entries].reverse())
    rows.push([fmtDateTime(e.ts), e.proj, fmtNum(e.hours), e.act]);
  const csv = '﻿' + rows.map((r) =>
    r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'idonyilvantartas.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

/* ---------- Indítás ---------- */
loadCfgIntoForm();
render();

/* ---------- Service worker (offline) ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
