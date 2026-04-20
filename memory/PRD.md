# EasyLeaz - PRD

## Problem Statement
Premium automotive leasing landing page + CRM for EasyLeaz, Geneva. Ultra-premium dark theme with admin panel, vehicle management, global CMS, and full CRM system.

## Architecture
- **Frontend**: React + Tailwind + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **Auth**: JWT (PyJWT + bcrypt)
- **File Storage**: Local (/app/backend/uploads/)
- **Theme**: Dark premium (#071A1F, #22D3EE cyan, #E6F7FF text)
- **Fonts**: Cinzel (headings), Inter (body)

## What's Been Implemented (March 2026)

### Landing Page
- Hero with parallax, Vehicles slider, Process steps, Extended leasing form, Appointment section, Contact, Footer

### CRM System (NEW)
- JWT authentication (email + password)
- Extended leasing form: 15+ fields + file uploads (identity doc, salary slips)
- Leads API: POST, GET, GET/:id, PATCH, DELETE
- CRM Dashboard with stats (total, pending, approved, rejected)
- Lead management: table, search, filters, detail view, status updates
- Document downloads from admin panel
- Email notification system (SMTP configurable)
- Backward compatibility with legacy auth

### Admin Panel (/admin)
- JWT login (admin@easyleaz.ch / easyleaz2024)
- 4 tabs: Dashboard, Leads, Vehicles, CMS
- Vehicle CRUD
- CMS global content editor

## Prioritized Backlog
- P0: Configurer SMTP Infomaniak (SMTP_USER, SMTP_PASS, SMTP_FROM, NOTIFICATION_EMAIL dans .env)
- P0: Real vehicle images
- P1: Lead CSV export advanced (charts, PDF reports)
- P2: Multi-language (FR/EN)

## Next Tasks
1. Configurer les identifiants SMTP Infomaniak dans .env pour activer les emails
2. Remplacer les images stock par les photos véhicules du client
3. Ajouter des rapports PDF / graphiques au dashboard

---

## 🆕 Intégration EASYLOC — "2 sites en 1" (Avril 2026)

### Nouveau périmètre
Intégration du projet EASYLOC (cloné depuis repo GitHub externe) comme seconde page `/easyloc` dans le même domaine que EasyLeaz. Les deux sites cohabitent sans se polluer mutuellement.

### Architecture adoptée

**Backend (`/app/backend/server.py`)**
- Nouveau router `easyloc_router` avec préfixe `/api/easyloc/*`
- Collections MongoDB séparées : `easyloc_vehicles`, `easyloc_reservations`, `easyloc_content`
- Seed automatique : 9 véhicules premium + 8 sections de contenu au démarrage
- **Auth unifiée** : les routes admin EasyLoc utilisent `get_current_admin` d'EasyLeaz → un seul JWT pour les 2 panneaux

**Frontend (`/app/frontend/src/easyloc/`)**
- Dossier isolé avec composants EASYLOC copiés tels quels (style préservé à 100%)
- `context.js` — Provider local avec `API=${BACKEND_URL}/api/easyloc`
- `styles.css` — CSS EASYLOC scopé sous `.easyloc-scope` (body/html/vars HSL shadcn) pour éviter la contamination
- `EasyLocApp.js` — wrapper exposant `<EasyLocLanding />` et `<EasyLocAdmin />`
- Routes ajoutées dans `App.js` : `/easyloc`, `/easyloc/admin`

**CTA EasyLeaz → EasyLoc**
- `Navbar.js` : mini CTA "EASYLOC" (lien header discret doré, `data-testid="nav-cta-easyloc"`)
- `HeroSection.js` : 3e bouton "Louer un véhicule" (`data-testid="hero-cta-easyloc"`)
- `EasyLocSwitchSection.js` : nouvelle section dédiée après la FAQ (visuel + CTA `easyloc-switch-cta`)
- Mobile menu : bouton "Louer un véhicule → EasyLoc"

### Tests réalisés (iteration_6.json)
- ✅ Backend : 17/17 pytest passés
- ✅ Frontend : home EasyLeaz intacte, `/easyloc` rend parfaitement, admin unifié fonctionne
- ✅ Isolation CSS vérifiée — aucune régression sur EasyLeaz
- ✅ Fix CSS : `.easyloc-scope *` réduit à `box-sizing` uniquement pour ne pas écraser Tailwind

### Backlog / Améliorations futures
- [P2] SMTP Infomaniak (en attente des credentials user) — déjà câblé dans le code
- [P2] Interface d'upload d'images véhicule pour EasyLoc (actuellement URL d'image simple)
- [P3] Option pour que l'admin EasyLeaz gère aussi EasyLoc via des onglets dans AdminDashboard (cohérence UX)
