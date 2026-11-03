// ENGINE.JS - reguly gry. Nie dotyka konsoli ani interfejsu.
// Funkcje tutaj nie wypisuja tekstu i nie zmieniaja przekazanych obiektow.

const MAKS_ENERGIA = 10;
const WERSJA_ZAPISU = 1;
const KIERUNKI = ["lewo", "prawo"];
const AKCJE = ["karta", "bezpiecznik", "napraw", "wyjdz"];

// id to NIE indeks tablicy. id 0 to tylko "nieznane" - nie jest prawdziwym pokojem.
const Pokoje = [
    {id: 0, nazwa: "Nieznane pomieszczenie"},
    {id: 1, nazwa: "Recepcja"},
    {id: 2, nazwa: "Magazyn"},
    {id: 3, nazwa: "Serwerownia"},
    {id: 4, nazwa: "Wyjscie"},
];

// Zwraca pokoj o danym id albo wpis "nieznane" (id 0).
function znajdzPokoj(id) {
    const pokoj = Pokoje.find(function (p) { return p.id === id; });
    return pokoj ? pokoj : Pokoje[0];
}

// Czy id to prawdziwy pokoj (1..4)?
function czyPokoj(id) {
    return Number.isInteger(id) && id >= 1 && Pokoje.some(function (p) { return p.id === id; });
}

function stanPoczatkowy() {
    return {
        pokoj: 1,
        energia: MAKS_ENERGIA,
        karta: false,
        bezpiecznik: false,
        zasilanie: false,
        koniec: false,
        wygrana: false
    };
}

// Opis pokoju zgodny ze stanem. Zwraca tekst (nic nie wypisuje).
function opisPokoju(stan) {
    switch (stan.pokoj) {
        case 1:
            return stan.karta
                ? "Recepcja. Na ladzie ciemny monitor, kawa i kilka papierow."
                : "Recepcja. Na ladzie ciemny monitor, kawa i kilka papierow. Obok lezy karta dostepu.";
        case 2:
            if (!stan.bezpiecznik && !stan.zasilanie) {
                return "Magazyn. Graty, pajeczyny i... bezpiecznik!";
            }
            if (stan.bezpiecznik) {
                return "Magazyn. Graty i pajeczyny. Bezpiecznik masz juz w kieszeni.";
            }
            return "Magazyn. Graty i pajeczyny. Bezpiecznik zabrales i zamontowales.";
        case 3:
            return stan.zasilanie
                ? "Serwerownia. Kable, kable i wiecej kabli. Zasilanie dziala."
                : "Serwerownia. Kable, kable i wiecej kabli. Na scianie wisi skrzynka, wyglada jakby czegos w niej brakowalo.";
        case 4:
            if (stan.zasilanie && stan.karta) {
                return "Wyjscie. Zasilanie jest, karta w kieszeni. Przed wolnoscia stoja tylko te drzwi.";
            }
            if (stan.karta) {
                return "Wyjscie. Karte masz, ale bez zasilania te drzwi nie ruszą.";
            }
            if (stan.zasilanie) {
                return "Wyjscie. Prad jest, ale brakuje karty.";
            }
            return "Wyjscie. Najpierw wlacz prad i znajdz karte.";
        default:
            return "Nieznane pomieszczenie.";
    }
}

// Wspolna sciezka sukcesu: tu (i tylko tu) naliczany jest koszt 1 energii.
// Wygrana ma pierwszenstwo przed porazka.
function rozlicz(stan, komunikat) {
    const nowy = {...stan, energia: stan.energia - 1};
    if (nowy.wygrana) {
        nowy.koniec = true;
        return {stan: nowy, komunikat: komunikat + " WYGRANA! Mozesz wrocic do domu."};
    }
    if (nowy.energia === 0) {
        nowy.koniec = true;
        return {stan: nowy, komunikat: komunikat + " PRZEGRANA. Zasilanie awaryjne padlo."};
    }
    return {stan: nowy, komunikat: komunikat};
}

function odmowa(stan, komunikat) {
    return {stan: stan, komunikat: komunikat};
}

// GLOWNA FUNKCJA REGUL: (stan, komenda) -> {stan, komunikat}
// Nie mutuje wejscia. Przy odmowie zwraca ten sam obiekt stanu, przy sukcesie nowy.
function przejscie(stanPrzed, komenda) {
    if (stanPrzed.koniec) {
        return odmowa(stanPrzed, "Gra zakonczona. Uzyj gra.start(), aby zagrac ponownie.");
    }

    switch (komenda) {
        case "lewo":
        case "prawo": {
            const cel = stanPrzed.pokoj + (komenda === "prawo" ? 1 : -1);
            if (!czyPokoj(cel)) {
                return odmowa(stanPrzed, "Sciana. Nie mozesz tam isc.");
            }
            return rozlicz({...stanPrzed, pokoj: cel}, "Idziesz do: " + znajdzPokoj(cel).nazwa + ".");
        }
        case "karta":
            if (stanPrzed.pokoj !== 1 || stanPrzed.karta) {
                return odmowa(stanPrzed, "Tutaj nie ma karty do zabrania.");
            }
            return rozlicz({...stanPrzed, karta: true}, "Zabierasz karte dostepu.");
        case "bezpiecznik":
            if (stanPrzed.pokoj !== 2 || stanPrzed.bezpiecznik || stanPrzed.zasilanie) {
                return odmowa(stanPrzed, "Tutaj nie ma bezpiecznika do zabrania.");
            }
            return rozlicz({...stanPrzed, bezpiecznik: true}, "Zabierasz bezpiecznik.");
        case "napraw":
            if (stanPrzed.pokoj !== 3 || !stanPrzed.bezpiecznik || stanPrzed.zasilanie) {
                return odmowa(stanPrzed, "Nie mozesz teraz naprawic zasilania.");
            }
            return rozlicz({...stanPrzed, bezpiecznik: false, zasilanie: true},
                "Montujesz bezpiecznik. Zasilanie wrocilo!");
        case "wyjdz":
            if (stanPrzed.pokoj !== 4 || !stanPrzed.karta || !stanPrzed.zasilanie) {
                return odmowa(stanPrzed, "Nie mozesz teraz otworzyc drzwi. Potrzebujesz karty, zasilania i pokoju 4.");
            }
            return rozlicz({...stanPrzed, wygrana: true}, "Otwierasz drzwi i uciekasz z serwerowni!");
        default:
            return odmowa(stanPrzed, "Nieznana komenda: " + komenda);
    }
}

// Walidator stanu (uzywany przy imporcie). Kolejnosc sprawdzen chroni przed odczytem pol null.
function czyStan(wartosc) {
    if (wartosc === null || typeof wartosc !== "object" || Array.isArray(wartosc)) {
        return false;
    }
    if (!czyPokoj(wartosc.pokoj)) return false;
    if (!Number.isInteger(wartosc.energia) || wartosc.energia < 0 || wartosc.energia > MAKS_ENERGIA) return false;

    const flagi = ["karta", "bezpiecznik", "zasilanie", "koniec", "wygrana"];
    for (let i = 0; i < flagi.length; i++) {
        if (typeof wartosc[flagi[i]] !== "boolean") return false;
    }

    if (wartosc.bezpiecznik && wartosc.zasilanie) return false;
    if (wartosc.wygrana && !(wartosc.pokoj === 4 && wartosc.karta && wartosc.zasilanie)) return false;
    if (wartosc.koniec !== (wartosc.wygrana || wartosc.energia === 0)) return false;
    return true;
}