// APP.JS - bierzacy stan, wypisywanie komunikatow, eksport/import.
// Zaklada, ze engine.js zostal zaladowany wczesniej (patrz index.html).
// Nie deklarujemy tu nazw z engine.js (Pokoje, przejscie, czyStan, ...).

let stan = stanPoczatkowy();

// Wykonuje komende w silniku, przyjmuje wynik i pokazuje komunikat.
function wykonaj(komenda) {
    const wynik = przejscie(stan, komenda);
    const zmieniono = wynik.stan !== stan; // przy odmowie silnik zwraca ten sam obiekt
    stan = wynik.stan;
    console.log(wynik.komunikat);
    if (zmieniono && !stan.koniec && (komenda === "lewo" || komenda === "prawo")) {
        console.log(opisPokoju(stan));
    }
    if (zmieniono && !stan.koniec) {
        console.log("Pozostala energia: " + stan.energia);
    }
}

function pokazPomoc() {
    console.log('Dostepne: gra.start(), gra.pomoc(), gra.status(), gra.mapa(), gra.rozejrzyj(), gra.idz("prawo"), gra.akcja("karta")');
    console.log('Kierunki: "lewo", "prawo". Akcje: "karta", "bezpiecznik", "napraw", "wyjdz".');
    console.log("Zapis: console.log(gra.eksportuj()) -> skopiuj JSON do pliku postep.json.");
    console.log('Wczytanie: gra.importuj(prompt("Wklej JSON z postep.json"))');
    console.log("Kazdy udany ruch i kazda wykonana akcja kosztuje 1 energii. Odmowy i ogladanie informacji sa darmowe.");
    console.log("Przy energii 0 przegrywasz, chyba ze wlasnie otworzyles wyjscie. Po koncu gry dziala tylko start(), status(), eksport i import.");
}

function pokazStatus() {
    console.log("Pokoj: " + stan.pokoj + " (" + znajdzPokoj(stan.pokoj).nazwa + ")");
    console.log("Energia: " + stan.energia + "/" + MAKS_ENERGIA);
    console.log("Karta: " + (stan.karta ? "tak" : "nie"));
    console.log("Bezpiecznik: " + (stan.bezpiecznik ? "tak" : "nie"));
    console.log("Zasilanie: " + (stan.zasilanie ? "dziala" : "nie dziala"));
    console.log("Stan gry: " + (stan.koniec ? (stan.wygrana ? "wygrana" : "przegrana") : "trwa"));
}

function pokazMape() {
    for (let i = 0; i < Pokoje.length; i++) {
        const p = Pokoje[i];
        if (p.id === 0) continue; // "nieznane" nie jest pokojem mapy
        console.log(p.id + " " + p.nazwa + (p.id === stan.pokoj ? " <-- jestes tutaj" : ""));
    }
}

function resetuj() {
    stan = stanPoczatkowy();
    console.log("UCIECZKA Z SERWEROWNI. Zasilanie awaryjne wystarczy na " + MAKS_ENERGIA + " tur.");
    pokazPomoc();
    console.log(opisPokoju(stan));
}

function idzKomenda(kierunek) {
    if (!KIERUNKI.includes(kierunek)) {
        console.log('Nieznany kierunek: ' + kierunek + '. Uzyj "lewo" lub "prawo".');
        return;
    }
    wykonaj(kierunek);
}

function akcjaKomenda(co) {
    if (!AKCJE.includes(co)) {
        console.log("Nieznana akcja: " + co + '. Dostepne: "karta", "bezpiecznik", "napraw", "wyjdz".');
        return;
    }
    wykonaj(co);
}

// Eksport zwraca TEKST (nie zapisuje pliku). Uzytkownik kopiuje go do postep.json.
function eksportuj() {
    return JSON.stringify({wersja: WERSJA_ZAPISU, stan: stan});
}

// Import: najpierw cala walidacja, dopiero potem podmiana stanu.
// Zwraca true (przyjeto) albo false (odmowa; stan bez zmian).
function importuj(tekst) {
    if (tekst === null || tekst === undefined) {
        console.log("Import anulowany. Stan bez zmian.");
        return false;
    }
    if (typeof tekst !== "string") {
        console.log("Import odrzucony: oczekiwano tekstu JSON. Stan bez zmian.");
        return false;
    }
    if (tekst.trim() === "") {
        console.log("Import odrzucony: pusty tekst. Stan bez zmian.");
        return false;
    }

    let pakiet;
    try {
        pakiet = JSON.parse(tekst);
    } catch (blad) {
        console.log("Import odrzucony: niepoprawny JSON (" + blad.message + "). Stan bez zmian.");
        return false;
    }

    if (pakiet === null || typeof pakiet !== "object" || Array.isArray(pakiet)) {
        console.log("Import odrzucony: zly format pakietu. Stan bez zmian.");
        return false;
    }
    if (pakiet.wersja !== WERSJA_ZAPISU) {
        console.log("Import odrzucony: nieobslugiwana wersja zapisu (" + pakiet.wersja + "). Stan bez zmian.");
        return false;
    }
    if (!czyStan(pakiet.stan)) {
        console.log("Import odrzucony: niepoprawny stan gry. Stan bez zmian.");
        return false;
    }

    // Przepisujemy tylko znane pola - obce dodatkowe pola nie trafiaja do stanu.
    const nowy = {
        pokoj: pakiet.stan.pokoj,
        energia: pakiet.stan.energia,
        karta: pakiet.stan.karta,
        bezpiecznik: pakiet.stan.bezpiecznik,
        zasilanie: pakiet.stan.zasilanie,
        koniec: pakiet.stan.koniec,
        wygrana: pakiet.stan.wygrana
    };
    stan = nowy;
    console.log("Zapis wczytany.");
    console.log(opisPokoju(stan));
    return true;
}

window.gra = {
    start: resetuj,
    pomoc: pokazPomoc,
    status: pokazStatus,
    mapa: pokazMape,
    rozejrzyj: function () { console.log(opisPokoju(stan)); },
    idz: idzKomenda,
    akcja: akcjaKomenda,
    eksportuj: eksportuj,
    importuj: importuj
};

gra.start();