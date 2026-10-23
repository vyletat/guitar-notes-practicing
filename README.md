# Noty na kytaru

Webová aplikace (PWA) pro učení not a hmatníku kytary. Funguje v prohlížeči na počítači i mobilu, dá se nainstalovat na plochu a funguje i offline. Je napsaná v čistém HTML, CSS a JavaScriptu bez frameworku a bez sestavování.

## Co umí

### Procvičování

Pět režimů:

- **Denní:** střídá všechny režimy a ukazuje pokrok k dennímu cíli. Po splnění cíle se den v kalendáři vyznačí ✓.
- **Čtení:** vidíš notu v osnově a vybereš její jméno na kruhovém ciferníku.
- **Zápis:** dostaneš jméno noty a klepneš na správné místo do osnovy.
- **Nota → hmat:** vidíš notu v osnově a najdeš ji na hmatníku.
- **Hmat → nota:** na hmatníku je označené místo a ty určíš, jaká je to nota.

Noty, ve kterých chybuješ, se objevují častěji.

### Hra

- **Volně:** mikrofon pozná tón zahraný na kytaru a ukáže ho v osnově, na hmatníku a v ladičce (odchylka v centech).
- **Podle not:** 8 náhodných not, které zahraješ na kytaru. Mikrofon kontroluje, jestli hraješ správně, a na konci ukáže souhrn.
- **Etudy:** 13 cvičení a melodií: prázdné struny, jednotlivé struny, stupnice C dur, G dur a a moll, chromatický „pavouk“, Óda na radost, Blikej hvězdičko a Rolničky. Mají přehrání, metronom, nastavitelné tempo a nápovědu na hmatníku.
- **Metronom:** 30–240 BPM, takty 2/4, 3/4, 4/4 a 6/8, zvýrazněná první doba, svítící doby a ťukání tempa.

Bez mikrofonu můžeš v záložkách Volně, Podle not a Etudy místo hraní klepat na hmatník.

**Omezení mikrofonu:**
- Pozná jen jednotlivé tóny, ne akordy.
- U etud kontroluje správné noty, ne rytmus.
- Funguje jen přes HTTPS nebo na `localhost`.

### Výuka

13 kapitol teorie (osnova a klíč, názvy not a oktávy, rytmus, posuvky, durové a mollové stupnice, předznamenání, intervaly, akordy, kytara a tabulatura, orientace na hmatníku, základní akordy, pentatonika). Příklady v osnově a na hmatníku jdou přehrát. Přečtené kapitoly mají ✓.

### Statistiky

- dnešní počet odpovědí, dny v řadě, celkový čas a úspěšnost
- kalendář procvičování (✓ = splněný denní cíl) a přehled po týdnech
- **které noty dělají potíže:** pro každý režim zvlášť, u režimu Hmat → nota i mapa chyb na hmatníku

### Nastavení

| Volba | Co dělá |
|---|---|
| Rozsah | jen osnova (d¹–g²), nebo celý rozsah kytary (e–e³) s pomocnými linkami |
| Křížky, béčka | přidá do procvičování noty s posuvkami |
| Struny, do pražce | které struny a pražce se zkoušejí na hmatníku |
| Denní cíl | 10–100 odpovědí denně |
| Zvuk | přehrát správný tón po odpovědi |
| Častěji zkoušet noty, ve kterých chybuji | upřednostní noty s nejhorší úspěšností |
| Aplikace | instalace na plochu, nebo vysvětlení, proč nejde |
| Smazat statistiky | potvrzuje se druhým klepnutím |

Nastavení a statistiky se ukládají jen v prohlížeči daného zařízení (localStorage). Mezi mobilem a počítačem se nesdílejí.

### Klávesnice

- písmena **C D E F G A H**: odpověď v režimech Čtení a Hmat → nota
- **mezerník**: spustí a zastaví metronom

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

Takhle funguje procvičování, výuka, statistiky i metronom. **Mikrofon, instalace na plochu a offline režim ale nefungují.** Prohlížeče je povolují jen přes HTTPS.

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

V Chromu a Edgi (počítač i Android) stačí v aplikaci otevřít *Nastavení → Aplikace → Nainstalovat aplikaci*. Jinak:

- **Android (Chrome):** otevři adresu aplikace → menu ⋮ → *Přidat na plochu* / *Instalovat aplikaci*.
- **iPhone (Safari):** otevři adresu aplikace → tlačítko *Sdílet* → *Přidat na plochu*.

Pak se aplikace spouští jako samostatná aplikace a funguje i bez internetu. Po nasazení nové verze se změny projeví při dalším otevření s připojením k internetu.

Když instalace nejde, *Nastavení → Aplikace* ukáže proč. Nejčastěji je stránka otevřená přes `http://` místo `https://`.

## Pro vývoj

### Struktura

| Soubor | Obsah |
|---|---|
| `index.html` | stránky a styly |
| `js/main.js` | vstupní bod: nastavení, instalace, navigace (`#procvicovani/daily`, `#hrat/etudy/3`, `#vyuka/5`…) |
| `js/music.js` | hudební teorie bez práce se stránkou: názvy not, oktávy, posuvky, místa na hmatníku |
| `js/pitch.js` | rozpoznání výšky tónu (algoritmus YIN) |
| `js/store.js` | nastavení, statistiky, rozsah not podle nastavení |
| `js/audio.js` | přehrání tónu a metronom (plánování přes hodiny Web Audio) |
| `js/draw.js` | kreslení osnovy a hmatníku do SVG |
| `js/dial.js` | kruhový ciferník pro výběr noty |
| `js/practice.js` | stránka Procvičování včetně denního tréninku |
| `js/mic.js` | mikrofon → stabilně rozpoznané tóny a nové údery |
| `js/live.js` | záložka Hra → Volně |
| `js/playalong.js` | záložky Hra → Podle not a Etudy |
| `js/etudes.js` | noty etud |
| `js/metronome.js` | záložka Hra → Metronom |
| `js/lessons.js` | stránka Výuka |
| `js/lessons-content.js` | texty kapitol a příklady |
| `js/stats.js` | záznam odpovědí a stránka Statistiky |
| `sw.js` | service worker (offline režim) |
| `test/music.test.js` | testy (`npm test`) |

Když přidáš nový soubor, doplň ho do seznamu `FILES` v `sw.js` a zvyš číslo verze v `CACHE`, aby fungoval i offline.

### Zápis not v kódu

Noty jsou uložené jako *diatonický krok*: písmeno (C = 0 … H = 6) + 7 × oktáva. Spodní linka osnovy e¹ má krok 30. Výšky jsou MIDI čísla v **psané** výšce kytary. Kytara zní o oktávu níž, než se píše, a o to se stará přehrávání i rozpoznávání tónu.

V etudách a příkladech v lekcích se noty píšou textem: `C4`, `F#4` (fis¹), `Hb3` (b), akord `C4+E4+G4`. Místa na hmatníku se píšou jako `struna:pražec`, např. `6:3`.

### Přidání etudy nebo kapitoly

- **Etuda:** přidej položku do pole `ETUDES` v `js/etudes.js`, třeba:
  ```js
  { title: 'Název', sub: 'popisek', bpm: 80, notes: 'E4 F4 G4' }
  ```
- **Kapitola:** přidej položku `{ title, sub, body }` do `LESSONS` v `js/lessons-content.js`. V `body` je HTML. Příklady se vkládají jako `<div class="ex" data-staff="C4 E4 G4"></div>` (osnova) nebo `<div class="ex" data-fret="5:3 4:2" data-chord></div>` (hmatník, `data-chord` = zahrát najednou). Popisek přidáš atributem `data-text`.

### Ladění rozpoznání tónu

Když mikrofon nepozná opakovaně brnknutou stejnou notu, nebo naopak hlásí falešné údery, uprav konstantu `ATTACK` v `js/mic.js`. Nižší hodnota znamená citlivější rozpoznání úderu.
