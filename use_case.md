# Voyager Travel Planner - Use Case Analysis

This document describes the primary actors and use cases of the Voyager Travel Planner web application.

---

## Use Case Diagram

```mermaid
leftToRightDirection
actor Putnik as "Putnik (Standard User)"
actor Admin as "Administrator"

rectangle "Sistem za planiranje putovanja (Voyager)" {
    %% Auth
    usecase UC_Auth as "Registracija i prijava"
    
    %% Travel Plan
    usecase UC_PlanCRUD as "Upravljanje planom putovanja (CRUD)"
    usecase UC_DestCRUD as "Upravljanje destinacijama"
    usecase UC_ActCRUD as "Organizacija aktivnosti po danima"
    usecase UC_PackCRUD as "Vođenje packing liste (Checklist)"
    usecase UC_Budget as "Evidencija troškova i budžeta"
    usecase UC_Share as "Dijeljenje plana (QR Kod / Link)"
    
    %% Admin
    usecase UC_AdminAll as "Pregled svih planova u sistemu"
    usecase UC_AdminUsers as "Upravljanje korisničkim nalozima"
}

%% Relationships Standard User
Putnik --> UC_Auth
Putnik --> UC_PlanCRUD
Putnik --> UC_DestCRUD
Putnik --> UC_ActCRUD
Putnik --> UC_PackCRUD
Putnik --> UC_Budget
Putnik --> UC_Share

%% Relationships Admin
Admin --> UC_Auth
Admin --> UC_PlanCRUD
Admin --> UC_AdminAll
Admin --> UC_AdminUsers
```

---

## Actors & Roles

### 1. Putnik (Standard User)
Standard registered traveler who plans personal or group trips.
- **Registracija i prijava**: Creates and manages their own user profile securely.
- **Upravljanje planom putovanja**: Can create new travel plans (specifying budget, duration, notes), edit basic details, and delete plans. Deleting a plan cascadingly removes all associated destinations, activities, expenses, checklists, and share records.
- **Upravljanje destinacijama**: Can add one or more locations to visit, ensuring dates are within the overall trip duration.
- **Aktivnosti i Kalendar**: Can schedule daily visits, reservations, or events with estimated costs and status toggles. View plans on a monthly grid or itinerary timeline.
- **Finansije**: Log expenses by categories (travel, food, lodging, shopping) and monitor remaining budget in real-time.
- **Packing lista**: Generate checklist items to pack and mark items complete as they pack.
- **Dijeljenje plana**: Generate VIEW (read-only) or EDIT (read-write) tokens and QR codes to share travel plans.

### 2. Administrator
Has overall management privileges in the system.
- **All Standard User Actions**: Can create and manage their own travel plans.
- **Pregled svih planova**: View travel plans created by all users in the system.
- **Korisnički nalozi**: Access the Admin Panel to see list of all registered users and delete user accounts (which cascadingly removes all plans and records created by those users).

### 3. Deljeni Putnik / Posmatrač (Guest Actor via Share Token)
An unregistered or external actor accessing a plan via a shared QR code/link.
- **VIEW Access**: Can view plan details, destinations, activities timeline, expenses, and packing checklists in read-only mode.
- **EDIT Access**: Can view and modify destinations, activities, packing lists, and expenses associated with that specific plan.
