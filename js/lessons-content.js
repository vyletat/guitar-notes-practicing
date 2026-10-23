// Kapitoly výuky. Příklady: data-staff="C4 F#4 Hb4 C4+E4+G4" (akord = +), data-key = předznamenání,
// data-fret="struna:pražec …", data-chord = zahrát najednou, data-text = popisek.
const practice = (mode, text) => `<p><a class="btn primary" href="#procvicovani/${mode}">${text} →</a></p>`;

export const LESSONS = [
{
  title: 'Osnova a houslový klíč',
  sub: 'Linky, mezery, pomocné linky',
  body: `
<p>Noty se zapisují do <b>osnovy</b> – pěti vodorovných linek. Linky i mezery mezi nimi se počítají <b>zdola nahoru</b>: 1. linka je nejspodnější, 5. nejvyšší. Čím výš nota v osnově leží, tím vyšší tón znamená.</p>
<p>Na začátku osnovy je <b>klíč</b>, který určuje, jaké tóny linky znamenají. Kytara používá <b>houslový klíč</b> (G klíč). Jeho spirála se otáčí kolem 2. linky a říká: <i>na 2. lince leží tón g¹</i>. Od něj se odvodí všechno ostatní.</p>
<div class="ex" data-staff="G4" data-text="Nota g¹ na 2. lince – podle ní dostal houslový klíč jméno G klíč."></div>
<h3>Noty na linkách</h3>
<p>Zdola: <b>e¹ – g¹ – h¹ – d² – f²</b>.</p>
<div class="ex" data-staff="E4 G4 H4 D5 F5"></div>
<h3>Noty v mezerách</h3>
<p>Zdola: <b>f¹ – a¹ – c² – e²</b>.</p>
<div class="ex" data-staff="F4 A4 C5 E5"></div>
<h3>Pomocné linky</h3>
<p>Tóny mimo osnovu se píšou na krátké <b>pomocné linky</b> nad nebo pod osnovou. Pro kytaru jsou důležité hlavně noty pod osnovou – nejhlubší struna E je až na třetí pomocné lince dole.</p>
<div class="ex" data-staff="C4 A3 F3 E3" data-text="c¹ (1 pomocná linka), a (2), f (3), e (pod 3. linkou) – nejhlubší tón kytary."></div>
<div class="ex" data-staff="G5 A5 H5 C6" data-text="Nad osnovou: g², a² (1 pomocná linka), h², c³ (2 pomocné linky)."></div>
<p><b>Tip:</b> Nepočítej pokaždé od klíče. Nauč se pár „kotev“ (e¹ na spodní lince, g¹, h¹ uprostřed, c¹ na první pomocné lince dole) a ostatní noty odvozuj krokem nahoru nebo dolů.</p>
${practice('read', 'Procvičit čtení not')}`
},
{
  title: 'Názvy not a oktávy',
  sub: 'C D E F G A H, české H a B',
  body: `
<p>Základních (kmenových) tónů je sedm: <b>C D E F G A H</b>. Pak se řada opakuje o <b>oktávu</b> výš.</p>
<p><b>Pozor na H:</b> v češtině (i v němčině) se 7. tón jmenuje <b>H</b>. Anglicky se mu říká B. Česky je <b>B</b> až tón o půltón nižší (h snížené). V anglických materiálech tedy B = naše H a B♭ = naše B.</p>
<h3>Názvy oktáv</h3>
<table>
<tr><th>Oktáva</th><th>Zápis</th><th>Příklad</th></tr>
<tr><td>velká</td><td>C D E … H</td><td>nejhlubší struna kytary zní jako velké E</td></tr>
<tr><td>malá</td><td>c d e … h</td><td></td></tr>
<tr><td>jednočárkovaná</td><td>c¹ d¹ … h¹</td><td>c¹ = „střední C“ na klavíru</td></tr>
<tr><td>dvoučárkovaná</td><td>c² d² … h²</td><td></td></tr>
<tr><td>tříčárkovaná</td><td>c³ …</td><td></td></tr>
</table>
<p>Oktáva vždy začíná tónem C. Proto po h¹ následuje c², ne c¹.</p>
<div class="ex" data-staff="E3 C4 C5 C6" data-text="e (malé), c¹, c², c³ – každé další C je o oktávu výš."></div>
<div class="ex" data-staff="C4 D4 E4 F4 G4 A4 H4 C5" data-text="Jednočárkovaná oktáva c¹–h¹ a c²."></div>
${practice('read', 'Procvičit čtení not')}`
},
{
  title: 'Délky not, pomlky a takt',
  sub: 'Rytmus a počítání dob',
  body: `
<p>Výšku tónu určuje poloha noty v osnově, jeho <b>délku</b> určuje tvar noty.</p>
<table>
<tr><th>Nota</th><th>Vzhled</th><th>Dob v taktu 4/4</th></tr>
<tr><td>celá</td><td>prázdná hlavička bez nožičky</td><td>4</td></tr>
<tr><td>půlová</td><td>prázdná hlavička s nožičkou</td><td>2</td></tr>
<tr><td>čtvrťová</td><td>plná hlavička s nožičkou</td><td>1</td></tr>
<tr><td>osminová</td><td>plná hlavička s nožičkou a praporkem</td><td>½</td></tr>
<tr><td>šestnáctinová</td><td>dva praporky</td><td>¼</td></tr>
</table>
<p>Několik osminových nebo šestnáctinových not se často spojuje <b>trámcem</b> místo praporků.</p>
<p><b>Tečka</b> za notou ji prodlužuje o polovinu: půlová s tečkou = 3 doby. <b>Ligatura</b> (oblouček mezi dvěma stejnými notami) je spojí v jeden delší tón.</p>
<p><b>Pomlka</b> znamená ticho. Každá délka noty má svou pomlku (celá, půlová, čtvrťová, osminová…).</p>
<h3>Takt</h3>
<p>Hudba se dělí <b>taktovými čarami</b> na takty. Na začátku je <b>taktové označení</b>, například 4/4: horní číslo říká počet dob v taktu, dolní jejich hodnotu (4 = čtvrťová). Nejčastější jsou 4/4, 3/4 (valčík), 2/4 a 6/8.</p>
<p><b>Tip:</b> Při hře nahlas počítej „raz, dva, tři, čtyři“ a osminy „raz a dva a…“. Pomůže ti metronom, třeba na 60 BPM.</p>`
},
{
  title: 'Půltóny a posuvky',
  sub: 'Křížek, béčko, odrážka',
  body: `
<p>Nejmenší vzdálenost mezi tóny v naší hudbě je <b>půltón</b>. Dva půltóny dávají <b>celý tón</b>. Na kytaře odpovídá jeden pražec přesně jednomu půltónu.</p>
<p>Mezi kmenovými tóny jsou většinou celé tóny. Jen mezi <b>e–f</b> a <b>h–c</b> je půltón. Na klavíru tam chybí černá klávesa.</p>
<div class="ex" data-fret="5:0 5:1 5:2 5:3 5:4 5:5 5:6 5:7 5:8 5:9 5:10 5:11 5:12" data-text="Struna A, pražce 0–12: chromatická stupnice po půltónech. Mezi H a C ani mezi E a F není nic dalšího."></div>
<h3>Posuvky</h3>
<table>
<tr><th>Znak</th><th>Název</th><th>Účinek</th><th>Jak se jmenuje tón</th></tr>
<tr><td>♯</td><td>křížek</td><td>zvýší o půltón</td><td>přidá se <b>-is</b>: cis, dis, fis, gis, ais</td></tr>
<tr><td>♭</td><td>béčko</td><td>sníží o půltón</td><td>přidá se <b>-es</b>: des, ges, ces, fes. Výjimky: <b>es</b>, <b>as</b> a <b>b</b> (h snížené)</td></tr>
<tr><td>♮</td><td>odrážka</td><td>ruší předchozí posuvku</td><td></td></tr>
</table>
<div class="ex" data-staff="C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4 H4 C5" data-text="Chromatická stupnice nahoru s křížky."></div>
<div class="ex" data-staff="C5 H4 Hb4 A4 Ab4 G4 Gb4 F4 E4 Eb4 D4 Db4 C4" data-text="Chromatická stupnice dolů s béčky."></div>
<p>Posuvka přímo u noty (<b>náhodná posuvka</b>) platí až do konce taktu, a jen pro tu výšku, u které je napsaná.</p>
<h3>Enharmonická záměna</h3>
<p>Jeden tón může mít dva názvy: <b>cis = des</b>, <b>fis = ges</b>, <b>ais = b</b>… Zní stejně a na kytaře se hrají na stejném pražci. Který název se použije, záleží na tónině.</p>
<div class="ex" data-staff="C#4 Db4 F#4 Gb4" data-text="cis¹ a des¹, fis¹ a ges¹ – stejné tóny, různý zápis."></div>
<p>Existují i dvojité posuvky: dvojkřížek (𝄪, -isis) a dvojbéčko (𝄫, -eses). Potkáš je zřídka.</p>
${practice('read', 'Zapni křížky a béčka v Nastavení a procvičuj')}`
},
{
  title: 'Durové stupnice',
  sub: 'Vzorec C C P C C C P',
  body: `
<p><b>Stupnice</b> je řada tónů od základního tónu po jeho oktávu. Durová stupnice zní vesele a jasně. Má vždy stejný vzorec kroků: <b>celý – celý – půl – celý – celý – celý – půl</b>.</p>
<h3>C dur</h3>
<p>C dur tvoří jen kmenové tóny. Půltóny vycházejí přesně mezi e–f (3.–4. stupeň) a h–c (7.–8. stupeň).</p>
<div class="ex" data-staff="C4 D4 E4 F4 G4 A4 H4 C5"></div>
<div class="ex" data-fret="5:3 4:0 4:2 4:3 3:0 3:2 2:0 2:1" data-text="C dur v první poloze: c¹ na 5. struně, 3. pražci."></div>
<h3>G dur</h3>
<p>Když stejný vzorec začneš od G, musíš 7. stupeň zvýšit na <b>fis</b>, aby mezi 7. a 8. stupněm byl půltón.</p>
<div class="ex" data-staff="G4 A4 H4 C5 D5 E5 F#5 G5"></div>
<div class="ex" data-fret="6:3 5:0 5:2 5:3 4:0 4:2 4:4 3:0" data-text="G dur od 6. struny (malé g) – fis je na 4. struně, 4. pražci."></div>
<h3>D dur</h3>
<p>Má dva křížky: <b>fis a cis</b>.</p>
<div class="ex" data-staff="D4 E4 F#4 G4 A4 H4 C#5 D5"></div>
<h3>F dur</h3>
<p>Má jedno béčko: <b>b</b> místo h, aby byl půltón mezi 3. a 4. stupněm (a–b).</p>
<div class="ex" data-staff="F4 G4 A4 Hb4 C5 D5 E5 F5"></div>
<p><b>Stupně</b> se značí římskými číslicemi I–VII. Nejdůležitější jsou I (tónika), IV (subdominanta) a V (dominanta). Na nich stojí většina písniček.</p>`
},
{
  title: 'Předznamenání a kvintový kruh',
  sub: 'Kolik křížků a béček má tónina',
  body: `
<p>Aby se posuvky nemusely psát u každé noty, píšou se na začátek osnovy hned za klíč. Tomu se říká <b>předznamenání</b>. Platí pro celou skladbu a ve všech oktávách.</p>
<div class="ex" data-key="F#5" data-staff="G4 A4 H4 C5 D5 E5 F5 G5" data-text="G dur s předznamenáním: nota na 5. lince je díky křížku v předznamenání fis², i když u ní žádný křížek není."></div>
<h3>Pořadí křížků</h3>
<p><b>fis – cis – gis – dis – ais – eis – his</b>. Tónina má vždy prvních N z nich.</p>
<div class="ex" data-key="F#5 C#5 G#5 D#5 A#4 E#5 H#4" data-staff="" data-text="Všech 7 křížků v houslovém klíči."></div>
<h3>Pořadí béček</h3>
<p><b>b – es – as – des – ges – ces – fes</b>, tedy pořadí křížků pozpátku.</p>
<div class="ex" data-key="Hb4 Eb5 Ab4 Db5 Gb4 Cb5 Fb4" data-staff="" data-text="Všech 7 béček."></div>
<h3>Kvintový kruh</h3>
<p>Když jdeš od C dur po kvintách nahoru (C → G → D → A …), přibývá vždy jeden křížek. Po kvintách dolů (C → F → B → Es …) přibývá jedno béčko.</p>
<table>
<tr><th>Posuvky</th><th>Dur</th><th>Paralelní moll</th></tr>
<tr><td>0</td><td>C</td><td>a</td></tr>
<tr><td>1♯</td><td>G</td><td>e</td></tr>
<tr><td>2♯</td><td>D</td><td>h</td></tr>
<tr><td>3♯</td><td>A</td><td>fis</td></tr>
<tr><td>4♯</td><td>E</td><td>cis</td></tr>
<tr><td>5♯</td><td>H</td><td>gis</td></tr>
<tr><td>1♭</td><td>F</td><td>d</td></tr>
<tr><td>2♭</td><td>B</td><td>g</td></tr>
<tr><td>3♭</td><td>Es</td><td>c</td></tr>
<tr><td>4♭</td><td>As</td><td>f</td></tr>
</table>
<p><b>Triky:</b> U křížkových tónin je základní tón o půltón výš než poslední křížek (fis → G dur, cis → D dur). U béčkových tónin je základní tón předposlední béčko (b, es → B dur).</p>
<p>Na kytaře se nejčastěji hraje v tóninách C, G, D, A, E a jejich mollových paralelách a, e, h.</p>`
},
{
  title: 'Mollové stupnice',
  sub: 'Přirozená, harmonická, melodická',
  body: `
<p>Mollová stupnice zní smutněji. Každá durová tónina má <b>paralelní moll</b> se stejným předznamenáním. Začíná na 6. stupni duru, tedy o malou tercii níž: C dur → a moll, G dur → e moll.</p>
<h3>Přirozená (aiolská) moll</h3>
<p>Vzorec: <b>celý – půl – celý – celý – půl – celý – celý</b>.</p>
<div class="ex" data-staff="A3 H3 C4 D4 E4 F4 G4 A4" data-text="a moll přirozená – stejné tóny jako C dur, jen začíná od a."></div>
<h3>Harmonická moll</h3>
<p>Zvýšený <b>7. stupeň</b> (v a moll gis). Vznikne charakteristický „orientální“ krok o 1½ tónu mezi 6. a 7. stupněm.</p>
<div class="ex" data-staff="A3 H3 C4 D4 E4 F4 G#4 A4"></div>
<h3>Melodická moll</h3>
<p>Nahoru se zvyšuje <b>6. i 7. stupeň</b> (fis, gis), dolů se hraje jako přirozená.</p>
<div class="ex" data-staff="A3 H3 C4 D4 E4 F#4 G#4 A4"></div>
<h3>e moll na kytaře</h3>
<div class="ex" data-fret="6:0 6:2 6:3 5:0 5:2 5:3 4:0 4:2" data-text="e moll přirozená od nejhlubší struny – velmi častá tónina kytarových písní."></div>`
},
{
  title: 'Intervaly',
  sub: 'Vzdálenosti mezi tóny',
  body: `
<p><b>Interval</b> je vzdálenost dvou tónů. Pojmenovává se podle počtu stupňů (včetně obou krajních): prima, sekunda, tercie, kvarta, kvinta, sexta, septima, oktáva. Přesnou velikost určuje počet půltónů.</p>
<table>
<tr><th>Půltónů</th><th>Interval</th><th>Od c</th><th>Na kytaře (od 6. struny)</th></tr>
<tr><td>0</td><td>čistá prima</td><td>c–c</td><td>stejný pražec</td></tr>
<tr><td>1</td><td>malá sekunda</td><td>c–des</td><td>o pražec výš</td></tr>
<tr><td>2</td><td>velká sekunda</td><td>c–d</td><td>o 2 pražce výš</td></tr>
<tr><td>3</td><td>malá tercie</td><td>c–es</td><td></td></tr>
<tr><td>4</td><td>velká tercie</td><td>c–e</td><td></td></tr>
<tr><td>5</td><td>čistá kvarta</td><td>c–f</td><td>sousední struna, stejný pražec</td></tr>
<tr><td>6</td><td>tritón</td><td>c–fis</td><td></td></tr>
<tr><td>7</td><td>čistá kvinta</td><td>c–g</td><td>sousední struna, o 2 pražce výš (power chord)</td></tr>
<tr><td>8</td><td>malá sexta</td><td>c–as</td><td></td></tr>
<tr><td>9</td><td>velká sexta</td><td>c–a</td><td></td></tr>
<tr><td>10</td><td>malá septima</td><td>c–b</td><td></td></tr>
<tr><td>11</td><td>velká septima</td><td>c–h</td><td></td></tr>
<tr><td>12</td><td>čistá oktáva</td><td>c–c¹</td><td>o 2 struny výš a 2 pražce dál</td></tr>
</table>
<div class="ex" data-staff="C4+E4 C4+F4 C4+G4 C4+A4 C4+H4 C4+C5" data-text="Od c¹: velká tercie, kvarta, kvinta, velká sexta, velká septima, oktáva."></div>
<p><b>Tip na poslech:</b> Pro velkou tercii si můžeš zazpívat začátek durového akordu. Kvinta zní „prázdně“ jako power chord v rocku.</p>`
},
{
  title: 'Akordy',
  sub: 'Durový a mollový kvintakord',
  body: `
<p><b>Akord</b> jsou alespoň tři tóny znějící současně. Základní je <b>kvintakord</b>: základní tón, tercie a kvinta. Skládá se z tercií nad sebou.</p>
<ul>
<li><b>Durový</b> = velká tercie (4 půltóny) + malá tercie (3). C dur = c – e – g.</li>
<li><b>Mollový</b> = malá tercie (3) + velká tercie (4). a moll = a – c – e.</li>
</ul>
<div class="ex" data-staff="C4+E4+G4 F4+A4+C5 G4+H4+D5" data-text="C dur, F dur, G dur – akordy na I., IV. a V. stupni C dur."></div>
<div class="ex" data-staff="A3+C4+E4 D4+F4+A4 E4+G4+H4" data-text="a moll, d moll, e moll."></div>
<p>V akordových značkách nad písní se dur píše velkým písmenem (C, G) a moll s „mi“ nebo „m“ (Ami, Am). Číslo 7 přidá malou septimu (G7 = g – h – d – f).</p>
<p>Na kytaře hraješ obvykle 4–6 strun, takže se některé tóny akordu opakují v různých oktávách. Akord je pořád stejný.</p>`
},
{
  title: 'Kytara: popis, ladění, zápis',
  sub: 'Struny, prsty, tabulatura',
  body: `
<h3>Části kytary</h3>
<p><b>Hlava</b> s ladicí mechanikou → <b>nultý pražec</b> (sedlo) → <b>krk</b> s <b>hmatníkem</b> a kovovými <b>pražci</b> → <b>tělo</b> (korpus) s ozvučným otvorem → <b>kobylka</b>, ve které jsou struny uchycené.</p>
<h3>Struny a ladění</h3>
<p>Struny se číslují od <b>nejtenčí (1.)</b> po <b>nejtlustší (6.)</b>. Standardní ladění od 6. struny: <b>E – A – D – G – H – e</b>. Pomůcka: „<i>Eva A Doma Gábina Hraje Erhu</i>“.</p>
<div class="ex" data-fret="6:0 5:0 4:0 3:0 2:0 1:0" data-text="Prázdné struny 6 → 1."></div>
<div class="ex" data-staff="E3 A3 D4 G4 H4 E5" data-text="Jak se prázdné struny zapisují do not."></div>
<h3>Kytara zní o oktávu níž</h3>
<p>Aby se noty nemusely psát na spoustu pomocných linek, kytara se zapisuje v houslovém klíči <b>o oktávu výš</b>, než skutečně zní. Někdy je pod klíčem malá osmička. Nota e¹ na spodní lince tedy na kytaře zní jako e (malé). V této aplikaci jsou všechny noty psané a přehrávané právě takto.</p>
<h3>Prstoklad</h3>
<p><b>Levá ruka:</b> 1 = ukazovák, 2 = prostředník, 3 = prsteník, 4 = malík. <b>Pravá ruka:</b> p = palec, i = ukazovák, m = prostředník, a = prsteník.</p>
<p><b>Poloha</b> říká, na kterém pražci leží 1. prst (I. poloha = 1. pražec, V. poloha = 5. pražec). V jedné poloze pokryješ 4 pražce, jeden na každý prst.</p>
<h3>Tabulatura</h3>
<p>Kromě not se kytara zapisuje <b>tabulaturou</b>: 6 řádků jsou struny (nahoře 1. struna e) a čísla udávají pražce. Je jednoduchá, ale chybí v ní rytmus a nenaučí tě noty. Proto je dobré umět obojí.</p>
<pre style="background:var(--card);padding:10px;border-radius:8px;overflow-x:auto">e|-----------------|
H|-------------0-1-|
G|---------0-2-----|
D|---0-2-3---------|
A|-3---------------|  ← C dur v I. poloze
E|-----------------|</pre>`
},
{
  title: 'Orientace na hmatníku',
  sub: 'Kde hledat noty',
  body: `
<p>Na hmatníku se opakuje stejný vzorec. Stačí znát pár pravidel.</p>
<h3>1. Kmenové noty v I. poloze</h3>
<p>Začni prvními třemi pražci, kde leží všechny kmenové noty od e (malé) do g².</p>
<div class="ex" data-fret="6:0 6:1 6:3 5:0 5:2 5:3 4:0 4:2 4:3 3:0 3:2 2:0 2:1 2:3 1:0 1:1 1:3"></div>
<div class="ex" data-staff="E3 F3 G3 A3 H3 C4 D4 E4 F4 G4 A4 H4 C5 D5 E5 F5 G5" data-text="Tytéž noty v osnově."></div>
${practice('find', 'Procvičit: nota → hmat')}
<h3>2. Noty na 6. a 5. struně</h3>
<p>Podle tónů na nejhlubších strunách se určují polohy akordů a stupnic. Vyplatí se je umět zpaměti až do 12. pražce.</p>
<div class="ex" data-fret="6:0 6:1 6:3 6:5 6:7 6:8 6:10 6:12 5:0 5:2 5:3 5:5 5:7 5:8 5:10 5:12"></div>
<h3>3. Pravidla pro orientaci</h3>
<ul>
<li><b>12. pražec</b> = stejné noty jako prázdné struny, o oktávu výš. Nad 12. pražcem se všechno opakuje.</li>
<li><b>5. pražec</b> zní stejně jako prázdná vyšší sousední struna. Výjimkou je <b>G struna</b>, kde je to <b>4. pražec</b> (podle toho se ladí).</li>
<li><b>Oktáva:</b> o 2 struny výš a o 2 pražce dál (na H struně o 3 pražce).</li>
<li>Stejný tón najdeš na hmatníku na více místech.</li>
</ul>
<div class="ex" data-fret="6:5 5:0 5:5 4:0 4:5 3:0 3:4 2:0 2:5 1:0" data-text="Ladění podle 5. (a 4.) pražce: dvojice znějí stejně."></div>
<div class="ex" data-fret="6:3 4:5 2:8 1:3" data-text="Tón g na čtyřech místech: 6. struna 3. pražec (g), 4. struna 5. pražec (g¹), 2. struna 8. pražec a 1. struna 3. pražec (obojí g²)."></div>
${practice('name', 'Procvičit: hmat → nota')}`
},
{
  title: 'Základní akordy na kytaře',
  sub: 'C, G, D, Em, Am, E, A, Dm',
  body: `
<p>Tyto „otevřené“ akordy (s prázdnými strunami) stačí na tisíce písní. Struny bez značky se buď hrají prázdné, nebo se na ně nehraje. To je uvedeno v popisku.</p>
<div class="ex" data-chord data-fret="5:3 4:2 3:0 2:1 1:0" data-text="<b>C dur</b> – c e g. 6. strunu nehraj."></div>
<div class="ex" data-chord data-fret="6:3 5:2 4:0 3:0 2:0 1:3" data-text="<b>G dur</b> – g h d. Všech 6 strun."></div>
<div class="ex" data-chord data-fret="4:0 3:2 2:3 1:2" data-text="<b>D dur</b> – d fis a. Jen 4 nejtenčí struny."></div>
<div class="ex" data-chord data-fret="6:0 5:2 4:2 3:0 2:0 1:0" data-text="<b>E moll</b> – e g h. Nejjednodušší akord, stačí dva prsty."></div>
<div class="ex" data-chord data-fret="5:0 4:2 3:2 2:1 1:0" data-text="<b>A moll</b> – a c e. Bez 6. struny."></div>
<div class="ex" data-chord data-fret="6:0 5:2 4:2 3:1 2:0 1:0" data-text="<b>E dur</b> – e gis h. Jako E moll, jen s gis na G struně."></div>
<div class="ex" data-chord data-fret="5:0 4:2 3:2 2:2 1:0" data-text="<b>A dur</b> – a cis e."></div>
<div class="ex" data-chord data-fret="4:0 3:2 2:3 1:1" data-text="<b>D moll</b> – d f a."></div>
<p><b>Tip:</b> Začni přechody <b>Em ↔ G</b>, <b>Am ↔ C</b> a <b>D ↔ G</b>. U akordu se podívej, které noty v něm hraješ. Tak propojíš akordy s teorií z kapitoly Akordy.</p>`
},
{
  title: 'Pentatonika',
  sub: 'Stupnice pro improvizaci',
  body: `
<p><b>Pentatonika</b> má jen 5 tónů. V moll pentatonice chybí 2. a 6. stupeň mollové stupnice. Nemá žádné „nebezpečné“ půltóny, proto zní dobře skoro nad čímkoli v dané tónině. Je to základ blues a rocku.</p>
<p>a moll pentatonika: <b>a – c – d – e – g</b>.</p>
<div class="ex" data-staff="A3 C4 D4 E4 G4 A4"></div>
<div class="ex" data-fret="6:5 6:8 5:5 5:7 4:5 4:7 3:5 3:7 2:5 2:8 1:5 1:8" data-text="Nejznámější tvar („box“) v V. poloze. Na každé struně 2 tóny, ukazovák drží 5. pražec."></div>
<p>Když tvar posuneš, změníš tóninu. Základní tón je na 6. struně pod ukazovákem: na 3. pražci g moll, na 12. pražci e moll.</p>
<p>Stejné tóny dávají <b>C dur pentatoniku</b> (c d e g a), jen se za základní považuje c.</p>`
},
];
