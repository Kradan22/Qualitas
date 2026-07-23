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

## Külön linken – a naptártervező mellett
Ez az app egy külön almappában (`ido/`) van, hogy **saját URL-t** kapjon és
**ne érintse a meglévő naptártervezőt** (ami a Pages-cím gyökerén fut).

Miután ez az `ido/` mappa arra az ágra kerül, amelyet a **GitHub Pages** kiszolgál
(ugyanaz, amelyiken a naptár is van), a két app így érhető el:

| App | Cím |
|---|---|
| Naptártervező (meglévő) | `https://kradan22.github.io/Qualitas/` |
| Időnyilvántartó (ez) | `https://kradan22.github.io/Qualitas/ido/` |

A gyökérben lévő `index.html` (naptár) érintetlen marad. Minden útvonal relatív,
így az `/ido/` al-útvonalon a PWA, a service worker és az ikonok is jól működnek.

> A pontos beolvasztás attól függ, melyik ágat/mappát állítottad be a
> **Settings → Pages** alatt. Ezt az `ido/` mappát arra az ágra kell tenni.

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

## Hova menti az adatokat?
- **Alapból: a telefonodon, helyben** (`localStorage`) – offline is működik, privát,
  de csak azon az eszközön látszik, és a böngészőadatok törlésével elveszhet.
  Ezért van a **CSV export** biztonsági mentésnek.
- **Opcionálisan: közvetlenül a Google Táblázatodba** (lásd lent) – automatikus
  felhős másolat, több eszközről elérhető.

## Felhő-szinkron beállítása (Google Táblázat, ajánlott)
Ez **közvetlenül** a Google Táblázatodba ír egy kis Apps Script „kapun" át –
nem kell külön Google Űrlap és entry-azonosítók, csak **egy URL**.

1. Hozz létre (vagy nyiss meg) egy **Google Táblázatot** – ide gyűlnek az adatok.
2. **Bővítmények → Apps Script**.
3. Töröld a példakódot, és illeszd be a repóban lévő
   [`google-apps-script.gs`](google-apps-script.gs) teljes tartalmát. Mentsd.
4. **Telepítés → Új telepítés → típus: Webalkalmazás**:
   - *Végrehajtás*: **én** (a saját fiókod),
   - *Hozzáférés*: **Bárki**.
   - Első alkalommal engedélyezned kell a hozzáférést a saját táblázatodhoz.
5. Másold ki a **Webalkalmazás URL**-t (`…/exec` végű).
6. Az appban: **Felhő-szinkron – Google Táblázat** → illeszd be az URL-t →
   **Teszt sor** (ellenőrzés) → **Beállítás mentése**.

Ezután minden mentés a helyi tárolás mellé a Google Táblázatba is bekerül.

### Biztonság (opcionális)
A `google-apps-script.gs` tetején a `SECRET`-be írhatsz egy kulcsot; ugyanazt add
meg az appban a **Titkos kulcs** mezőben. Így csak a te appod írhat a táblázatba.

> **Megjegyzés a szinkronról:** a mentés a felhőbe „tűzd és felejtsd" módon megy
> (a böngésző CORS-szabályai miatt), ezért az app a *helyi* tárolót használja a
> megjelenítéshez, és emellé küldi a sorokat a táblázatba. Ha épp nincs net, a
> bejegyzés helyben megvan; a Google Táblázat a legközelebbi online mentésnél frissül.
