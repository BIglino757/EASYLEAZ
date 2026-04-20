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
