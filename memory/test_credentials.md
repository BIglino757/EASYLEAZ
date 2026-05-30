# Codes d'accès Production — EasyLeaz + EasyLoc

## 🔑 URLs admin (NOUVELLES — l'ancienne `/admin` ne marche plus)

| Site | URL admin |
|---|---|
| EasyLeaz admin | `https://votre-domaine.ch/admin-elc2345` |
| EasyLoc admin  | `https://votre-domaine.ch/easyloc/admin-elc2345` |

## 🔐 Identifiants admin (login unifié)

### Local / Preview (utilisé par le testing agent)
- **Email** : `admin@easyleaz.ch`
- **Password** : `easyleaz2024`
- **URL local** : `/admin-elc2345` (preview) — ces creds sont définis dans `/app/backend/.env` via `ADMIN_PASSWORD`.

### Production (Vercel + Railway)
- **Email** : `admin@easyleaz.ch`
- **Password** : `o3lUj8IAeNwYrgjUD&gQ13xR`

⚠️ Ce password production est généré aléatoirement (24 caractères). À conserver en lieu sûr.

## 🚀 Étapes pour activer le nouveau password en production (Vercel + Railway + MongoDB Atlas)

### 1. Push le code sur GitHub
Dans Emergent : cliquez sur **"Save to GitHub"** → push.
Vercel redéploie automatiquement le frontend.
Railway redéploie automatiquement le backend.

### 2. Ajouter le nouveau password dans Railway
- Allez sur Railway → votre service backend → onglet **Variables**
- Ajoutez ces 2 variables :
  ```
  ADMIN_PASSWORD=o3lUj8IAeNwYrgjUD&gQ13xR
  ADMIN_RESET_SECRET=<une autre chaîne aléatoire longue, vous la choisissez>
  ```
- Cliquez sur **Deploy** pour redémarrer le service.

### 3. Mettre à jour le password admin dans MongoDB Atlas
Une fois Railway redémarré, lancez ce **curl** depuis votre terminal (Mac/Windows) :

```bash
curl -X POST "https://VOTRE-BACKEND.railway.app/api/auth/reset-password?secret=VOTRE_ADMIN_RESET_SECRET"
```

Remplacez :
- `VOTRE-BACKEND.railway.app` → l'URL réelle de votre backend Railway
- `VOTRE_ADMIN_RESET_SECRET` → la valeur que vous avez mise dans `ADMIN_RESET_SECRET`

Vous devriez recevoir : `{"success":true,"message":"Mot de passe admin réinitialisé"}`

### 4. Tester la connexion
- Allez sur `https://votre-domaine.ch/admin-elc2345`
- Email : `admin@easyleaz.ch`
- Password : `o3lUj8IAeNwYrgjUD&gQ13xR`

✅ Vous êtes maintenant authentifié sur les 2 panels (EasyLeaz + EasyLoc partagent le même JWT).

---

## 📋 Variables d'environnement Railway complètes

```env
# Database
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=easyleaz_db

# Auth
ADMIN_PASSWORD=o3lUj8IAeNwYrgjUD&gQ13xR
ADMIN_RESET_SECRET=changez_par_une_chaine_aleatoire_longue
JWT_SECRET=changez_par_une_autre_chaine_aleatoire_longue

# CORS (mettre l'URL exacte de votre frontend Vercel)
CORS_ORIGINS=https://votre-domaine.ch,https://www.votre-domaine.ch,https://votre-app.vercel.app

# SMTP Infomaniak (optionnel — pour les emails)
SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_USER=contact@votre-domaine.ch
SMTP_PASS=votre_mdp_smtp
SMTP_FROM=contact@votre-domaine.ch
NOTIFICATION_EMAIL=contact@votre-domaine.ch
```

## 📋 Variables d'environnement Vercel

```env
REACT_APP_BACKEND_URL=https://VOTRE-BACKEND.railway.app
WDS_SOCKET_PORT=443
```

⚠️ Après ajout/modification d'une variable Vercel : **Settings → Deployments → Redeploy** pour rebuild.

---

## 🔄 Pour changer à nouveau le password plus tard

1. Modifiez `ADMIN_PASSWORD` dans Railway → Redeploy
2. Lancez à nouveau le curl `/api/auth/reset-password?secret=...`
3. Le nouveau password est actif immédiatement

---

## 📂 URLs publiques

| Site | URL |
|---|---|
| EasyLeaz | `https://votre-domaine.ch/` |
| Catalogue EasyLeaz | `https://votre-domaine.ch/catalogue` |
| EasyLoc | `https://votre-domaine.ch/easyloc` |
