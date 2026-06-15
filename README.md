# Voyager Travel Planner

Voyager je moderna web aplikacija za planiranje putovanja koja korisnicima omogućava da na jednom mestu organizuju osnovne podatke o putovanjima, destinacijama, aktivnostima po danima, pakovanjima (checklist), budžetima i troškovima, kao i da dele planove putem QR kodova sa različitim nivoima pristupa (VIEW/EDIT).

Aplikacija je strukturisana kao **mikroservisna arhitektura** dizajnirana za **Microsoft Service Fabric** platformu sa hibridnim načinom pokretanja za lokalno testiranje.

---

## Zahtevi (Prerequisites)
Za pokretanje aplikacije na lokalnom sistemu potrebno je imati:
1. **.NET SDK** (.NET 10 ili noviji)
2. **Node.js** (v24.15.0 ili noviji) i **npm**
3. **Microsoft SQL Server LocalDB** (MSSQLLocalDB)

---

## Struktura portova i servisa

Lokalni servisi su mapirani na sledećim adresama:
- **Frontend (React/Vite)**: `http://localhost:5173`
- **AuthService (Stateless)**: `http://localhost:5001` (Baza: `TravelPlanner_Auth`)
- **TravelService (Stateless)**: `http://localhost:5002` (Baza: `TravelPlanner_Travel`)
- **ActivityService (Stateful)**: `http://localhost:5003` (Baza: `TravelPlanner_Activity`)

---

## Uputstvo za pokretanje aplikacije

### Korak 1: Kloniranje i inicijalizacija
Baza podataka koristi LocalDB. Baze i EF Core migracije će se **automatski kreirati i primeniti** prilikom prvog pokretanja servisa, tako da nema potrebe za ručnim pokretanjem migracija!

### Korak 2: Pokretanje Backend mikroservisa
U root folderu projekta (`travel-planner`), otvorite terminal (PowerShell) i pokrenite servise istovremeno ili u odvojenim prozorima pomoću komande:

```powershell
# Pokretanje AuthService-a
dotnet run --project src/Services/AuthService/AuthService.csproj

# Pokretanje TravelService-a
dotnet run --project src/Services/TravelService/TravelService.csproj

# Pokretanje ActivityService-a
dotnet run --project src/Services/ActivityService/ActivityService.csproj
```

*Alternativno, možete pokrenuti skriptu `run-all.ps1` iz root foldera koja će automatski otvoriti odvojene prozore za svaki servis.*

### Korak 3: Pokretanje Frontend aplikacije
Otvorite novi terminal u folderu `src/Frontend` i pokrenite sledeće komande:

```bash
npm install
npm run dev
```

Aplikacija će se pokrenuti na adresi `http://localhost:5173`.

---

## Korisnički nalozi (Podaci za testiranje)

Prilikom prve migracije, u bazi se automatski kreira administrator sa sledećim pristupnim podacima:
- **Email**: `admin@travelplanner.com`
- **Lozinka**: `adminpassword`
- **Uloga**: `Admin`

Za standardnog korisnika, možete se jednostavno registrovati na formi za registraciju na frontendu (tamo takođe možete odabrati ulogu tokom registracije radi lakšeg testiranja).

---

## Ključne tehničke karakteristike

1. **Service Fabric Stateful & Stateless**:
   - `AuthService` i `TravelService` su stateless servisi.
   - `ActivityService` je stateful servis koji koristi `IReliableDictionary` za keširanje stanja budžeta u realnom vremenu. Kada radi van Service Fabric klastera (u standalone režimu), automatski koristi in-memory `ConcurrentDictionary` kao fallback.
2. **Kaskadno brisanje (Cascading Delete)**:
   - Brisanje plana putovanja briše sve povezane destinacije, stavke za pakovanje i share tokene.
   - Brisanje korisničkog naloga od strane administratora briše sve njegove planove putovanja i prateće detalje.
3. **Validacija podataka**:
   - Krajnji datum putovanja ne može biti pre početnog.
   - Datumi boravka na destinacijama moraju biti unutar datuma samog putovanja.
   - Budžet i troškovi ne mogu imati negativne vrednosti.
4. **Dijeljenje plana (VIEW / EDIT)**:
   - Korisnik može generisati link ili QR kod sa nivoom pristupa `VIEW` (gde primalac može samo da pregleda detalje) ili `EDIT` (gde primalac može dodavati i menjati destinacije, aktivnosti i troškove).
   - Validacija se vrši na backendu i za svaki zahtev se proverava autorizacija tokena za deljenje.
