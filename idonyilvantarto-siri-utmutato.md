# Hangvezérelt időnyilvántartó – Siri Parancs + felhő tábla

Ez az útmutató végigvezet egy **iPhone-ról indítható, bediktálható időnyilvántartó**
elkészítésén, kód nélkül. A felállás:

- **Google Űrlap → Google Táblázat**: felhős tárolás, automatikus szinkron (ingyenes).
- **Siri Parancs (Shortcut)**: magyarul bediktálod, a parancs csendben elküldi az űrlapot.

> Egyszemélyes használatra készült. Az adatok a saját Google-fiókodban, egy táblázatban gyűlnek.

---

## Áttekintés – mi történik használat közben?

1. Megnyitod a parancsot (koppintás a kezdőképernyőn, vagy *„Hé Siri, időbejegyzés"*).
2. A telefon sorban megkérdezi: **Projekt?**, **Hány óra?**, **Mit csináltál?** — mindet bemondod.
3. A parancs a bemondott adatokat elküldi a Google Űrlapnak.
4. Az űrlap automatikusan új sort ír a Google Táblázatba, időbélyeggel együtt.
5. Kapsz egy „Rögzítve" értesítést.

A táblázat bármikor megnyitható, szűrhető, exportálható (Excel/PDF).

---

## 1. lépés – Google Űrlap létrehozása

1. Nyisd meg: <https://forms.google.com> → **Üres űrlap**.
2. Cím: `Időnyilvántartás`.
3. Vegyél fel **3 kérdést**, mindegyik típusa **„Rövid szöveg"**:
   | Kérdés szövege | Mit tartalmaz |
   |---|---|
   | `Projekt`      | pl. ügyfél vagy projekt neve |
   | `Idő (óra)`    | pl. 2,5 |
   | `Tevékenység`  | pl. tesztelés, egyeztetés |
4. Az időbélyeg (dátum + időpont) **automatikusan** rögzül minden beküldésnél, ezt nem kell külön kérdésként felvenni.

> Tipp: a mezőket ne állítsd „kötelezőre", hogy a csendes beküldés hibamentes legyen.

---

## 2. lépés – Táblázat összekötése

1. Az űrlap tetején a **Válaszok** fül → táblázat ikon → **Új táblázat létrehozása**.
2. Ettől kezdve minden beküldött bejegyzés új sorként megjelenik a Google Táblázatban.

---

## 3. lépés – Az „előre kitöltött" link megszerzése (mezőazonosítók)

Ez adja meg, melyik mezőbe melyik adat kerül.

1. Az űrlap szerkesztőjében jobb fent a **⋮ (három pont)** → **Előre kitöltött link beszerzése**.
2. Írj be minden mezőbe egy **könnyen felismerhető próbaértéket**:
   - Projekt → `PROJEKT`
   - Idő (óra) → `IDO`
   - Tevékenység → `TEVEKENYSEG`
3. Alul **Link beszerzése** → **Link másolása**.

A kapott URL így néz ki (a számok nálad mások lesznek):

```
https://docs.google.com/forms/d/e/AbC123.../viewform?usp=pp_url&entry.111111=PROJEKT&entry.222222=IDO&entry.333333=TEVEKENYSEG
```

Jegyezd fel a három **entry azonosítót** és hogy melyik mezőhöz tartozik:
- `entry.111111` → Projekt
- `entry.222222` → Idő (óra)
- `entry.333333` → Tevékenység

> A csendes (Safari-megnyitás nélküli) beküldéshez a `viewform` végződést a parancsban
> **`formResponse`-ra** cseréljük. Erre a következő lépésben térünk rá.

---

## 4. lépés – A Siri Parancs (Shortcut) felépítése

Nyisd meg a **Parancsok** appot → **+** (új parancs). Add hozzá sorban ezeket a műveleteket:

1. **Szöveg diktálása** (Dictate Text)
   - Nyelv: **Magyar**.
   - A megjelenő ablakba mondd be a **projektet**.
   - Nevezd el a kimenetét: a következő lépésben `Projekt` néven hivatkozunk rá
     (a Parancsokban a „Diktált szöveg" eredményre hivatkozol).

2. **Szöveg diktálása** → a **hány órát** dolgoztál (pl. „két egész öt").

3. **Szöveg diktálása** → a **tevékenység**.

4. **URL** művelet – ide illeszd be a 3. lépés linkjét, de:
   - a `viewform?usp=pp_url` részt cseréld **`formResponse?`**-ra,
   - a próbaértékek (`PROJEKT`, `IDO`, `TEVEKENYSEG`) helyére húzd be a megfelelő
     **Diktált szöveg** változókat (1., 2., 3. diktálás).

   Így néz ki a végeredmény (a változók helyét `«...»` jelzi):

   ```
   https://docs.google.com/forms/d/e/AbC123.../formResponse?entry.111111=«Projekt»&entry.222222=«Idő»&entry.333333=«Tevékenység»
   ```

5. **URL tartalmának lekérése** (Get Contents of URL)
   - Metódus: **POST**.
   - Ez küldi be az űrlapot **a háttérben, Safari megnyitása nélkül**.

6. **Értesítés megjelenítése** (Show Notification): `Időbejegyzés rögzítve ✅`.

Mentsd el a parancsot **Időbejegyzés** néven.

---

## 5. lépés – Indítás hanggal és a kezdőképernyőről

- **Siri**: mondd *„Hé Siri, Időbejegyzés"* → elindul a diktálás.
- **Kezdőképernyő**: a parancs megosztás menüjében **„Hozzáadás a kezdőképernyőhöz"** →
  egy „app-ikon" kerül a főképernyőre, amivel egy koppintással indul.
- **Vissza-koppintás**: Beállítások → Kisegítő lehetőségek → Érintés → Vissza-koppintás →
  köthető a parancs a telefon hátlapjának dupla/tripla koppintásához.

---

## Változatok és bővítés

- **Egy mondatos diktálás** (haladó): egyetlen diktálásban mondasz mindent egy elválasztóval
  (pl. *„Kovács projekt; két óra; tesztelés"*), majd a parancsban **Szöveg felosztása**
  (Split Text) `;` mentén, és a 3 részt teszed a 3 mezőbe. Gyorsabb, de a beszédet
  pontosabban kell tagolni.
- **Excel / Microsoft 365** alternatíva: ha inkább Excel/OneDrive kell, a Power Automate
  „When a new item is received" helyett egy HTTP-hívásos folyamattal ugyanez megoldható –
  szólj, ha ezt az irányt szeretnéd.
- **Számlázáshoz**: a táblázatba vehető egy „óradíj" oszlop, és képlettel automatikus
  összeg számolható projektenként.

---

## Hibaelhárítás

| Tünet | Megoldás |
|---|---|
| Nem ír be sort | Ellenőrizd, hogy `viewform` helyett `formResponse` van-e, és a metódus **POST**. |
| Rossz mezőbe kerül az adat | Nézd meg, hogy az `entry.xxxx` azonosítók a helyes mezőhöz vannak-e rendelve. |
| Üres cellák | Ne legyenek „kötelező" mezők az űrlapon. |
| Ékezet/karakterhiba | A Parancsok automatikusan URL-kódolja a diktált szöveget; ha kézzel írsz be értéket, kódold. |
| Rosszul érti a szót | A „Szöveg diktálása" nyelvét állítsd kifejezetten **Magyarra**. |

---

Kérdés vagy továbbfejlesztés esetén (pl. Excel-verzió, automatikus napi összesítő,
gyorsabb egymondatos rögzítés) szólj, és bővítjük.
