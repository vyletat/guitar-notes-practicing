# Noty na kytaru

Webová aplikace (PWA) pro učení not a hmatníku kytary. Funguje v prohlížeči na počítači i mobilu, dá se nainstalovat na plochu a funguje i offline. Je napsaná v čistém HTML, CSS a JavaScriptu bez frameworku a bez sestavování.

## Co umí

- **Procvičování** ve 4 režimech:
  - **Čtení:** vidíš notu v osnově a vybereš její jméno na kruhovém ciferníku.
  - **Zápis:** dostaneš jméno noty a klepneš na správné místo do osnovy.
  - **Nota → hmat:** vidíš notu v osnově a najdeš ji na hmatníku.
  - **Hmat → nota:** na hmatníku je označené místo a ty určíš, jaká je to nota.
  - Volitelně s křížky a béčky. Noty, ve kterých chybuješ, se objevují častěji.
- **Volná hra:** mikrofon pozná tón zahraný na kytaru a ukáže ho v osnově, na hmatníku a v ladičce.
- **Výuka:** 13 kapitol hudební teorie (osnova, posuvky, stupnice, intervaly, akordy, kytara, hmatník) s příklady, které jdou přehrát.
- **Statistiky:** kalendář procvičování, přehled po týdnech a noty, které ti dělají potíže.

Statistiky a nastavení se ukládají jen v prohlížeči daného zařízení (localStorage).

## Spuštění na počítači

Potřebuješ [Node.js](https://nodejs.org/). Ve složce projektu spusť:

```bash
npm start
```

Pak otevři <http://localhost:8080>.

Aplikace se musí spouštět přes webový server, ne otevřením `index.html` dvojklikem. Přes `file://` prohlížeč nenačte JavaScriptové moduly.

Testy hudební logiky a rozpoznání tónu:

```bash
npm test
```

## Na mobilu

### Rychle vyzkoušet ve stejné Wi-Fi

1. Na počítači spusť `npm start`. Server vypíše i adresu v místní síti, např. `http://192.168.1.23:8080`.
2. Tu adresu otevři v prohlížeči na mobilu. Windows se může zeptat na povolení ve firewallu, povol přístup v privátní síti.

Takhle funguje procvičování, výuka i statistiky. **Mikrofon, instalace na plochu a offline režim ale nefungují.** Prohlížeče je povolují jen přes HTTPS.

### Plná aplikace přes HTTPS (doporučeno)

Nejjednodušší je zdarma **GitHub Pages**:

1. Vytvoř na GitHubu nový repozitář a nahraj do něj projekt:
   ```bash
   git remote add origin https://github.com/<uživatel>/<repozitář>.git
   ```
   ```bash
   git push -u origin master
   ```
2. Na GitHubu otevři **Settings → Pages**. V části *Build and deployment* zvol *Deploy from a branch*, větev `master` a složku `/ (root)` a ulož.
3. Za chvíli bude aplikace na `https://<uživatel>.github.io/<repozitář>/`.

Případně můžeš celou složku přetáhnout na [Netlify Drop](https://app.netlify.com/drop).

### Instalace na plochu

- **Android (Chrome):** otevři adresu aplikace → menu ⋮ → *Přidat na plochu* / *Instalovat aplikaci*.
- **iPhone (Safari):** otevři adresu aplikace → tlačítko *Sdílet* → *Přidat na plochu*.

Pak se aplikace spouští jako samostatná aplikace a funguje i bez internetu. Po nasazení nové verze se změny projeví při dalším otevření s připojením k internetu.

## Struktura

| Soubor | Obsah |
|---|---|
| `index.html` | stránky a styly |
| `js/main.js` | vstupní bod: nastavení a navigace mezi stránkami (`#procvicovani/read`, `#vyuka/3`…) |
| `js/music.js` | hudební teorie bez práce se stránkou: názvy not, oktávy, posuvky, místa na hmatníku |
| `js/pitch.js` | rozpoznání výšky tónu (algoritmus YIN) |
| `js/store.js` | nastavení a statistiky v localStorage |
| `js/audio.js` | přehrání tónu |
| `js/draw.js` | kreslení osnovy a hmatníku do SVG |
| `js/dial.js` | kruhový ciferník pro výběr noty |
| `js/practice.js` | stránka Procvičování |
| `js/live.js` | stránka Volná hra (mikrofon) |
| `js/lessons.js` | stránka Výuka |
| `js/lessons-content.js` | texty kapitol a příklady |
| `js/stats.js` | záznam odpovědí a stránka Statistiky |
| `sw.js` | service worker (offline režim) |
| `test/music.test.js` | testy (`npm test`) |

Když přidáš nový soubor, doplň ho do seznamu `FILES` v `sw.js`, aby fungoval i offline.

### Zápis not v kódu

Noty jsou uložené jako *diatonický krok*: písmeno (C = 0 … H = 6) + 7 × oktáva. Spodní linka osnovy e¹ má krok 30. Výšky jsou MIDI čísla v **psané** výšce kytary. Kytara zní o oktávu níž, než se píše, a o to se stará přehrávání i rozpoznávání tónu.
