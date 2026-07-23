# Qualitas Időnyilvántartó – PWA

Telefonon böngészőből megnyitható, a kezdőképernyőre kirakható „app", **diktálás
gombbal**. Offline is működik, az adatok a telefonon tárolódnak (localStorage),
opcionálisan felhőbe (Google Táblázat) is szinkronizálhatók.

## Funkciók
- 🎤 **Diktálás**: nagy gomb egyben az egészhez, vagy mezőnkénti mikrofonok.
- ✍️ **Kézi javítás**: minden mező szerkeszthető; iPhone-on a billentyűzet mikrofonja is működik.
- 📊 **Összesítők**: mai és heti óraszám, bejegyzések száma.
- 💾 **Helyi tárolás**: net nélkül is működik (PWA + service worker).
- ☁️ **Opcionális felhő-szinkron**: Google Űrlapon át Google Táblázatba.
- ⬇️ **CSV export**: Excelben megnyitható.
- 🌙 Világos/sötét téma automatikusan.

## Fájlok
- `index.html` – felület
- `styles.css` – megjelenés
- `app.js` – logika (diktálás, magyar óra-értelmezés, tárolás, export, szinkron)
- `manifest.webmanifest` – PWA-adatok
- `sw.js` – service worker (offline)
- `icons/` – ikonok

## Közzététel GitHub Pages-en (ingyenes, HTTPS)
A PWA-hoz és a mikrofonhoz **HTTPS** kell. Legegyszerűbb a GitHub Pages:

1. A repóban: **Settings → Pages**.
2. **Source**: `Deploy from a branch`.
3. **Branch**: válaszd a fő ágat (pl. `main`) és a **`/docs`** mappát → **Save**.
4. Pár perc múlva elérhető: `https://kradan22.github.io/Qualitas/`

> Ez a mappa (`/docs`) szándékosan a GitHub Pages alapértelmezett helye.
> Minden útvonal relatív, így az al-útvonalas (`/Qualitas/`) cím is jól működik.

## Telepítés iPhone-ra (appként)
1. Nyisd meg a fenti címet **Safariban**.
2. **Megosztás** ikon → **Hozzáadás a főképernyőhöz**.
3. Ezután app-ikonként indul, teljes képernyőn.

## Diktálásról
- A **Web Speech API**-t használja (magyar, `hu-HU`), ahol a böngésző támogatja.
- Ha nem támogatja, koppints egy mezőre és használd a **billentyűzet 🎤 gombját** –
  iPhone-on ez mindig működik.
- Példa egymondatos diktálásra: *„Kovács projekt, két és fél óra, tesztelés"*.
  Az óra felismeri a `2,5`, `két és fél`, `másfél`, `negyed óra` alakokat is.

## Felhő-szinkron beállítása (opcionális)
Ha a bejegyzések a felhőbe (Google Táblázatba) is kerüljenek, kövesd a gyökérben
lévő `idonyilvantarto-siri-utmutato.md` 1–3. lépését (Google Űrlap + entry
azonosítók), majd az appban a **„Felhő-szinkron (opcionális)"** résznél add meg:
- a `formResponse` URL-t,
- a három `entry.xxxx` azonosítót.

Ezután minden mentés a helyi tárolás mellé a Google Táblázatba is bekerül.
