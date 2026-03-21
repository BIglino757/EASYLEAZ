# EasyLeaz - PRD

## Problem Statement
Premium automotive leasing landing page for EasyLeaz, based in Geneva. Ultra-premium dark theme with CMS, admin panel, vehicle management.

## Architecture
- **Frontend**: React + Tailwind + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **Theme**: Dark premium (#071A1F base, #22D3EE cyan, #E6F7FF text)
- **Fonts**: Cinzel (headings), Inter (body)

## User Personas
1. **Prospect**: Affluent car buyer in Geneva browsing leasing options
2. **Admin**: EasyLeaz staff managing vehicles, content, and requests

## Core Requirements
- Premium landing page with Hero, Vehicles, Process, Form, Appointment, Contact
- Vehicle CRUD via admin panel
- Global CMS for all section text/images
- Leasing request form stored in DB
- Calendly placeholder for appointments
- French language only
- No Emergent branding

## What's Been Implemented (March 2026)
- Full landing page with all 7 sections
- Parallax hero with animated CTAs
- Vehicle horizontal slider with glassmorphism cards
- 3-step process section with animated icons
- Leasing request form with Select dropdowns
- Appointment section with Calendly placeholder
- Contact section (phone, location, Instagram, WhatsApp)
- Admin dashboard at /admin with password auth
- Vehicle CRUD (add/edit/delete)
- CMS editor for all sections
- Leasing requests viewer with status management
- Seed data with 6 premium vehicles
- All backend APIs tested and working

## Prioritized Backlog
- P0: Calendly integration (when URL provided by client)
- P0: Real vehicle images (when provided by client)
- P1: Typeform integration for leasing requests
- P1: Image upload for vehicles in admin
- P2: Multi-language support (FR/EN)
- P2: Email notifications for new leasing requests
- P2: Analytics dashboard

## Next Tasks
1. Integrate Calendly when URL is provided
2. Replace stock images with client's vehicle photos
3. Add Typeform integration if provided
4. Add image upload functionality to admin
5. Add email notification system
