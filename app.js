// app.js — aplikacja: biezacy stan, wywolywanie regul, pokazywanie komunikatow,
// eksport i import tekstu JSON. Reguly gry sa w engine.js (ladowany wczesniej).
// Tu nie liczymy energii ani nie sprawdzamy warunkow gry. Robi to tylko przejscie().
// Nie deklarujemy tu ponownie nazw const/let z engine.js.

// Jedyne miejsce, w ktorym trzymamy biezacy stan. Zawsze go PODMIENIAMY, nigdy nie mutujemy.
let stan = stanPoczatkowy();

// ---------- Pokazywanie i przyjmowanie wyniku (dwie osobne czynnosci) ----------

function przyjmijWynik(wynik) {
  stan = wynik.stan;
}

function pokazWynik(wynik) {
  console.log(wynik.komunikat);
}

// Wspolna droga dla ruchu i akcji: reguly -> przyjecie stanu -> pokazanie tekstu.
function wykonajKomende(komenda) {
  const pokojPrzed = stan.pokoj;
  const wynik = przejscie(stan, komenda);

  przyjmijWynik(wynik);
  pokazWynik(wynik);

  // Po udanym ruchu pokazujemy opis nowego pokoju (o ile gra trwa).
  if (stan.pokoj !== pokojPrzed && !stan.koniec) {
    komendaRozejrzyj();
  }
}

// ---------- Opisy (czesc interfejsu, nie regul) ----------

function opisPokoju(s) {
  switch (s.pokoj) {
    case POKOJ_RECEPCJA:
      if (!s.karta) {
        return "Recepcja. Na ladzie ciemny monitor, kawa i kilka papierów. Obok leży karta dostępu.";
      }
      return "Recepcja. Na ladzie ciemny monitor, kawa i kilka papierów.";

    case POKOJ_MAGAZYN:
      if (s.bezpiecznik) {
        return "Magazyn. Graty i pajęczyny. Bezpiecznik masz już w kieszeni.";
      }
      if (s.zasilanie) {
        return "Magazyn. Graty i pajęczyny. Półka jest pusta, bezpiecznik już zamontowałeś.";
      }
      return "Magazyn. Graty, pajęczyny i... bezpiecznik na półce!";

    case POKOJ_SERWEROWNIA:
      if (s.zasilanie) {
        return "Serwerownia. Kable, kable i więcej kabli. Przynajmniej zasilanie działa.";
      }
      return "Serwerownia. Kable, kable i więcej kabli. Na ścianie wisi skrzynka, w której czegoś brakuje.";

    case POKOJ_WYJSCIE:
      if (s.zasilanie && s.karta) {
        return "Wyjście. Zasilanie działa, karta w kieszeni. Przed wolnością stoją tylko te drzwi.";
      }
      if (s.karta) {
        return "Wyjście. Kartę masz, ale bez zasilania te drzwi nie ruszą.";
      }
      if (s.zasilanie) {
        return "Wyjście. Prąd jest, ale brakuje karty. Rozejrzyj się po innych pokojach.";
      }
      return "Wyjście. Nadzieją tych drzwi nie otworzysz. Najpierw włącz prąd i znajdź kartę.";

    default:
      return "Nieznane pomieszczenie.";
  }
}

// ---------- Polecenia (trafiaja do obiektu gra) ----------

function komendaStart() {
  stan = stanPoczatkowy();
  console.log("UCIECZKA Z SERWEROWNI. Zasilanie awaryjne wystarczy na " + MAKS_ENERGIA + " tur.");
  komendaPomoc();
  komendaRozejrzyj();
}

function komendaPomoc() {
  console.log("Dostępne polecenia: gra.start(), gra.pomoc(), gra.status(), gra.mapa(), gra.rozejrzyj(),");
  console.log("  gra.idz(\"prawo\"), gra.idz(\"lewo\"), gra.akcja(\"karta\"), gra.akcja(\"bezpiecznik\"),");
  console.log("  gra.akcja(\"napraw\"), gra.akcja(\"wyjdz\"), gra.historia(), gra.eksportuj(), gra.importuj(tekst)");
  console.log("# Każdy udany ruch i każda wykonana akcja kosztuje dokładnie 1 energię.");
  console.log("# Mapa, opisy, pomoc i status są bezpłatne.");
  console.log("# Literówka, ruch w ścianę, ponowne zabranie przedmiotu i akcja bez spełnionych warunków są bezpłatne.");
  console.log("# Bezpiecznik znika z kieszeni po naprawie i nie wraca do magazynu.");
  console.log("# Wygrana ostatnim ruchem jest dozwolona. Po końcu gry ruch i akcje są zablokowane.");
  console.log("# Historia zapamiętuje zaakceptowane komendy (odmowy się nie liczą) i jest częścią zapisu.");
  console.log("# Zapis: console.log(gra.eksportuj()), wczytanie: gra.importuj(prompt(\"Wklej JSON\"))");
}

function komendaStatus() {
  console.log("Pokój: " + stan.pokoj + " (" + nazwaPokoju(stan.pokoj) + ")");
  console.log("Energia: " + stan.energia + "/" + MAKS_ENERGIA);
  console.log("Karta: " + (stan.karta ? "tak" : "nie"));
  console.log("Bezpiecznik w kieszeni: " + (stan.bezpiecznik ? "tak" : "nie"));
  console.log("Zasilanie: " + (stan.zasilanie ? "działa" : "wyłączone"));
  console.log("Zaakceptowane komendy: " + stan.historia.length);
  if (stan.koniec) {
    console.log("Gra: zakończona (" + (stan.wygrana ? "wygrana" : "przegrana") + ")");
  } else {
    console.log("Gra: trwa");
  }
}

function komendaMapa() {
  // Idziemy po INDEKSACH tablicy (od 0), a porownujemy z ID pokoju (od 1).
  for (let i = 0; i < POKOJE.length; i = i + 1) {
    let wiersz = POKOJE[i].id + ". " + POKOJE[i].nazwa;
    if (POKOJE[i].id === stan.pokoj) {
      wiersz = wiersz + " <-- jestes tutaj";
    }
    console.log(wiersz);
  }
}

function komendaRozejrzyj() {
  console.log(opisPokoju(stan));
}

// gra.idz przyjmuje tylko kierunki, a gra.akcja tylko akcje.
// Inne napisy odrzucamy tutaj, zanim trafia do regul (zero kosztu).
function komendaIdz(kierunek) {
  if (kierunek !== "lewo" && kierunek !== "prawo") {
    console.log("Nieznany kierunek: " + kierunek + ". Użyj \"lewo\" albo \"prawo\".");
    return;
  }
  wykonajKomende(kierunek);
}

function komendaAkcja(co) {
  if (co !== "karta" && co !== "bezpiecznik" && co !== "napraw" && co !== "wyjdz") {
    console.log("Nieznana akcja: " + co + ". Użyj \"karta\", \"bezpiecznik\", \"napraw\" albo \"wyjdz\".");
    return;
  }
  wykonajKomende(co);
}

// Wypisuje historie zaakceptowanych komend (bezplatnie) i zwraca JEJ KOPIE,
// zeby zmiana zwroconej tablicy w konsoli nie ruszyla biezacego stanu.
function komendaHistoria() {
  if (stan.historia.length === 0) {
    console.log("Historia jest pusta. Zaakceptowane komendy pojawią się tutaj.");
  } else {
    for (let i = 0; i < stan.historia.length; i = i + 1) {
      console.log((i + 1) + ". " + stan.historia[i]);
    }
  }
  return [...stan.historia];
}

// ---------- Eksport i import ----------

// Zwraca tekst JSON. Nie zapisuje pliku. Czlowiek kopiuje tekst do edytora.
function komendaEksportuj() {
  const pakiet = { wersja: WERSJA_ZAPISU, stan: kopiaStanu(stan) };
  return JSON.stringify(pakiet);
}

function odrzucImport(powod) {
  console.log("Import odrzucony: " + powod + " Stan gry bez zmian.");
  return false;
}

// Przyjmuje tekst JSON. Sprawdza CALOSC, a dopiero potem podmienia stan.
// Zwraca true (przyjeto) albo false (odmowa).
function komendaImportuj(tekst) {
  // prompt() oddaje null po anulowaniu.
  if (tekst === null) {
    return odrzucImport("anulowano okno importu.");
  }
  if (typeof tekst !== "string") {
    return odrzucImport("import wymaga tekstu JSON.");
  }
  if (tekst.trim() === "") {
    return odrzucImport("brak tekstu do wczytania.");
  }

  let pakiet;
  try {
    pakiet = JSON.parse(tekst);
  } catch (blad) {
    return odrzucImport("to nie jest poprawny JSON (" + blad.message + "). Wklej sam JSON, bez apostrofów na zewnątrz.");
  }

  if (pakiet === null || typeof pakiet !== "object" || Array.isArray(pakiet)) {
    return odrzucImport("zapis musi być obiektem {wersja, stan}.");
  }

  // Kandydat powstaje osobno. Biezacy stan podmieniamy dopiero po sprawdzeniu calosci.
  let kandydat = null;
  if (pakiet.wersja === WERSJA_ZAPISU) {
    if (!czyStan(pakiet.stan)) {
      return odrzucImport("stan w zapisie jest niepoprawny.");
    }
    kandydat = kopiaStanu(pakiet.stan);
  } else if (pakiet.wersja === 1) {
    // Zapis ze starszej wersji (bez historii komend): przyjmujemy go z pusta historia.
    if (!czyStanWersji1(pakiet.stan)) {
      return odrzucImport("stan w zapisie (wersja 1) jest niepoprawny.");
    }
    kandydat = stanZWersji1(pakiet.stan);
  } else {
    return odrzucImport("nieobsługiwana wersja zapisu (obsługiwane: 1 i " + WERSJA_ZAPISU + ").");
  }

  // Dopiero tutaj, po sprawdzeniu calosci: podmiana stanu nowym obiektem ze znanych pol.
  stan = kandydat;
  console.log("Wczytano zapis (wersja " + pakiet.wersja + "). Pokój: " + nazwaPokoju(stan.pokoj) + ", energia: " + stan.energia + ".");
  return true;
}

// ---------- Grupa polecen konsolowych ----------

window.gra = {
  start: komendaStart,
  pomoc: komendaPomoc,
  status: komendaStatus,
  mapa: komendaMapa,
  rozejrzyj: komendaRozejrzyj,
  idz: komendaIdz,
  akcja: komendaAkcja,
  historia: komendaHistoria,
  eksportuj: komendaEksportuj,
  importuj: komendaImportuj
};

komendaStart();
