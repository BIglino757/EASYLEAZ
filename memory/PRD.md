# EasyLeaz + EasyLoc — 2 sites en 1

## Original problem statement
Intégrer EASYLOC (cloné de GitHub) comme seconde page `/easyloc` sur le site EasyLeaz existant — "2 sites en 1" — sans modifier le style d'EasyLoc. Ajouter CTAs croisés, réorganiser les sections, intégrer vidéos hero, logos, véhicule A35 AMG réel, et construire un CMS admin complet (contenu + thème + sections visibles) pour les 2 sites.

## Architecture

### Domain structure
- **EasyLeaz** (leasing) — style cyan/dark — routes `/`, `/catalogue`, `/admin`
- **EasyLoc** (location) — style doré/noir — routes `/easyloc`, `/easyloc/admin`

### Backend (`/app/backend/server.py`)
- `api_router` (prefix `/api`) : EasyLeaz routes (cms, leads, vehicles, auth, uploads)
- `easyloc_router` (prefix `/api/easyloc`) : EasyLoc routes (content, vehicles, reservations, uploads)
- Collections MongoDB : `cms_content`, `leads`, `vehicles`, `admin_users` (EasyLeaz) + `easyloc_content`, `easyloc_vehicles`, `easyloc_reservations` (EasyLoc)
- **Auth unifiée** : un seul JWT admin dans `sessionStorage.admin_jwt` donne accès aux 2 panels

### Frontend
- `/app/frontend/src/App.js` — routing React Router
- `/app/frontend/src/components/admin/` — composants admin réutilisables (AssetUpload, ThemeEditor, SectionsVisibilityEditor, CMSEditor, VehicleManager)
- `/app/frontend/src/easyloc/` — dossier isolé EasyLoc avec wrapper `.easyloc-scope` pour isolation CSS
- `useEasyLeazTheme` / `useEasyLocTheme` — hooks qui merge les défauts avec le thème CMS

## Implémenté (historique)

### Mai 2026 — Iteration 9 : 6 modifications fonctionnelles
- ✅ **Description véhicule** : champ ajouté au modèle (EasyLeaz + EasyLoc), éditable depuis le panel admin via `<Textarea>` dans VehicleManager / EasyLoc AdminPage, et affiché côté client via toggle « Voir la description » expandable (data-testid `catalog-desc-toggle-{i}` / `vehicle-desc-toggle`)
- ✅ **CTA « Demande de leasing » EasyLeaz** : depuis le catalogue, redirige vers `/?vehicle=...#demande` ; `LeasingFormSection` lit le query param via `useEffect`, pré-remplit `desired_vehicle` et ouvre automatiquement l'accordéon
- ✅ **Calendrier EasyLoc — blocage des dates** : nouvel endpoint `GET /api/easyloc/vehicles/{id}/unavailable-dates` retourne la liste ISO des jours bloqués par les réservations `status: approved` ; `VehicleModal` les fetch et les passe au `<Calendar disabled={[{before: today}, isDateBlocked]}>`
- ✅ **Multi-upload images EasyLeaz** : bouton « Photos » dans VehicleManager + endpoint `POST /api/vehicles/{id}/images` (multiple files, set main image via star)
- ✅ **Icône calendrier or** : règle CSS `.easyloc-scope input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(73%) sepia(70%) saturate(540%) hue-rotate(15deg)… }` dans `easyloc/styles.css`
- ✅ **Formulaire EasyLeaz refondu** : nouveaux champs ajoutés — `address` (full), `children_count` (select 0-4+), `children_ages` (conditional input), `housing_status` (Propriétaire/Locataire), `employment_date` (input type='month'). « Revenus annuels » remplacé par `monthly_income` (champ libre, non pré-rempli). Backend `POST /api/leads` persiste tous les champs ; admin panel les affiche ; export CSV `/api/leads/export` inclut les 6 nouvelles colonnes

### Tests iteration 9
- Backend pytest 8/8 PASS (/app/backend/tests/test_iter9_full.py)
- Frontend Playwright validation : 6/6 features confirmées end-to-end
- Aucun bug critique ni régression

## Implémenté (historique antérieur)

### Avril 2026 — Intégration de base
- ✅ Intégration EASYLOC en tant que 2e site (routes `/easyloc`, `/easyloc/admin`)
- ✅ Isolation CSS via `.easyloc-scope` wrapper + variables HSL shadcn scopées
- ✅ Auth unifiée : JWT partagé dans sessionStorage
- ✅ CTAs croisés navbar + hero + section dédiée (EasyLoc↔EasyLeaz)
- ✅ Réorganisation logique des sections des 2 landings
- ✅ Logos uploadés (bleu EasyLeaz, doré EasyLoc) avec fond transparent via Pillow
- ✅ Contact + Footer EasyLeaz refaits à l'identique d'EasyLoc (4 colonnes, Instagram)
- ✅ Vidéos hero en autoplay/muted/loop + toggle audio (les 2 sites)
- ✅ Véhicule unique Mercedes-AMG A35 4MATIC (2021) avec 5 photos + specs correctes
- ✅ Kilométrage retiré du catalogue EasyLoc
- ✅ Multi-upload images véhicules EasyLoc (drag & drop admin)
- ✅ **CMS complet "option C"** :
  - Upload d'images/vidéos depuis le panneau admin (bouton sur les champs media)
  - Thème dynamique : 6 couleurs éditables (primary, primary_hover, accent, background, background_alt, text) avec color picker + aperçu live
  - Sections toggleable : activer/désactiver chaque section de la landing page (7 sections par site)
  - CSS variables inline appliquées sur `<div>` racine des LandingPages pour thème dynamique

## Tests
- Iteration 6 (intégration) : ✅ passed
- Iteration 7 (CMS complet) : Backend 16/16 (100%), Frontend 90% — seule amélioration mineure (data-testid sur bouton edit vehicle) corrigée

## Backlog

### P1 — Améliorations fonctionnelles
- [ ] SMTP Infomaniak (emails de notification) — en attente credentials user
- [ ] Mode "inline edit" : cliquer directement sur un texte sur le site public pour l'éditer (quand connecté admin)

### P2 — Optimisations
- [ ] Compression vidéos hero (actuellement 75-87MB, cible ~10-15MB avec ffmpeg)
- [ ] Multi-upload images véhicules côté EasyLeaz (comme fait sur EasyLoc)

### P3 — Nice to have
- [ ] Ajout d'un favicon personnalisé par site
- [ ] Drag & drop pour réordonner les images des véhicules
- [ ] Historique des modifications CMS (audit log)

## Credentials
Voir `/app/memory/test_credentials.md`

## Tech stack
- Backend : FastAPI, MongoDB (motor), JWT auth, bcrypt, aiofiles
- Frontend : React 19, React Router 7, Tailwind, Framer Motion, axios, lucide-react
- Media : HTML5 video, HTTP 206 Range streaming
