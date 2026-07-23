/**
 * Qualitas Időnyilvántartó – Google Táblázat "kapu" (Apps Script webalkalmazás)
 *
 * Telepítés röviden (részletek a README-ben):
 *  1. Nyiss egy Google Táblázatot (ide gyűlnek majd az adatok).
 *  2. Bővítmények → Apps Script.
 *  3. Töröld a példakódot, illeszd be EZT a fájlt, mentsd.
 *  4. Telepítés → Új telepítés → típus: Webalkalmazás.
 *     - Végrehajtás: én (a saját fiókod)
 *     - Hozzáférés: Bárki
 *  5. Másold ki a "Webalkalmazás URL"-t (…/exec végű), és illeszd be az appba
 *     (Felhő-szinkron – Google Táblázat mező).
 *
 * Biztonság: ha a SECRET-be írsz egy kulcsot, ugyanazt add meg az appban is
 * (Titkos kulcs mező). Így csak a te appod tud sort beírni. Üresen hagyva nincs ellenőrzés.
 */

const SHEET_NAME = 'Idők';   // a munkalap neve a táblázaton belül
const SECRET = '';           // pl. 'valami-titok-123' – ugyanezt add meg az appban is

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); }
      catch (err) { data = (e && e.parameter) || {}; }
    } else {
      data = (e && e.parameter) || {};
    }

    if (SECRET && String(data.token || '') !== SECRET) {
      return out({ ok: false, error: 'invalid token' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Időbélyeg', 'Projekt', 'Idő (óra)', 'Tevékenység']);
    }

    var ts = data.ts ? new Date(data.ts) : new Date();
    var ora = data.ora !== undefined ? data.ora : (data.hours || '');
    sh.appendRow([ts, data.projekt || '', ora, data.tevekenyseg || '']);

    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function doGet() {
  return out({ ok: true, msg: 'Qualitas idő-szinkron aktív' });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
