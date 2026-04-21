# Codes d'accès & URLs — EasyLeaz + EasyLoc (2 sites en 1)

## Panneaux d'administration (login unifié)

**Email** : `admin@easyleaz.ch`
**Mot de passe** : `easyleaz2024`

Ce même compte JWT donne accès aux **deux** panneaux admin :

| Site | URL admin | Onglets disponibles |
|---|---|---|
| **EasyLeaz** (leasing — cyan/dark) | `/admin` | Dashboard · Demandes · Véhicules · Contenu · **Thème** · **Sections** |
| **EasyLoc** (location — doré/noir) | `/easyloc/admin` | Contenu · Véhicules · Réservations · **Thème** · **Sections** · Paramètres |

Le token JWT est partagé dans `sessionStorage.admin_jwt` — connectez-vous une fois sur l'un et vous êtes automatiquement connecté sur l'autre.

## URLs publiques

| Site | URL |
|---|---|
| EasyLeaz — accueil leasing | `/` |
| EasyLeaz — catalogue véhicules (neuf / occasion) | `/catalogue` |
| EasyLoc — accueil location | `/easyloc` |

## Panneau admin — fonctionnalités

### Onglet Contenu (CMS textuel)
- Édition de toutes les sections : Hero, About, Processus, FAQ, Contact, Navbar, Footer, etc.
- **Upload d'images/vidéos** directement depuis le panneau (bouton "Uploader" sur les champs `image`, `video`, `background`, `logo`, `media`, etc.)

### Onglet Thème (couleurs dynamiques)
- 6 couleurs modifiables : principale, principale (hover), accent, fond, fond alternatif, texte
- Color picker + input hexadécimal
- Aperçu en temps réel
- S'applique dynamiquement sur tout le site après sauvegarde

### Onglet Sections (visibilité des sections)
- Active / désactive chaque section de la landing page (toggle on/off)
- 7 sections EasyLeaz : About, Processus, CTA Véhicules, Formulaire, FAQ, Bascule EasyLoc, Contact
- 7 sections EasyLoc : Catalogue, Processus, Formulaire, RDV, CTA, Bascule EasyLeaz, Contact

### Onglet Véhicules (EasyLoc)
- Ajout / édition / suppression de véhicules
- **Multi-upload de photos** (JPG, PNG, max 5 MB)
- Définir l'image principale, supprimer des photos individuelles
- Édition des caractéristiques techniques (puissance, accélération, transmission, carburant, etc.)

### Onglet Véhicules (EasyLeaz)
- Idem que EasyLoc avec distinction neuf/occasion

## Credentials DB / Infrastructure

- MongoDB : local `mongodb://localhost:27017` (variable `MONGO_URL` dans `backend/.env`)
- DB : `easyleaz_db` (ou selon `DB_NAME`)
- Variables protégées : `MONGO_URL`, `DB_NAME`, `REACT_APP_BACKEND_URL` — ne jamais les modifier directement.
