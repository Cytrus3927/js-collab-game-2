# Próby odbioru

Każdą próbę zaczynamy od świeżo otwartej strony (odświeżenie) albo od `gra.start()`.
Kolumna „Działanie" zawiera polecenia do wpisania w konsoli. Format zapisu w tym etapie: `wersja: 1`.

| Wymaganie | Stan początkowy | Działanie | Wynik oczekiwany | Wynik faktyczny | Kto sprawdził |
|---|---|---|---|---|---|
| T01 Stan początkowy jest nowym obiektem | świeża strona | `const a = stanPoczatkowy(); const b = stanPoczatkowy(); a.energia = 5; [a !== b, b.energia]` | `true`, `10` | `true`, `10` | Lis |
| T02 Lewa granica mapy | pokój 1, energia 10 | `gra.idz("lewo")`, potem `gra.status()` | stan i energia bez zmian, komunikat ściany | pokój 1, energia 10, „Ściana. Nie możesz iść w tę stronę." | Lis |
| T03 Ruch kosztuje 1 energię | pokój 1, energia 10 | `gra.idz("prawo")` | pokój 2, energia 9 | pokój 2, energia 9 | Lis |
| T04 Nieznany kierunek, nieznana akcja, zła grupa | pokój 1, energia 10 | `gra.idz("gora")`, `gra.akcja("skacz")`, `gra.idz("karta")`, `gra.akcja("prawo")` | wszystko odrzucone, zero kosztu | pokój 1, energia 10; silnik dla nieznanej komendy: „Nieznana komenda: tanczyc" | Lis |
| T05 Przedmiot już zabrany | pokój 1 | `gra.akcja("karta")` dwa razy | pierwsza: energia 9; druga: bez duplikatu i bez kosztu | po 1.: 9, po 2.: 9, „Masz już kartę. Nie możesz zabrać kolejnej." | Lis |
| T06 Przedmiot w złym pokoju | pokój 1, potem 2 | `gra.akcja("bezpiecznik")` w pokoju 1; `gra.idz("prawo")`; `gra.akcja("karta")` w pokoju 2 | obie odmowy bez kosztu | bez zmian poza ruchem, energia 9 | Lis |
| T07 Naprawa bez przedmiotu | pokój 3, brak bezpiecznika | `gra.akcja("napraw")` | odmowa, stan bez zmian | „Nie masz bezpiecznika do zamontowania.", stan identyczny | Lis |
| T08 Właściwe miejsce i przedmiot: naprawa | pokój 3, bezpiecznik w kieszeni, energia 7 | `gra.akcja("napraw")` | zasilanie włączone, bezpiecznik zużyty, energia 6 | zasilanie `true`, bezpiecznik `false`, energia 7 → 6 | Lis |
| T09 Bezpiecznik nie odradza się | po naprawie, pokój 2 | `gra.akcja("bezpiecznik")` | odmowa, bez kosztu | „Półka jest pusta. Bezpiecznik został już zamontowany.", energia bez zmian | Lis |
| T10 Wyjście bez wymagań | pokój 4 bez zasilania / bez karty | `gra.akcja("wyjdz")` | odmowa, bez kosztu, brak końca gry | „Brak zasilania. Drzwi się nie otworzą." / „Nie masz karty dostępu. Drzwi się nie otworzą." | Lis |
| T11 Pełne wygranie gry | nowa gra | karta, prawo, bezpiecznik, prawo, napraw, prawo, wyjdz | wygrana, koniec, energia 3 (7 czynności) | wygrana `true`, koniec `true`, energia 3 | Lis |
| T12 Wygrana ma pierwszeństwo przed porażką | pokój 4, energia 1, karta, zasilanie | `przejscie(s, "wyjdz")` na takim stanie | wygrana, koniec, energia 0, brak komunikatu porażki | wygrana `true`, koniec `true`, energia 0, tekst bez „PRZEGRANA" | Lis |
| T13 Porażka i zakończona gra | nowa gra | 5 × (`gra.idz("prawo")`, `gra.idz("lewo")`), potem `gra.idz("prawo")` i `gra.akcja("karta")` | po 10 ruchach energia 0, porażka; kolejne komendy bez zmian | energia 0, koniec `true`, wygrana `false`; stan identyczny po kolejnych komendach | Lis |
| T14 Po końcu gry działają eksport i reset | gra zakończona porażką | `gra.eksportuj()`, `gra.start()` | eksport zwraca tekst; start przywraca energię, pozycję i flagi | eksport OK (`koniec: true` w tekście); po starcie pokój 1, energia 10, flagi `false` | Lis |
| T15 Silnik nie mutuje wejścia | poprawny stan | `przejscie` z komendami `prawo`, `karta`, `lewo`, `xyz` na tym samym obiekcie, porównanie `JSON.stringify` przed i po | oryginał niezmieniony | identyczny po 4 wywołaniach | Lis |
| T16 Powtarzalność reguł | poprawny stan | dwa razy `przejscie(s, "karta")` na tym samym `s` | ten sam wynik | identyczny | Lis |
| T17 Mapa | pokój 2 | `gra.mapa()` | 4 wiersze, jeden znacznik, bez kosztu | `1. Recepcja`, `2. Magazyn <-- jestes tutaj`, `3. Serwerownia`, `4. Wyjście`; energia bez zmian | Lis |
| T18 Informacje są bezpłatne | dowolny | `gra.status()`, `gra.pomoc()`, `gra.rozejrzyj()`, `gra.mapa()` | stan bez zmian | identyczny | Lis |
| T20 Eksport | nowa gra | `console.log(gra.eksportuj())` | jedna linia JSON z numerem wersji i stanem | `{"wersja":1,"stan":{"pokoj":1,"energia":10,"karta":false,"bezpiecznik":false,"zasilanie":false,"koniec":false,"wygrana":false}}` | Marcel |
| T21 Postęp zapisany i wczytany | pokój 3, energia 6, karta i bezpiecznik w kieszeni | `gra.eksportuj()` → tekst do edytora i z powrotem; `gra.start()`; `gra.importuj(tekst)` | `true`, odtworzone dokładnie te same dane | `true`, stan identyczny (pokój 3, energia 6, karta `true`, bezpiecznik `true`) | Marcel |
| T22 Aktywna rozgrywka, urwany JSON | pokój 2, karta | `gra.importuj("{")` | `false`, komunikat błędu, stan bez zmian | `false`, „to nie jest poprawny JSON … Wklej sam JSON, bez apostrofów na zewnątrz", stan bez zmian | Marcel |
| T23 Zła wersja | pokój 2, karta | import pakietu z `wersja: 99`; z `wersja: "1"` (tekst) | `false`, stan bez zmian | oba: `false`, „nieobsługiwana wersja zapisu (potrzebna 1)" | Marcel |
| T25 Zły typ pola | pokój 2, karta | import ze `energia: "5"`; z `karta: "tak"` przy poprawnym pokoju | `false`, bez częściowej podmiany | `false`, „stan w zapisie jest niepoprawny", stan bez zmian | Marcel |
| T26 Anulowane okno | pokój 2, karta | `gra.importuj(null)` (tak zwraca `prompt` po anulowaniu) | `false`, czytelna odmowa | `false`, „anulowano okno importu." | Marcel |
| T27 Brak tekstu | pokój 2, karta | `gra.importuj("")`, `gra.importuj("   ")`, `gra.importuj(undefined)`, `gra.importuj(42)` | `false`, odmowa, stan bez zmian | `false`; „brak tekstu do wczytania." / „import wymaga tekstu JSON." | Marcel |
| T31 Brak pola | pokój 2, karta | import stanu bez pola `zasilanie` | `false` | `false`, „stan w zapisie jest niepoprawny" | Marcel |
| T32 Pokój spoza mapy | pokój 2, karta | import z `pokoj: 99`; z `pokoj: 2.5` | `false` | oba `false` | Marcel |
| T33 Sprzeczne wartości | pokój 2, karta | import z `bezpiecznik: true` i `zasilanie: true` | `false` | `false` | Marcel |
| T34 Wygrana bez warunków | pokój 2, karta | import z `wygrana: true`, `koniec: true` w pokoju 2 | `false` | `false` | Marcel |
| T35 Koniec niezgodny z wygraną i energią | pokój 2, karta | import z `koniec: true`, energia 8, bez wygranej | `false` | `false` | Marcel |
| T36 Zakres energii | pokój 2, karta | import z energią 11, -1, 2.5 | `false` dla każdej | `false` ×3 | Marcel |
| T39 Zły kształt opakowania | pokój 2, karta | import: `{"wersja":1,"stan":null}`; stan jako `[]`; całość jako `[]`; całość jako `null` | `false`, bez błędu w konsoli | `false` ×4, komunikaty „stan … niepoprawny" / „zapis musi być obiektem {wersja, stan}" | Marcel |
| T43 Apostrofy wklejone z konsoli | pokój 2, karta | import tekstu otoczonego apostrofami `'{...}'` | `false`, podpowiedź | `false`, „… Wklej sam JSON, bez apostrofów na zewnątrz." | Marcel |
| T46 Obce pole | świeża strona | import poprawnego pakietu z dodatkowym polem `cheat` w stanie i `dodatek` obok stanu | `true`, obce pola nie trafiają do stanu | `true`, klucze stanu: `pokoj,energia,karta,bezpiecznik,zasilanie,koniec,wygrana` | Marcel |
| T47 Błąd nie zmienia danych (bez odświeżania) | karta zabrana | `gra.status()`, `gra.importuj("{")`, `gra.status()` | oba statusy takie same | identyczne | Marcel |
| T48 Import po zakończonej grze | gra zakończona porażką, wcześniej zapisany stan | `gra.importuj(zapis)`, potem `gra.idz("prawo")` | gra znowu działa | `true`, ruch wykonany (pokój 2) | Marcel |
| T49 Walidator akceptuje stany z gry | nowa gra | `czyStan(stan)` po każdej z 7 czynności pełnej wygranej | `true` za każdym razem | `true` ×7 | Marcel |

**Test regresji** (zachowanie z pierwszej gry, którego nowa konstrukcja nie może zepsuć): T02 (lewa granica),
T05 (brak duplikatu przedmiotu), T10 (wyjście wymaga karty i zasilania), T13 (porażka po dziesięciu ruchach).

## Odtworzenie

Wersja Node: nie dotyczy (projekt działa bez Node).
Wersje pakietów / lockfile: nie dotyczy (bez npm).
Komendy: otwórz `index.html` dwuklikiem, F12 → Console i wpisuj polecenia z kolumny „Działanie".
System i przeglądarka: (uzupełnij przed oddaniem, np. Windows 11 + Chrome).

## Błąd do poprawy

Usterka znaleziona przy uruchomieniu pierwszej gry (`js-collab-game`) w ramach etapu „Kontrakt i działający początek".
W nowej grze jest naprawiona, a poniższe kroki są jej próbą regresji.

Najkrótsze kroki odtworzenia (stara gra): `start(); idz("lewo"); pokoj`
Oczekiwane: ściana, `pokoj` nadal 1, energia 10.
Otrzymane: `pokoj` równe 0 i energia 9, brak komunikatu ściany.
Hipoteza: warunek ściany w `idz` porównuje napis `kierunek` (np. `"lewo"`) z liczbami 1 i 4 zamiast
kandydata `nastepnyPokoj`; porównanie napisu z liczbą jest zawsze fałszywe, więc ściana nigdy nie działa.
Druga usterka tej samej gry: w `akcja("wyjdz")` zapis `karta = true && ...` jest przypisaniem, a nie porównaniem,
więc nadpisuje zmienną `karta` (gracz bez karty z zasilaniem w pokoju 4 wygrywa, a gracz z kartą w złym pokoju ją traci).
Wynik ponownej próby po poprawce (nowa gra): `gra.idz("lewo")` w pokoju 1 daje „Ściana. Nie możesz iść w tę stronę."
przy energii 10 (T02); `przejscie` sprawdza kandydata przed zmianą stanu, a warunki wyjścia używają `!`/`===` (T10, T11).
