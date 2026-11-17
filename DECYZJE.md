# DECYZJE — kontrakt zespołu (uzgodniony przed kodowaniem)

Zespół: 
- Wojtek (A), 
- Lis (B), 
- Marcel (C). 
Kontrakt uzgodniliśmy wspólnie, na podstawie `01_BRIEF.md`, `02_TECH.md` i zasad pierwszej gry (`js-collab-game`). Zmiana nazwy lub pola wymaga zgody całej trójki i aktualizacji wszystkich wywołań.

## Podział pracy (etap 1)

| Osoba | Odpowiada za | Branch |
|---|---|---|
| A — Wojtek | `engine.js`: stałe, kolekcja pokojów, `stanPoczatkowy()`, `przejscie()`, `czyStan()` | `feature/silnik` |
| B — Lis | `app.js`: bieżący stan, polecenia `gra.*`, eksport i import; `TESTY.md` | `feature/aplikacja` |
| C — Marcel | `index.html` i `README.md` | `feature/html-readme` |

Integruje Wojtek („osiołek"): scala branche po kolei na `master`.

## Wybrany kontrakt

**Stan rozgrywki** to jeden obiekt:

```js
{ pokoj: 1, energia: 10, karta: false, bezpiecznik: false, zasilanie: false, koniec: false, wygrana: false }
```

**Pokoje** to tablica `POKOJE` obiektów `{ id, nazwa }`: 1 Recepcja, 2 Magazyn, 3 Serwerownia, 4 Wyjście.
`id` to numer pokoju (od 1), a nie indeks tablicy (od 0). Pokój wyszukujemy po `id` (`znajdzPokoj(id)`).

**Komendy silnika:** `lewo`, `prawo`, `karta`, `bezpiecznik`, `napraw`, `wyjdz`.

**Funkcja reguł:** `przejscie(stanPrzed, komenda)` zwraca zawsze `{ stan, komunikat }`.
- Odmowa zwraca ten sam obiekt wejściowy (koszt 0). Sukces zwraca nowy obiekt.
- Koszt jednej energii nalicza wyłącznie wspólna ścieżka sukcesu w silniku. Aplikacja nie odejmuje energii.
- Zakończona gra: żadna komenda nie zmienia stanu.
- Wygrana przy ostatniej energii ma pierwszeństwo przed porażką.
- Teksty komunikatów są w stałej `KOMUNIKATY` w `engine.js`, osobno od reguł.

**Aplikacja** (`app.js`) trzyma bieżący stan w `let stan`, wywołuje `przejscie`, osobno przyjmuje wynik
(`przyjmijWynik`) i osobno go pokazuje (`pokazWynik`). Stan jest podmieniany, nigdy mutowany.

**Polecenia konsolowe** grupuje obiekt `gra`:
`gra.start()`, `gra.idz(kierunek)`, `gra.akcja(co)`, `gra.status()`, `gra.mapa()`, `gra.eksportuj()`, `gra.importuj(tekst)`.
Dodatkowo (dopisane za zgodą zespołu): `gra.pomoc()` i `gra.rozejrzyj()`, bo znane są z pierwszej gry.
Wewnętrzne funkcje aplikacji mają prefiks `komenda...`, żeby nie kolidować z globalnymi nazwami
przeglądarki (np. `status` jest już właściwością `window`).

**Format zapisu:** `{ "wersja": 1, "stan": { ... } }`, czysty tekst JSON (`JSON.stringify` / `JSON.parse`, bez `eval`).
Eksport zwraca string i niczego nie zapisuje. Import zwraca `true` lub `false` i pokazuje komunikat.

**Import** sprawdza po kolei: anulowanie (`null`), typ argumentu, pusty tekst, składnię JSON, opakowanie
(obiekt, nie `null`, nie tablica), wersję, `czyStan`. Dopiero po przyjęciu całości stan jest podmieniany
nowym obiektem ze znanymi polami. Dodatkowe, obce pola są ignorowane.

**Walidator `czyStan`:** istniejący całkowity numer pokoju; całkowita energia 0–10; pięć booleanów;
`bezpiecznik` i `zasilanie` nie są jednocześnie `true`; `wygrana` wymaga pokoju 4, karty i zasilania;
`koniec` jest równe `wygrana || energia === 0`. Walidator nie dowodzi osiągalności historii i nie jest antycheatem.

## Rozważona alternatywa

| | Wybrany wariant | Alternatywa |
|---|---|---|
| Model | Jeden obiekt `stan` + czysta funkcja `przejscie` | Osobne zmienne globalne, jak w pierwszej grze (`pokoj`, `energia`, ...) |
| Plus | Łatwy eksport do JSON, łatwe testy, brak ukrytych zależności | Najmniej kodu, zespół zna ten styl |
| Minus | Trzeba pamiętać o kopiowaniu zamiast mutowania | Zmienne trudno zapisać jako jedną całość, reguły zależą od ukrytego stanu |
| Powód wyboru | Brief wymaga stanu w obiekcie, zapisu JSON i funkcji reguł bez mutacji wejścia | |
