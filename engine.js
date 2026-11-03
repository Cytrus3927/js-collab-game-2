function stanPoczatkowy(){
    return{
        pokoj: 1,
        energia: 10,
        karta: false,
        bezpiecznik: false,
        zasilanie: false,
        koniec: false,
        wygrana: false
    }
}

let pokoje=[
  { id: 1, nazwa: "Recepcja", oswietlony: true },
  { id: 2, nazwa: "Magazyn", oswietlony: false },
  { id: 3, nazwa: "Serwerownia", oswietlony: false },
  { id: 4, nazwa: "Wyjście", oswietlony: true }
]

function przejscie(stanPrzed, komenda) {
    if (stanPrzed.koniec) {
        return { dane: stanPrzed, komunikat: "Gra już się zakończyła." };
    }
    let nowyStan = { ...stanPrzed };

    if (komenda === "prawo") {
        if (nowyStan.pokoj >= 4) {
            return { dane: stanPrzed, komunikat: "Ściana! Nie możesz iść dalej w prawo." };
        }
    
        nowyStan.energia = nowyStan.energia - 1;
        nowyStan.pokoj = nowyStan.pokoj + 1;

        if (nowyStan.energia <= 0 && !nowyStan.wygrana) {
            nowyStan.koniec = true;
            return { dane: nowyStan, komunikat: "Krok wykonany, ale zabrakło energii. Przegrana!" };
        }

        return { dane: nowyStan, komunikat: `Przeszedłeś w prawo do pokoju: ${nowyStan.pokoj}.` };
    }

    else if (komenda === "lewo") {
        if (nowyStan.pokoj <= 1) {
            return { dane: stanPrzed, komunikat: "Ściana! Tutaj jest początek budynku." };
        }
        
        nowyStan.energia = nowyStan.energia - 1;
        nowyStan.pokoj = nowyStan.pokoj - 1;

        if (nowyStan.energia <= 0 && !nowyStan.wygrana) {
            nowyStan.koniec = true;
            return { dane: nowyStan, komunikat: "Krok wykonany, ale zabrakło energii. Przegrana!" };
        }

        return { dane: nowyStan, komunikat: `Przeszedłeś w lewo do pokoju: ${nowyStan.pokoj}.` };
    }

    else if (komenda === "podnieś kartę") {
        if (nowyStan.pokoj !== 1) {
            return { dane: stanPrzed, komunikat: "Nie ma tu karty." };
        }

        if (nowyStan.karta) {
            return { dane: stanPrzed, komunikat: "Karta została już podniesiona." };
        }

        nowyStan.karta = true;
        return { dane: nowyStan, komunikat: "Podniosłeś kartę dostępu." };
    }

    else if (komenda === "podnieś bezpiecznik") {
        if (nowyStan.pokoj !== 2) {
            return { dane: stanPrzed, komunikat: "Nie ma tu bezpiecznika." };
        }

        if (nowyStan.bezpiecznik) {
            return { dane: stanPrzed, komunikat: "Bezpiecznik został już zabrany." };
        }

        nowyStan.bezpiecznik = true;
        return { dane: nowyStan, komunikat: "Podniosłeś bezpiecznik." };
    }

    else if (komenda === "napraw") {
        if (nowyStan.pokoj !== 3) {
            return { dane: stanPrzed, komunikat: "Nie ma tu nic do naprawy." };
        }

        if (!nowyStan.bezpiecznik) {
            return { dane: stanPrzed, komunikat: "Nie masz bezpiecznika, żeby dokonać naprawy!" };
        }

        nowyStan.bezpiecznik = false;
        nowyStan.zasilanie = true;
        return { dane: nowyStan, komunikat: "Naprawa powiodła się. Zasilanie włączone!" };
    }

    else if (komenda === "wyjdź") {
        if (nowyStan.pokoj !== 4) {
            return { dane: stanPrzed, komunikat: "Nie jesteś przy wyjściu." };
        }

        if (!nowyStan.karta || !nowyStan.zasilanie) {
            return { dane: stanPrzed, komunikat: "Wyjście zablokowane! Potrzebujesz karty i włączonego zasilania." };
        }

        nowyStan.wygrana = true;
        nowyStan.koniec = true;
        return { dane: nowyStan, komunikat: "Gratulacje! Uciekłeś z kompleksu i wygrałeś grę!" };
    }

    else {
        return { dane: stanPrzed, komunikat: "Nieznana akcja" };
    }
}

function czyStan(stan) {
    if (!stan || typeof stan !== "object" || Array.isArray(stan)) return false;
    if (typeof stan.pokoj !== "number" || stan.pokoj < 1 || stan.pokoj > 4) return false;
    if (typeof stan.energia !== "number" || stan.energia < 0) return false;
    if (typeof stan.karta !== "boolean") return false;
    if (typeof stan.bezpiecznik !== "boolean") return false;
    if (typeof stan.zasilanie !== "boolean") return false;
    if (typeof stan.koniec !== "boolean") return false;
    if (typeof stan.wygrana !== "boolean") return false;
    return true;
}