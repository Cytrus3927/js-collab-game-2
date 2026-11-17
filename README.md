# Ucieczka z serwerowni 2

Tekstowa gra w konsoli przeglądarki. Jest piątek, 16:59, w szkolnej serwerowni zgasło światło, a drzwi się
zablokowały. Znajdź kartę dostępu, weź bezpiecznik, przywróć zasilanie i otwórz wyjście. Masz **10 jednostek energii**.

To druga wersja gry: reguły są oddzielone od komunikatów, a postęp można zapisać jako tekst JSON i wczytać
ponownie. Autorzy: Wojtek, Lis, Marcel.

## Uruchomienie

1. Pobierz repozytorium i otwórz plik `index.html` dwuklikiem. Nie potrzeba Node, npm ani serwera.
2. Otwórz konsolę: **F12 → Console** (na części laptopów **Fn+F12**) albo z menu przeglądarki.
3. Wpisz `gra.pomoc()` i naciśnij Enter.

Po zmianie kodu zapisz plik i **odśwież stronę**. Odświeżenie zaczyna nową grę. Dodatkowe `undefined`
po komendzie nie jest błędem. Czerwony `ReferenceError` albo `SyntaxError` wymaga sprawdzenia.

## Zasady

- Pokoje tworzą korytarz: 1 Recepcja, 2 Magazyn, 3 Serwerownia, 4 Wyjście. Nie ma teleportacji.
- Każdy **udany** ruch i każda **wykonana** akcja kosztuje dokładnie 1 energię.
- Mapa, opisy, pomoc, status, eksport i import nic nie kosztują.
- Literówka, ruch w ścianę, ponowne zabranie przedmiotu i akcja bez spełnionych warunków są bezpłatne.
- Bezpiecznik znika z kieszeni po naprawie i nie odradza się w magazynie.
- Przy energii 0 przegrywasz, chyba że właśnie otworzyłeś wyjście. Wygrana ostatnim ruchem jest dozwolona.
- Po końcu gry ruch i akcje są zablokowane. Zapis i `gra.start()` nadal działają.

| Pokój | Co można zrobić |
|---|---|
| 1 Recepcja | `gra.akcja("karta")` zabiera kartę |
| 2 Magazyn | `gra.akcja("bezpiecznik")` zabiera bezpiecznik |
| 3 Serwerownia | `gra.akcja("napraw")` montuje posiadany bezpiecznik i przywraca zasilanie |
| 4 Wyjście | `gra.akcja("wyjdz")` otwiera drzwi, gdy masz kartę i działa zasilanie |

## Polecenia

Napisy podajemy w cudzysłowach, małymi literami, bez polskich znaków.

| Polecenie | Działanie |
|---|---|
| `gra.start()` | Nowa gra (reset), pomoc i opis pokoju |
| `gra.pomoc()` | Lista poleceń i zasad |
| `gra.status()` | Pokój, energia, karta, bezpiecznik, zasilanie, stan gry |
| `gra.mapa()` | Cztery pokoje ze znacznikiem aktualnego |
| `gra.rozejrzyj()` | Opis pokoju, w którym jesteś |
| `gra.idz("prawo")`, `gra.idz("lewo")` | Przejście do sąsiedniego pokoju |
| `gra.akcja("karta")`, `"bezpiecznik"`, `"napraw"`, `"wyjdz"` | Czynność w pokoju |
| `gra.eksportuj()` | Zwraca tekst JSON z postępem (nie zapisuje pliku) |
| `gra.importuj(tekst)` | Wczytuje postęp z tekstu JSON, zwraca `true` albo `false` |

## Zapis i wczytanie postępu (krok po kroku)

Gra nie zapisuje plików sama. Tekst przenosisz do pliku ręcznie.

**Zapis**

1. Zagraj kilka ruchów.
2. W konsoli wpisz: `console.log(gra.eksportuj())`. Pojawi się jedna linia tekstu zaczynająca się od `{"wersja":`.
   Użyj `console.log`, bo samo `gra.eksportuj()` pokaże tekst w cudzysłowach z ukośnikami.
3. Zaznacz **całą** linię JSON (bez etykiety wiersza konsoli i bez końcowego `undefined`) i skopiuj ją
   (Ctrl+C). W niektórych przeglądarkach: prawy przycisk → „Copy string contents".
4. Otwórz zwykły edytor tekstu (Notatnik, VS Code), wklej tekst i zapisz plik jako `postep.json`,
   np. na pendrivie.

**Wczytanie**

1. Odśwież stronę (nowa gra) albo uruchom ją na innym komputerze.
2. Otwórz `postep.json` w edytorze, zaznacz całą zawartość i skopiuj.
3. W konsoli wpisz: `gra.importuj(prompt("Wklej JSON z postep.json"))` i naciśnij Enter.
4. W oknie, które się pojawi, wklej **sam JSON**, bez polecenia `gra.importuj` i bez apostrofów na zewnątrz.
   Kliknij OK. Konsola potwierdzi wczytanie. Sprawdź `gra.status()`.

**Gdy coś pójdzie źle**

Import niczego nie zmienia w trwającej grze, jeśli tekst jest błędny: urwany JSON, zła wersja, zły typ pola,
numer pokoju spoza mapy, sprzeczne wartości, pusty tekst albo anulowane okno. Konsola pokaże powód odmowy,
a `gra.importuj` zwróci `false`. Przyjęcie zapisu zmienia wszystkie pola naraz, nigdy częściowo.

## Pliki

| Plik | Zawartość |
|---|---|
| `index.html` | Strona ładująca `engine.js` i `app.js` (zwykłe skrypty z `defer`, w tej kolejności) |
| `engine.js` | Reguły: stałe, pokoje, komunikaty, `stanPoczatkowy`, `przejscie`, `czyStan`. Bez konsoli i interfejsu |
| `app.js` | Aplikacja: bieżący stan, polecenia `gra.*`, eksport i import |
| `DECYZJE.md` | Uzgodniony kontrakt zespołu i rozważona alternatywa |
| `TESTY.md` | Próby odbioru: wejście, działanie, wynik oczekiwany i faktyczny |
| `01_BRIEF.md`, `02_TECH.md`, `03_PROWADZENIE.md` | Polecenie i pomoc do zadania |

Ważne: `engine.js` i `app.js` współdzielą jedno środowisko strony. Podział na pliki jest podziałem
odpowiedzialności, nie izolacją zmiennych. Nie deklarujemy tych samych nazw `const`/`let` w obu plikach.

## Gdzie co zmienić

- **Warunki gry i koszt:** `przejscie()` w `engine.js` (tylko tam zapada decyzja i zmienia się stan).
- **Treść komunikatów reguł:** stała `KOMUNIKATY` w `engine.js`.
- **Opisy pokoi, pomoc i status:** `app.js`.
- **Walidacja zapisu:** `czyStan()` w `engine.js` oraz `komendaImportuj()` w `app.js`.

## Praca w zespole

Branche: `feature/silnik` (Wojtek), `feature/aplikacja` (Lis), `feature/html-readme` (Marcel). Integrację na `main`
wykonuje Wojtek. Szczegóły kontraktu: `DECYZJE.md`.
