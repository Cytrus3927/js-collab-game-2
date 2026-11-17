// engine.js — reguly gry "Ucieczka z serwerowni".
// Tutaj NIE ma console.log ani dotykania strony: funkcje dostaja dane i oddaja wynik.
// Plik laduje sie PRZED app.js (oba z defer), wiec app.js widzi wszystkie nazwy stad.
// UWAGA: podzial na pliki to podzial odpowiedzialnosci, a nie izolacja zmiennych.
// Dlatego nazw const/let z tego pliku nie deklarujemy ponownie w app.js.

const MAKS_ENERGIA = 10;
const WERSJA_ZAPISU = 1;

const POKOJ_RECEPCJA = 1;
const POKOJ_MAGAZYN = 2;
const POKOJ_SERWEROWNIA = 3;
const POKOJ_WYJSCIE = 4;

// Kolekcja pomieszczen. UWAGA: id to numer pokoju (od 1), a NIE indeks w tablicy (od 0).
const POKOJE = [
  { id: 1, nazwa: "Recepcja" },
  { id: 2, nazwa: "Magazyn" },
  { id: 3, nazwa: "Serwerownia" },
  { id: 4, nazwa: "Wyjście" }
];

// Wszystkie teksty zwracane przez reguly sa w jednym miejscu.
// Zmiana tresci komunikatu nie wymaga dotykania regul w przejscie().
const KOMUNIKATY = {
  koniecGry: "Gra jest zakończona. Wpisz gra.start(), aby zacząć od nowa.",
  nieznanaKomenda: "Nieznana komenda: ",
  sciana: "Ściana. Nie możesz iść w tę stronę.",
  ruch: "Przechodzisz do: ",
  kartaOk: "Zabierasz kartę dostępu.",
  kartaMasz: "Masz już kartę. Nie możesz zabrać kolejnej.",
  kartaBrak: "W tym pokoju nie ma karty.",
  bezpiecznikOk: "Zabierasz bezpiecznik z półki.",
  bezpiecznikMasz: "Masz już bezpiecznik. Nie możesz zabrać kolejnego.",
  bezpiecznikZuzyty: "Półka jest pusta. Bezpiecznik został już zamontowany.",
  bezpiecznikBrak: "W tym pokoju nie ma bezpiecznika.",
  naprawOk: "Montujesz bezpiecznik. Zasilanie wróciło!",
  naprawJuz: "Zasilanie już działa. Nie ma czego naprawiać.",
  naprawZlyPokoj: "Tu nie ma czego naprawiać. Skrzynka z bezpiecznikiem jest w serwerowni.",
  naprawBrakBezpiecznika: "Nie masz bezpiecznika do zamontowania.",
  wyjdzZlyPokoj: "Drzwi wyjściowe są w pokoju 4. Tu nie możesz wyjść.",
  wyjdzBrakKarty: "Nie masz karty dostępu. Drzwi się nie otworzą.",
  wyjdzBrakZasilania: "Brak zasilania. Drzwi się nie otworzą.",
  wygrana: "WYGRANA! Przykładasz kartę, drzwi się otwierają. Możesz wrócić do domu.",
  porazka: "PRZEGRANA. Zasilanie awaryjne padło. Wpisz gra.start().",
  energia: "Pozostała energia: "
};

// Zwraca obiekt pokoju o danym id albo null. Szukamy po id, nie po indeksie.
function znajdzPokoj(id) {
  for (let i = 0; i < POKOJE.length; i = i + 1) {
    if (POKOJE[i].id === id) {
      return POKOJE[i];
    }
  }
  return null;
}

function nazwaPokoju(id) {
  const pokoj = znajdzPokoj(id);
  if (pokoj === null) {
    return "Nieznane pomieszczenie";
  }
  return pokoj.nazwa;
}

// Za kazdym razem nowy obiekt, wszystkie pola wpisane recznie.
// Brak jednego wspolnego wzorca na zewnatrz, wiec dwa wywolania sa niezalezne.
function stanPoczatkowy() {
  return {
    pokoj: POKOJ_RECEPCJA,
    energia: MAKS_ENERGIA,
    karta: false,
    bezpiecznik: false,
    zasilanie: false,
    koniec: false,
    wygrana: false
  };
}

// Nowy obiekt tylko ze znanymi polami. Uzywane przy imporcie i eksporcie.
function kopiaStanu(stan) {
  return {
    pokoj: stan.pokoj,
    energia: stan.energia,
    karta: stan.karta,
    bezpiecznik: stan.bezpiecznik,
    zasilanie: stan.zasilanie,
    koniec: stan.koniec,
    wygrana: stan.wygrana
  };
}

// Odmowa: zero kosztu, zwracamy ten sam obiekt wejsciowy.
function odmowa(stanPrzed, komunikat) {
  return { stan: stanPrzed, komunikat: komunikat };
}

// Wspolna sciezka sukcesu. TYLKO tu naliczamy koszt jednej energii.
// Wygrana ma pierwszenstwo: porazka dopiero, gdy energia 0 i brak wygranej.
function sukces(stanPrzed, zmiany, komunikat) {
  const energia = stanPrzed.energia - 1;
  const wygrana = zmiany.wygrana === true;
  const koniec = wygrana || energia === 0;
  const nowyStan = { ...stanPrzed, ...zmiany, energia: energia, wygrana: wygrana, koniec: koniec };

  let tekst = komunikat + " " + KOMUNIKATY.energia + energia + ".";
  if (koniec && !wygrana) {
    tekst = tekst + " " + KOMUNIKATY.porazka;
  }
  return { stan: nowyStan, komunikat: tekst };
}

// Glowna funkcja regul. Nie mutuje wejscia i nic nie wypisuje.
// Zawsze zwraca { stan, komunikat }.
function przejscie(stanPrzed, komenda) {
  if (stanPrzed.koniec) {
    return odmowa(stanPrzed, KOMUNIKATY.koniecGry);
  }

  switch (komenda) {
    case "lewo":
    case "prawo": {
      // Najpierw kandydat, potem sprawdzenie sciany. Stanu nie ruszamy przed sprawdzeniem.
      const cel = komenda === "prawo" ? stanPrzed.pokoj + 1 : stanPrzed.pokoj - 1;
      if (znajdzPokoj(cel) === null) {
        return odmowa(stanPrzed, KOMUNIKATY.sciana);
      }
      return sukces(stanPrzed, { pokoj: cel }, KOMUNIKATY.ruch + nazwaPokoju(cel) + ".");
    }

    case "karta":
      if (stanPrzed.karta) {
        return odmowa(stanPrzed, KOMUNIKATY.kartaMasz);
      }
      if (stanPrzed.pokoj !== POKOJ_RECEPCJA) {
        return odmowa(stanPrzed, KOMUNIKATY.kartaBrak);
      }
      return sukces(stanPrzed, { karta: true }, KOMUNIKATY.kartaOk);

    case "bezpiecznik":
      if (stanPrzed.bezpiecznik) {
        return odmowa(stanPrzed, KOMUNIKATY.bezpiecznikMasz);
      }
      if (stanPrzed.zasilanie) {
        return odmowa(stanPrzed, KOMUNIKATY.bezpiecznikZuzyty);
      }
      if (stanPrzed.pokoj !== POKOJ_MAGAZYN) {
        return odmowa(stanPrzed, KOMUNIKATY.bezpiecznikBrak);
      }
      return sukces(stanPrzed, { bezpiecznik: true }, KOMUNIKATY.bezpiecznikOk);

    case "napraw":
      if (stanPrzed.zasilanie) {
        return odmowa(stanPrzed, KOMUNIKATY.naprawJuz);
      }
      if (stanPrzed.pokoj !== POKOJ_SERWEROWNIA) {
        return odmowa(stanPrzed, KOMUNIKATY.naprawZlyPokoj);
      }
      if (!stanPrzed.bezpiecznik) {
        return odmowa(stanPrzed, KOMUNIKATY.naprawBrakBezpiecznika);
      }
      // Bezpiecznik jest zuzywany, zasilanie wraca.
      return sukces(stanPrzed, { bezpiecznik: false, zasilanie: true }, KOMUNIKATY.naprawOk);

    case "wyjdz":
      if (stanPrzed.pokoj !== POKOJ_WYJSCIE) {
        return odmowa(stanPrzed, KOMUNIKATY.wyjdzZlyPokoj);
      }
      if (!stanPrzed.karta) {
        return odmowa(stanPrzed, KOMUNIKATY.wyjdzBrakKarty);
      }
      if (!stanPrzed.zasilanie) {
        return odmowa(stanPrzed, KOMUNIKATY.wyjdzBrakZasilania);
      }
      return sukces(stanPrzed, { wygrana: true }, KOMUNIKATY.wygrana);

    default:
      return odmowa(stanPrzed, KOMUNIKATY.nieznanaKomenda + String(komenda));
  }
}

// Walidator stanu. Kolejnosc ma znaczenie: najpierw null/typ, potem pola.
function czyStan(wartosc) {
  if (wartosc === null || typeof wartosc !== "object" || Array.isArray(wartosc)) {
    return false;
  }

  // Pokoj: calkowity numer, ktory istnieje w kolekcji.
  if (!Number.isInteger(wartosc.pokoj) || znajdzPokoj(wartosc.pokoj) === null) {
    return false;
  }

  // Energia: calkowita, 0..MAKS_ENERGIA.
  if (!Number.isInteger(wartosc.energia) || wartosc.energia < 0 || wartosc.energia > MAKS_ENERGIA) {
    return false;
  }

  // Piec pol logicznych.
  const flagi = ["karta", "bezpiecznik", "zasilanie", "koniec", "wygrana"];
  for (let i = 0; i < flagi.length; i = i + 1) {
    if (typeof wartosc[flagi[i]] !== "boolean") {
      return false;
    }
  }

  // Zaleznosci miedzy polami.
  if (wartosc.bezpiecznik && wartosc.zasilanie) {
    return false;
  }
  if (wartosc.wygrana && (wartosc.pokoj !== POKOJ_WYJSCIE || !wartosc.karta || !wartosc.zasilanie)) {
    return false;
  }
  if (wartosc.koniec !== (wartosc.wygrana || wartosc.energia === 0)) {
    return false;
  }

  return true;
}
