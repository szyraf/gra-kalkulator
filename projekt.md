Projekt jest grą-symulacją zarządzania miastem mającą na celu promowanie ekologicznych źródeł energii. Poprzez stopniowe przekształcanie nieekologicznego miasta użytkownik ma szansę na własne oczy zobaczyć impakt jaki niosą ze sobą odnawialne źródła energii. 
Ui projekt
Mapa grid kwadratowy

Prosta prezentacja budynków, elektrowni. Możliwość podłączania elktrowni do budynków, symboliczne połączenia

Lewy górny róg;
informacje o dniu i pogodzie (nasłonecznienie, wiatr)
dostępna energia
aktualna łączna produkcja
aktualne łączne zużycie energi 

Po zaznaczeniu budynku infromacje:
nazwa
ilość zużywanej/produkowanej energi
zastosowane ulepszenia

Mechaniki

Na start mamy mapę miasta zasilanego całkowicie elektrowniami węglowymi. Rankiem każdego dnia dostajemy określony budżet możemy dobudowywać elektrownie oraz usprawnienia budynków. 

Pomiędzy elektrowniami i budynkami możemy tworzyć połączenia. W momencie w którym elektrownia zostanie przeciążona odcina się. Skłania to do ostrożnego planowania miasta i projektowania więcej niż jednej sieci. 

Losowo może dojść do awarii elektrowni (przestaje działać na określony czas)

Symulacja pogody - na podstawie określonych warunków pogodowych, różna ilość produkowanej energii przez odpowiednie źródła  

Zadowolenie mieszkańców - zależy od tego czy ich energetyczne potrzeby są spełnione + poziomu ekologiczności.  Wyższe oznacza większy budżet 

Cel gry - całkowite uniezależnienie miasta od elektrowni węglowych 

możliwość stawiania budynków i elektrowni
symulowanie pogody i upływu czasu
symulacja zużycia energii i produkcji energii 
blackouty

Jednostki:
domy róznego tieru - pobiera energię róznego tieru (domek rodzinny -> blok -> firma)
fotowoltaika do domku - generuje energie
elektrownia solarna - generuje energie 
elektrownia wiatrowa - generuje energie
elektrownia węglowa - big bad guy 
magazyn energii - zbiera nadmiarową energie 


Notatki:
- Kościuszko jako nasza maskotka



🌇 1. "Solaryzator" – gra symulacyjna o mieście przyszłości (PV citybuilder)
Hasło: „Nie tylko licz, ale buduj przyszłość”
 Opis:
 Gra/symulacja, w której użytkownik zarządza rozwojem energetycznym miasta:
musi rozdzielać budżet między panele słoneczne, magazyny, modernizację sieci,


w czasie rzeczywistym symulowane są warunki pogodowe i zużycie,


widzi efekty decyzji: blackouty, nadprodukcję, wzrost zadowolenia mieszkańców.


➡ To kalkulator energetyczny, ale w formie grywalizacji i interaktywnej edukacji.
 ➡ Użyteczność + zabawa + efekt wow na prezentacji.


Super wybór! Rozwijam pomysł na grę symulacyjną o mieście przyszłości z zarządzaniem energią słoneczną – to oryginalne, efektowne i zgrabnie podczepione pod temat Hitachi („Słoneczna Przyszłość”), ale nie brzmi nudno jak „kalkulator”.

🌇 Tytuł roboczy: Solaris: Buduj Przyszłość
🎮 Opis gry:
Gracz wciela się w zarządcę małego miasta, które musi przestawić się na odnawialne źródła energii – szczególnie energię słoneczną. Gra ma charakter symulacyjny (citybuilder-light), ale z naciskiem na energetykę i ekologię.
Twoim zadaniem jest:
instalowanie paneli PV i magazynów energii,


modernizacja sieci przesyłowej,


zarządzanie produkcją vs zużyciem,


dbanie o zadowolenie mieszkańców, unikając blackoutów,


i inwestowanie w długofalowy rozwój miasta.



🧱 Główne mechaniki gry:
Mechanika
Opis
Pieniądze i budżet
Ograniczone środki, które inwestujesz w technologie
Produkcja energii
Panele PV produkują tylko w dzień i przy słońcu (zmienne pogodowe)
Zużycie energii
Mieszkańcy, fabryki, transport – wszystko zużywa prąd
Magazyny energii
Pozwalają przechować prąd na noc lub na blackouty




Zadowolenie mieszkańców
Spada, gdy są przerwy w dostawie prądu lub zanieczyszczenie rośnie
Czas
Gra toczy się w dniach/miesiącach – zmieniają się sezony, ceny prądu, pogoda


🔁 Cykl rozgrywki:
Start z miastem zasilanym tylko z węgla


Stopniowe inwestowanie w PV


Wyzwania losowe: pochmurne dni, awarie


Utrzymanie równowagi: produkcja – zużycie – magazyn


Cel końcowy: Miasto w pełni zasilane OZE, wysoki poziom zadowolenia



⚙️ MVP na hackathon:
Na hackathon wystarczy mała, działająca wersja gry:
1 ekran miasta z prostymi obiektami (domki, panele, fabryka)


pasek energii produkowanej / zużywanej / przechowywanej


UI z przyciskami: "Zbuduj panel", "Zainwestuj w magazyn"


symulacja dnia i nocy (PV działa tylko w dzień)


prosty wykres zużycia / produkcji / zadowolenia


Można dodać:
zmieniającą się pogodę (pochmurno = niższa produkcja),


pojawiające się komunikaty typu „blackout w dzielnicy X”,


i ekran podsumowania: „Twoje miasto oszczędziło X ton CO₂”.



💻 Propozycja stacku:
Część
Technologia
Frontend (gra)
JS+ Canvas
Logika symulacji
czysty JavaScript 
Dane pogodowe
statyczne (na hackathon), l
UI/UX
Tailwind + komponenty do wykresów (np. Chart.js)


🎯 Jak sprzedać projekt jury:
„Zamiast kolejnego nudnego kalkulatora, stworzyliśmy symulację przyszłości, w której każdy może poczuć się jak burmistrz nowoczesnego miasta. Edukujemy przez zabawę, pokazując wyzwania energetyczne w przystępnej i wciągającej formie. To kalkulator... przebrany za city buildera.”

🧠 Bonusowe pomysły (jeśli starczy czasu):
Tryb edukacyjny: pytania/quizy między turami („Czy wiesz, ile CO₂ produkuje 1 MWh z węgla?”)


Ranking miast (lokalny / ogólnopolski)






