# Qualitas · Napi & heti tervező

Egyfájlos webalkalmazás (`index.html`), amely **élőben** behúzza az Outlook naptáradat
(Microsoft Graph + MSAL böngészős bejelentkezés), és napi / heti nézetben mutatja.
Ha nincs bejelentkezve, egy beépített **demó pillanatképet** jelenít meg.

## Funkciók

- **Napi és heti nézet**, idővonalas rács, az átfedő események egymás mellett
- **Élő Outlook szinkron** – a böngésződ jelentkezik be a Microsoft-fiókodba (jelszót nem tárolunk)
- Automatikus frissítés 5 percenként + kézi „↻ Frissítés" gomb
- „Most" vonal, bizonytalan (tentative) és egész napos események kezelése
- Kattintható események: Teams/Meet **Csatlakozás** és „Megnyitás Outlookban"
- Napi **teendőlista** (a böngésződben, `localStorage`-ban tárolva)
- Világos / sötét téma

## Beüzemelés – élő szinkron

Az élő szinkron csak **HTTPS**-en (pl. GitHub Pages) vagy `http://localhost`-on működik,
mert a Microsoft bejelentkezés a pontos oldalcímhez (redirect URI) van kötve.

### 1. GitHub Pages bekapcsolása

Repo → **Settings → Pages** → *Build and deployment* → *Source:* **Deploy from a branch** →
válaszd ki ezt az ágat (`claude/outlook-calendar-planner-wy0d7d`) vagy a `main`-t, mappa: `/ (root)` → **Save**.
Pár perc múlva elérhető lesz itt:

```
https://kradan22.github.io/Qualitas/
```

### 2. Azure (Entra ID) alkalmazás beállítása

Az appregisztrációdban (portal.azure.com → *App registrations* → az appod):

1. **Authentication → Add a platform → Single-page application**, és add hozzá a redirect URI-t:
   ```
   https://kradan22.github.io/Qualitas/
   ```
   (A tervező a beállítások ⚙ ablakában is kiírja a pontos redirect URI-t – azt másold be.)
2. **API permissions → Add a permission → Microsoft Graph → Delegated → `Calendars.Read`**
   (majd ha kéri, „Grant admin consent", vagy első bejelentkezéskor felhasználói hozzájárulás).

### 3. Csatlakozás a felületen

Nyisd meg az oldalt → **⚙ Beállítások** → illeszd be a **Client ID**-t
(és céges fiókhoz a **tenant** GUID-ot vagy a `qualitassystem.hu` domaint) → **Mentés és csatlakozás**.
Ezután a naptárad élőben töltődik, és a következő megnyitáskor automatikusan bejelentkezik.

## Helyi futtatás (localhost)

```bash
python3 -m http.server 8080
# majd böngészőben: http://localhost:8080
```
Ekkor a redirect URI `http://localhost:8080/` – ezt is vedd fel az Azure appban SPA platformként.

## Adatvédelem

A Client ID nem titkos adat. A bejelentkezés és a hozzáférési token a te böngésződben marad
(`localStorage`), a szerverre semmilyen naptáradat vagy hitelesítő adat nem kerül.
