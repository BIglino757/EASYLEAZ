from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import aiofiles
import smtplib
import csv
import io
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'easyleaz_jwt_secret_2024_x9k2m')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'easyleaz2024')
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)
ASSETS_DIR = UPLOAD_DIR / 'cms_assets'
ASSETS_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_ASSET_SIZE = 200 * 1024 * 1024  # 200MB for videos
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
ALLOWED_ASSET_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm', '.mov'}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── JWT Helpers ───

def create_jwt_token(data: dict) -> str:
    payload = {**data, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_current_admin(authorization: str = Header(None), x_admin_token: str = Header(None)):
    # Support both JWT Bearer and legacy x-admin-token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_jwt_token(token)
        admin = await db.admin_users.find_one({"id": payload.get("sub")}, {"_id": 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin non trouvé")
        return admin
    if x_admin_token == ADMIN_PASSWORD:
        return {"id": "legacy", "email": "admin@easyleaz.ch", "name": "Admin"}
    raise HTTPException(status_code=401, detail="Non autorisé")

# ─── Models ───

class Vehicle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model: str
    year: int
    mileage: int
    fuel: str
    transmission: str
    price: int
    monthly_payment: int
    image_url: str = ""
    images: list = Field(default_factory=list)
    description: str = ""
    badge: str = ""
    condition: str = "occasion"
    status: str = "active"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VehicleCreate(BaseModel):
    brand: str
    model: str
    year: int
    mileage: int
    fuel: str
    transmission: str
    price: int
    monthly_payment: int
    image_url: str = ""
    images: list = Field(default_factory=list)
    description: str = ""
    badge: str = ""
    condition: str = "occasion"

class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    mileage: Optional[int] = None
    fuel: Optional[str] = None
    transmission: Optional[str] = None
    price: Optional[int] = None
    monthly_payment: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[str] = None

class CMSContentUpdate(BaseModel):
    content: dict

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminRegister(BaseModel):
    email: str
    password: str
    name: str

class StatusUpdate(BaseModel):
    status: str

# ─── Health ───

@api_router.get("/")
async def root():
    return {"message": "EasyLeaz API"}

# ─── Auth ───

@api_router.post("/auth/register")
async def register_admin(data: AdminRegister):
    existing = await db.admin_users.count_documents({})
    if existing > 0:
        raise HTTPException(status_code=400, detail="Un compte admin existe déjà")
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    admin = {"id": str(uuid.uuid4()), "email": data.email, "password": hashed, "name": data.name, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.admin_users.insert_one(admin)
    token = create_jwt_token({"sub": admin["id"], "email": admin["email"]})
    return {"success": True, "token": token, "admin": {"id": admin["id"], "email": admin["email"], "name": admin["name"]}}

@api_router.post("/auth/login")
async def login_admin(data: AdminLogin):
    admin = await db.admin_users.find_one({"email": data.email}, {"_id": 0})
    if admin and bcrypt.checkpw(data.password.encode(), admin["password"].encode()):
        token = create_jwt_token({"sub": admin["id"], "email": admin["email"]})
        return {"success": True, "token": token, "admin": {"id": admin["id"], "email": admin["email"], "name": admin["name"]}}
    raise HTTPException(status_code=401, detail="Identifiants incorrects")

@api_router.post("/admin/login")
async def admin_login_legacy(data: dict):
    password = data.get("password", "")
    if password == ADMIN_PASSWORD:
        admin = await db.admin_users.find_one({}, {"_id": 0})
        if admin:
            token = create_jwt_token({"sub": admin["id"], "email": admin["email"]})
            return {"success": True, "token": token}
        return {"success": True, "token": ADMIN_PASSWORD}
    raise HTTPException(status_code=401, detail="Mot de passe incorrect")

@api_router.get("/auth/me")
async def get_current_admin_info(admin: dict = Depends(get_current_admin)):
    return {"id": admin.get("id"), "email": admin.get("email"), "name": admin.get("name", "Admin")}

@api_router.post("/auth/seed")
async def seed_admin():
    existing = await db.admin_users.count_documents({})
    if existing == 0:
        # Use ADMIN_PASSWORD from env (mandatory in production) - fallback for dev only
        pwd = os.environ.get('ADMIN_PASSWORD', 'easyleaz2024')
        hashed = bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode()
        admin = {"id": str(uuid.uuid4()), "email": "admin@easyleaz.ch", "password": hashed, "name": "Admin", "created_at": datetime.now(timezone.utc).isoformat()}
        await db.admin_users.insert_one(admin)
        return {"success": True, "message": "Admin créé"}
    return {"success": True, "message": "Admin existe déjà"}

@api_router.post("/auth/reset-password")
async def reset_admin_password(secret: str = ""):
    """Reset admin password using ADMIN_RESET_SECRET env var as authorization.
    Useful for production password rotation without DB access."""
    expected_secret = os.environ.get('ADMIN_RESET_SECRET', '')
    if not expected_secret or secret != expected_secret:
        raise HTTPException(status_code=403, detail="Secret invalide")
    pwd = os.environ.get('ADMIN_PASSWORD', '')
    if not pwd or len(pwd) < 8:
        raise HTTPException(status_code=400, detail="ADMIN_PASSWORD non défini ou trop court")
    hashed = bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode()
    res = await db.admin_users.update_one({"email": "admin@easyleaz.ch"}, {"$set": {"password": hashed}})
    if res.matched_count == 0:
        # Create if absent
        admin = {"id": str(uuid.uuid4()), "email": "admin@easyleaz.ch", "password": hashed, "name": "Admin", "created_at": datetime.now(timezone.utc).isoformat()}
        await db.admin_users.insert_one(admin)
        return {"success": True, "message": "Admin créé avec nouveau mot de passe"}
    return {"success": True, "message": "Mot de passe admin réinitialisé"}

# ─── File Helpers ───

def validate_file(file: UploadFile):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Type de fichier non autorisé: {ext}. Formats acceptés: PDF, JPG, PNG")
    return ext

async def save_upload(file: UploadFile, doc_type: str) -> dict:
    ext = validate_file(file)
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    filepath = UPLOAD_DIR / filename
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"Fichier trop volumineux (max 5MB): {file.filename}")
    async with aiofiles.open(filepath, 'wb') as f:
        await f.write(content)
    return {"id": file_id, "type": doc_type, "original_name": file.filename, "file_path": str(filepath), "filename": filename, "size": len(content), "created_at": datetime.now(timezone.utc).isoformat()}

# ─── Email Notification ───

def _get_smtp_config():
    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_pass = os.environ.get('SMTP_PASS', '')
    smtp_from = os.environ.get('SMTP_FROM', '') or smtp_user
    notification_email = os.environ.get('NOTIFICATION_EMAIL', '')
    if not all([smtp_host, smtp_user, smtp_pass]):
        return None
    return {"host": smtp_host, "port": smtp_port, "user": smtp_user, "pass": smtp_pass, "from": smtp_from, "notification": notification_email}

def _send_email(config, to_email, subject, body_html, body_text):
    try:
        msg = MIMEMultipart("alternative")
        msg['From'] = config["from"]
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body_text, 'plain'))
        msg.attach(MIMEText(body_html, 'html'))
        with smtplib.SMTP(config["host"], config["port"]) as server:
            server.starttls()
            server.login(config["user"], config["pass"])
            server.send_message(msg)
        logger.info(f"Email envoyé à {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Erreur envoi email à {to_email}: {e}")
        return False

def send_lead_notification(lead: dict):
    config = _get_smtp_config()
    if not config or not config["notification"]:
        logger.info("SMTP non configuré, notification admin ignorée")
        return
    name = f"{lead.get('first_name', '')} {lead.get('last_name', '')}"
    doc_count = len(lead.get('documents', []))
    subject = f"Nouvelle demande de leasing - {name}"
    body_text = f"""Nouvelle demande de leasing reçue :

Nom : {name}
Email : {lead.get('email', '')}
Téléphone : {lead.get('phone', '')}
Nationalité : {lead.get('nationality', '')}
Véhicule souhaité : {lead.get('desired_vehicle', 'Non spécifié')}
Revenus : {lead.get('annual_income', '')}
Situation : {lead.get('professional_status', '')}
Documents joints : {doc_count}

Connectez-vous au CRM pour consulter le dossier complet."""
    body_html = f"""
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #071A1F; color: #E6F7FF; padding: 32px; border-radius: 16px;">
  <h2 style="color: #22D3EE; font-size: 18px; margin-bottom: 24px;">Nouvelle demande de leasing</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px 0; color: #E6F7FF80; font-size: 13px;">Nom</td><td style="padding: 8px 0; color: #E6F7FF; font-size: 14px;">{name}</td></tr>
    <tr><td style="padding: 8px 0; color: #E6F7FF80; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #E6F7FF; font-size: 14px;">{lead.get('email', '')}</td></tr>
    <tr><td style="padding: 8px 0; color: #E6F7FF80; font-size: 13px;">Téléphone</td><td style="padding: 8px 0; color: #E6F7FF; font-size: 14px;">{lead.get('phone', '')}</td></tr>
    <tr><td style="padding: 8px 0; color: #E6F7FF80; font-size: 13px;">Nationalité</td><td style="padding: 8px 0; color: #E6F7FF; font-size: 14px;">{lead.get('nationality', '')}</td></tr>
    <tr><td style="padding: 8px 0; color: #E6F7FF80; font-size: 13px;">Véhicule</td><td style="padding: 8px 0; color: #E6F7FF; font-size: 14px;">{lead.get('desired_vehicle', 'Non spécifié')}</td></tr>
    <tr><td style="padding: 8px 0; color: #E6F7FF80; font-size: 13px;">Revenus</td><td style="padding: 8px 0; color: #E6F7FF; font-size: 14px;">{lead.get('annual_income', '')}</td></tr>
    <tr><td style="padding: 8px 0; color: #E6F7FF80; font-size: 13px;">Documents</td><td style="padding: 8px 0; color: #E6F7FF; font-size: 14px;">{doc_count} fichier(s)</td></tr>
  </table>
  <p style="margin-top: 24px; font-size: 13px; color: #E6F7FF60;">Connectez-vous au CRM pour consulter le dossier complet.</p>
</div>"""
    _send_email(config, config["notification"], subject, body_html, body_text)

def send_client_confirmation(lead: dict):
    config = _get_smtp_config()
    if not config:
        logger.info("SMTP non configuré, confirmation client ignorée")
        return
    client_email = lead.get('email', '')
    if not client_email:
        return
    name = lead.get('first_name', '')
    subject = "EasyLeaz - Votre demande de leasing a bien été reçue"
    body_text = f"""Bonjour {name},

Nous avons bien reçu votre demande de leasing et notre équipe l'examine actuellement.

Véhicule demandé : {lead.get('desired_vehicle', 'Non spécifié')}

Un conseiller EasyLeaz vous contactera dans les plus brefs délais.

Cordialement,
L'équipe EasyLeaz
Genève"""
    body_html = f"""
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #071A1F; color: #E6F7FF; padding: 32px; border-radius: 16px;">
  <h2 style="color: #22D3EE; font-size: 20px; margin-bottom: 8px; font-family: 'Cinzel', serif; letter-spacing: 0.1em;">EASY LEAZ</h2>
  <p style="color: #E6F7FF80; font-size: 12px; margin-bottom: 24px; letter-spacing: 0.05em;">LEASING AUTOMOBILE PREMIUM</p>
  <hr style="border: none; border-top: 1px solid #22D3EE20; margin-bottom: 24px;" />
  <p style="font-size: 15px; color: #E6F7FF; margin-bottom: 16px;">Bonjour {name},</p>
  <p style="font-size: 14px; color: #E6F7FFcc; line-height: 1.6;">Nous avons bien reçu votre demande de leasing et notre équipe l'examine actuellement.</p>
  <div style="background: #0E2F36; border: 1px solid #22D3EE20; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <p style="font-size: 12px; color: #22D3EE; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Véhicule demandé</p>
    <p style="font-size: 16px; color: #E6F7FF; font-weight: 600;">{lead.get('desired_vehicle', 'Non spécifié')}</p>
  </div>
  <p style="font-size: 14px; color: #E6F7FFcc; line-height: 1.6;">Un conseiller EasyLeaz vous contactera dans les plus brefs délais pour la suite de votre dossier.</p>
  <hr style="border: none; border-top: 1px solid #22D3EE20; margin: 24px 0;" />
  <p style="font-size: 12px; color: #E6F7FF50;">Cordialement,<br/>L'équipe EasyLeaz — Genève</p>
</div>"""
    _send_email(config, client_email, subject, body_html, body_text)

# ─── Leads API ───

@api_router.post("/leads")
async def create_lead(
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: str = Form(...),
    email: str = Form(...),
    marital_status: str = Form(""),
    nationality: str = Form(""),
    birth_date: str = Form(""),
    address: str = Form(""),
    residence_permit: str = Form(""),
    children_count: str = Form(""),
    children_ages: str = Form(""),
    housing_cost: str = Form(""),
    housing_status: str = Form(""),
    employment_date: str = Form(""),
    monthly_income: str = Form(""),
    annual_income: str = Form(""),
    professional_status: str = Form(""),
    desired_vehicle: str = Form(""),
    identity_document: UploadFile = File(None),
    salary_slips: List[UploadFile] = File(None),
):
    # Validate email format
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Format d'email invalide")

    lead_id = str(uuid.uuid4())
    documents = []

    # Handle identity document
    if identity_document and identity_document.filename:
        doc = await save_upload(identity_document, "identity")
        doc["lead_id"] = lead_id
        documents.append(doc)

    # Handle salary slips
    if salary_slips:
        for slip in salary_slips:
            if slip and slip.filename:
                doc = await save_upload(slip, "salary")
                doc["lead_id"] = lead_id
                documents.append(doc)

    lead = {
        "id": lead_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,
        "marital_status": marital_status,
        "nationality": nationality,
        "birth_date": birth_date,
        "address": address,
        "residence_permit": residence_permit,
        "children_count": children_count,
        "children_ages": children_ages,
        "housing_cost": housing_cost,
        "housing_status": housing_status,
        "employment_date": employment_date,
        "monthly_income": monthly_income,
        "annual_income": annual_income,
        "professional_status": professional_status,
        "desired_vehicle": desired_vehicle,
        "status": "pending",
        "documents": [{"id": d["id"], "type": d["type"], "original_name": d["original_name"], "filename": d["filename"], "size": d["size"], "created_at": d["created_at"]} for d in documents],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.leads.insert_one(lead)
    if documents:
        await db.documents.insert_many(documents)

    # Try to send email notifications
    try:
        send_lead_notification(lead)
        send_client_confirmation(lead)
    except Exception:
        pass

    return {"success": True, "id": lead_id, "message": "Demande envoyée avec succès"}

# Keep backward compat for old form
@api_router.post("/leasing-requests")
async def create_leasing_request_compat(data: dict):
    lead_id = str(uuid.uuid4())
    lead = {
        "id": lead_id,
        "first_name": data.get("first_name", ""),
        "last_name": data.get("last_name", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "marital_status": data.get("marital_status", ""),
        "nationality": data.get("nationality", ""),
        "birth_date": data.get("birth_date", ""),
        "address": data.get("address", ""),
        "residence_permit": data.get("residence_permit", ""),
        "children_count": data.get("children_count", ""),
        "housing_cost": data.get("housing_cost", ""),
        "employment_date": data.get("employment_date", ""),
        "annual_income": data.get("income", data.get("annual_income", "")),
        "professional_status": data.get("professional_status", ""),
        "desired_vehicle": data.get("desired_vehicle", ""),
        "status": "pending",
        "documents": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.leads.insert_one(lead)
    return {"success": True, "id": lead_id}

@api_router.get("/leads")
async def get_leads(
    admin: dict = Depends(get_current_admin),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: str = Query("newest"),
):
    query = {}
    if status and status != "all":
        query["status"] = status
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]
    sort_dir = -1 if sort == "newest" else 1
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", sort_dir).to_list(1000)
    return leads

@api_router.get("/leads/stats")
async def get_leads_stats(admin: dict = Depends(get_current_admin)):
    total = await db.leads.count_documents({})
    pending = await db.leads.count_documents({"status": "pending"})
    approved = await db.leads.count_documents({"status": "approved"})
    rejected = await db.leads.count_documents({"status": "rejected"})
    recent = await db.leads.find({}, {"_id": 0, "id": 1, "first_name": 1, "last_name": 1, "status": 1, "created_at": 1, "desired_vehicle": 1}).sort("created_at", -1).to_list(5)
    return {"total": total, "pending": pending, "approved": approved, "rejected": rejected, "recent": recent}

@api_router.get("/leads/export")
async def export_leads_csv(
    admin: dict = Depends(get_current_admin),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
):
    query = {}
    if status and status != "all":
        query["status"] = status
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to + "T23:59:59"
        if date_filter:
            query["created_at"] = date_filter
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(10000)
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["Nom", "Prénom", "Email", "Téléphone", "Nationalité", "Date naissance", "État civil", "Adresse", "Permis séjour", "Enfants", "Revenus annuels", "Situation pro.", "Coût logement", "Début emploi", "Véhicule souhaité", "Statut", "Documents", "Date soumission"])
    for lead in leads:
        doc_count = len(lead.get("documents", []))
        writer.writerow([
            lead.get("last_name", ""), lead.get("first_name", ""), lead.get("email", ""),
            lead.get("phone", ""), lead.get("nationality", ""), lead.get("birth_date", ""),
            lead.get("marital_status", ""), lead.get("address", ""), lead.get("residence_permit", ""),
            lead.get("children_count", ""), lead.get("annual_income", ""), lead.get("professional_status", ""),
            lead.get("housing_cost", ""), lead.get("employment_date", ""), lead.get("desired_vehicle", ""),
            lead.get("status", ""), str(doc_count), lead.get("created_at", ""),
        ])
    output.seek(0)
    filename = f"easyleaz_leads_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@api_router.get("/leads/{lead_id}")
async def get_lead_detail(lead_id: str, admin: dict = Depends(get_current_admin)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return lead

@api_router.patch("/leads/{lead_id}")
async def update_lead_status(lead_id: str, data: StatusUpdate, admin: dict = Depends(get_current_admin)):
    if data.status not in ("pending", "approved", "rejected"):
        raise HTTPException(status_code=400, detail="Statut invalide")
    result = await db.leads.update_one({"id": lead_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return lead

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, admin: dict = Depends(get_current_admin)):
    # Delete associated files
    docs = await db.documents.find({"lead_id": lead_id}).to_list(100)
    for doc in docs:
        filepath = Path(doc.get("file_path", ""))
        if filepath.exists():
            filepath.unlink()
    await db.documents.delete_many({"lead_id": lead_id})
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return {"success": True}

@api_router.get("/leads/{lead_id}/documents/{doc_id}/download")
async def download_document(lead_id: str, doc_id: str, admin: dict = Depends(get_current_admin)):
    doc = await db.documents.find_one({"id": doc_id, "lead_id": lead_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    filepath = Path(doc.get("file_path", ""))
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier non trouvé sur le serveur")
    return FileResponse(str(filepath), filename=doc.get("original_name", "document"), media_type="application/octet-stream")

# Keep old leasing-requests GET for backward compat
@api_router.get("/leasing-requests")
async def get_leasing_requests_compat(admin: dict = Depends(get_current_admin)):
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return leads

@api_router.put("/leasing-requests/{request_id}")
async def update_leasing_request_compat(request_id: str, status: str = Query(...), admin: dict = Depends(get_current_admin)):
    await db.leads.update_one({"id": request_id}, {"$set": {"status": status}})
    doc = await db.leads.find_one({"id": request_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return doc

# ─── Vehicles ───

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(condition: Optional[str] = Query(None)):
    query = {"status": "active"}
    if condition and condition != "all":
        query["condition"] = condition
    vehicles = await db.vehicles.find(query, {"_id": 0}).to_list(100)
    return vehicles

@api_router.get("/vehicles/all", response_model=List[Vehicle])
async def get_all_vehicles(admin: dict = Depends(get_current_admin)):
    vehicles = await db.vehicles.find({}, {"_id": 0}).to_list(100)
    return vehicles

@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(data: VehicleCreate, admin: dict = Depends(get_current_admin)):
    vehicle = Vehicle(**data.model_dump())
    doc = vehicle.model_dump()
    await db.vehicles.insert_one(doc)
    return vehicle

@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, data: VehicleUpdate, admin: dict = Depends(get_current_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    await db.vehicles.update_one({"id": vehicle_id}, {"$set": update_data})
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    return vehicle

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, admin: dict = Depends(get_current_admin)):
    # Delete associated images
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if vehicle:
        for img in vehicle.get("images", []):
            fpath = UPLOAD_DIR / "vehicles" / img.get("filename", "")
            if fpath.exists():
                fpath.unlink()
    result = await db.vehicles.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    return {"success": True}

# ─── Vehicle Images ───

VEHICLE_UPLOAD_DIR = UPLOAD_DIR / "vehicles"
VEHICLE_UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/vehicles/{vehicle_id}/images")
async def upload_vehicle_images(vehicle_id: str, files: List[UploadFile] = File(...), admin: dict = Depends(get_current_admin)):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    uploaded = []
    for file in files:
        if not file.filename:
            continue
        ext = validate_file(file)
        file_id = str(uuid.uuid4())
        filename = f"{file_id}{ext}"
        filepath = VEHICLE_UPLOAD_DIR / filename
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"Fichier trop volumineux (max 5MB): {file.filename}")
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(content)
        img_data = {"id": file_id, "filename": filename, "original_name": file.filename, "size": len(content), "created_at": datetime.now(timezone.utc).isoformat()}
        uploaded.append(img_data)
    if uploaded:
        await db.vehicles.update_one({"id": vehicle_id}, {"$push": {"images": {"$each": uploaded}}})
        # Set first image as main image_url if none set
        if not vehicle.get("image_url"):
            await db.vehicles.update_one({"id": vehicle_id}, {"$set": {"image_url": f"/api/uploads/vehicles/{uploaded[0]['filename']}"}})
    updated = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return updated

@api_router.delete("/vehicles/{vehicle_id}/images/{image_id}")
async def delete_vehicle_image(vehicle_id: str, image_id: str, admin: dict = Depends(get_current_admin)):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    image = next((img for img in vehicle.get("images", []) if img["id"] == image_id), None)
    if not image:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    fpath = VEHICLE_UPLOAD_DIR / image.get("filename", "")
    if fpath.exists():
        fpath.unlink()
    await db.vehicles.update_one({"id": vehicle_id}, {"$pull": {"images": {"id": image_id}}})
    # Update image_url if we deleted the main image
    current_url = vehicle.get("image_url", "")
    if image["filename"] in current_url:
        remaining = [img for img in vehicle.get("images", []) if img["id"] != image_id]
        new_url = f"/api/uploads/vehicles/{remaining[0]['filename']}" if remaining else ""
        await db.vehicles.update_one({"id": vehicle_id}, {"$set": {"image_url": new_url}})
    updated = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return updated

@api_router.post("/vehicles/{vehicle_id}/main-image")
async def set_main_image(vehicle_id: str, data: dict, admin: dict = Depends(get_current_admin)):
    image_id = data.get("image_id", "")
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    image = next((img for img in vehicle.get("images", []) if img["id"] == image_id), None)
    if not image:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    await db.vehicles.update_one({"id": vehicle_id}, {"$set": {"image_url": f"/api/uploads/vehicles/{image['filename']}"}})
    updated = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return updated

# ─── Static file serving for uploads ───

@api_router.get("/uploads/vehicles/{filename}")
async def serve_vehicle_image(filename: str):
    filepath = VEHICLE_UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    ext = filepath.suffix.lower()
    media_types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf"}
    return FileResponse(str(filepath), media_type=media_types.get(ext, "application/octet-stream"))

# ─── CMS ───

DEFAULT_CMS = {
    "hero": {"title": "LEASING AUTOMOBILE PREMIUM À GENÈVE", "subtitle": "Neuf & occasion • Réponse rapide • Accompagnement complet", "cta_primary": "Demande de leasing", "cta_secondary": "Nous contacter", "background_image": "https://images.unsplash.com/photo-1617814076231-2c58846db944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxtZXJjZWRlcyUyMGFtZyUyMGRhcmt8ZW58MHx8fHwxNzc0MTEwNTk1fDA&ixlib=rb-4.1.0&q=85"},
    "vehicle_cta": {"title": "CHOISISSEZ VOTRE VÉHICULE", "subtitle": "Découvrez notre sélection de véhicules neufs et d'occasion, sélectionnés avec soin par nos experts.", "cta_text": "Voir le catalogue"},
    "about": {"title": "QUI SOMMES-NOUS ?", "content": "EasyLeaz est votre partenaire de confiance pour le leasing automobile à Genève. Fondée par des passionnés de l'automobile, notre entreprise s'est donné pour mission de rendre le leasing accessible, transparent et sur-mesure.\n\nNous accompagnons chaque client de A à Z : du choix du véhicule à la signature du contrat, en passant par la recherche du meilleur financement adapté à votre profil. Que vous recherchiez un véhicule neuf ou d'occasion, notre équipe d'experts sélectionne pour vous les meilleures offres du marché suisse.\n\nNotre approche se distingue par un service personnalisé, une réponse rapide et une transparence totale sur les conditions de leasing. Basés à Genève, nous connaissons parfaitement le marché local et les attentes de notre clientèle exigeante."},
    "faq": {"title": "QUESTIONS FRÉQUENTES", "subtitle": "Tout ce que vous devez savoir sur le leasing automobile", "questions": [
        {"question": "Qu'est-ce que le leasing automobile ?", "answer": "Le leasing automobile est un mode de financement qui vous permet de conduire un véhicule neuf ou d'occasion en échange de mensualités fixes, sans avoir à acheter le véhicule. À la fin du contrat, vous pouvez restituer le véhicule, le racheter ou en choisir un nouveau."},
        {"question": "Quelles sont les conditions pour obtenir un leasing ?", "answer": "Pour obtenir un leasing en Suisse, vous devez généralement être résident (permis C, B ou citoyen suisse), avoir un emploi stable, et justifier de revenus suffisants pour couvrir les mensualités. Chaque dossier est étudié individuellement."},
        {"question": "Quelle est la durée d'un contrat de leasing ?", "answer": "La durée standard d'un contrat de leasing est comprise entre 24 et 60 mois. La durée est définie en fonction de vos préférences et du véhicule choisi. Plus la durée est longue, plus les mensualités sont basses."},
        {"question": "Quel apport initial est nécessaire ?", "answer": "L'apport initial (ou premier versement majoré) varie selon le véhicule et votre profil. Dans certains cas, il est possible de démarrer un leasing sans apport. Notre équipe vous conseillera sur la meilleure option."},
        {"question": "Puis-je résilier mon contrat de leasing avant terme ?", "answer": "Une résiliation anticipée est possible mais peut entraîner des frais. Nous vous expliquons en détail les conditions avant la signature du contrat pour éviter toute surprise."},
        {"question": "Le leasing couvre-t-il l'assurance du véhicule ?", "answer": "Le leasing ne couvre généralement pas l'assurance. Vous devrez souscrire une assurance casco complète pour la durée du contrat. Nous pouvons vous orienter vers nos partenaires assureurs pour obtenir les meilleures offres."},
        {"question": "Quelle est la différence entre leasing et crédit auto ?", "answer": "Avec un leasing, vous louez le véhicule et payez des mensualités sans en devenir propriétaire (sauf rachat en fin de contrat). Avec un crédit auto, vous achetez le véhicule et en devenez propriétaire dès le départ, mais les mensualités sont généralement plus élevées."},
        {"question": "Puis-je choisir n'importe quel véhicule ?", "answer": "Oui, vous pouvez choisir parmi notre sélection de véhicules ou nous indiquer le modèle exact que vous souhaitez. Nous nous chargeons de trouver le véhicule et de négocier les meilleures conditions pour vous."},
        {"question": "Combien de temps prend le traitement d'une demande ?", "answer": "Nous nous engageons à traiter votre demande dans les 24 à 48 heures. Une fois votre dossier approuvé, la livraison du véhicule dépend de sa disponibilité (immédiate pour les occasions, quelques semaines pour les véhicules neufs)."},
        {"question": "Quels documents dois-je fournir ?", "answer": "Vous devrez fournir une pièce d'identité valide, vos 3 dernières fiches de paie, un justificatif de domicile et votre permis de séjour (si applicable). Tous ces documents peuvent être téléchargés directement via notre formulaire en ligne."}
    ]},
    "process": {"title": "COMMENT ÇA MARCHE", "subtitle": "Un processus simple et rapide en 3 étapes", "steps": [{"number": "01", "title": "Choix du véhicule", "description": "Parcourez notre sélection ou indiquez-nous le véhicule de vos rêves."}, {"number": "02", "title": "Demande de leasing", "description": "Remplissez votre demande en quelques minutes. Nous nous occupons du reste."}, {"number": "03", "title": "Validation rapide", "description": "Recevez une réponse rapide et prenez le volant de votre nouveau véhicule."}]},
    "leasing_form": {"title": "FAITES VOTRE DEMANDE DE LEASING", "subtitle": "En quelques minutes, soumettez votre dossier et recevez une réponse rapide."},
    "contact": {"title": "CONTACTEZ-NOUS", "phone": "0799493229", "location": "Genève", "instagram_url": "https://www.instagram.com/easyleazge?igsh=dnQ5ODBxcGthMWp2", "whatsapp": "0799493229"},
    "navbar": {"logo_text": "EASY LEAZ", "links": ["Catalogue", "Processus", "Demande", "Contact"]},
    "theme": {"primary": "#22D3EE", "primary_hover": "#0EA5B7", "accent": "#C9A227", "background": "#071A1F", "background_alt": "#0A2A30", "text": "#E6F7FF"},
    "sections_config": {"about": True, "process": True, "vehicle_cta": True, "leasing_form": True, "faq": True, "easyloc_switch": True, "contact": True},
    "hero_media": {"type": "video", "url": "/videos/easyleaz-hero.mp4", "overlay_opacity": 0.5}
}

@api_router.get("/cms/{section_key}")
async def get_cms_section(section_key: str):
    doc = await db.cms_content.find_one({"section_key": section_key}, {"_id": 0})
    if doc:
        return doc
    if section_key in DEFAULT_CMS:
        default = {"section_key": section_key, "content": DEFAULT_CMS[section_key], "updated_at": datetime.now(timezone.utc).isoformat()}
        await db.cms_content.insert_one({**default})
        return default
    raise HTTPException(status_code=404, detail="Section non trouvée")

@api_router.get("/cms")
async def get_all_cms():
    sections = await db.cms_content.find({}, {"_id": 0}).to_list(100)
    existing_keys = {s["section_key"] for s in sections}
    for key, content in DEFAULT_CMS.items():
        if key not in existing_keys:
            default = {"section_key": key, "content": content, "updated_at": datetime.now(timezone.utc).isoformat()}
            await db.cms_content.insert_one({**default})
            sections.append(default)
    return sections

@api_router.put("/cms/{section_key}")
async def update_cms_section(section_key: str, data: CMSContentUpdate, admin: dict = Depends(get_current_admin)):
    update = {"content": data.content, "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.cms_content.update_one({"section_key": section_key}, {"$set": update}, upsert=True)
    doc = await db.cms_content.find_one({"section_key": section_key}, {"_id": 0})
    return doc

# ─── Seed ───

@api_router.post("/seed")
async def seed_data():
    # Vehicles auto-seed disabled — vehicles are curated manually via admin panel
    # Migrate existing vehicles without condition field
    await db.vehicles.update_many({"condition": {"$exists": False}, "badge": "Neuf"}, {"$set": {"condition": "neuf"}})
    await db.vehicles.update_many({"condition": {"$exists": False}}, {"$set": {"condition": "occasion"}})
    # Seed CMS - add missing sections
    for key, content in DEFAULT_CMS.items():
        existing = await db.cms_content.find_one({"section_key": key})
        if not existing:
            await db.cms_content.insert_one({"section_key": key, "content": content, "updated_at": datetime.now(timezone.utc).isoformat()})
    # Seed admin
    admin_count = await db.admin_users.count_documents({})
    if admin_count == 0:
        hashed = bcrypt.hashpw("easyleaz2024".encode(), bcrypt.gensalt()).decode()
        await db.admin_users.insert_one({"id": str(uuid.uuid4()), "email": "admin@easyleaz.ch", "password": hashed, "name": "Admin EasyLeaz", "created_at": datetime.now(timezone.utc).isoformat()})
    return {"success": True, "message": "Données initiales créées"}

# ═══════════════════════════════════════════════════════════════════
# CMS Assets Upload (shared by EasyLeaz + EasyLoc, admin-only)
# Supports images (jpg/png/webp) and videos (mp4/webm/mov) up to 200MB
# ═══════════════════════════════════════════════════════════════════

@api_router.post("/cms/assets")
async def upload_cms_asset(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Fichier manquant")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_ASSET_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Format non autorisé: {ext}")
    content = await file.read()
    if len(content) > MAX_ASSET_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 200MB)")
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    filepath = ASSETS_DIR / filename
    async with aiofiles.open(filepath, 'wb') as f:
        await f.write(content)
    return {"url": f"/api/cms/assets/{filename}", "filename": filename, "size": len(content)}

@api_router.get("/cms/assets/{filename}")
async def serve_cms_asset(filename: str):
    filepath = ASSETS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    ext = filepath.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
        ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
    }
    return FileResponse(str(filepath), media_type=media_types.get(ext, "application/octet-stream"))

@api_router.delete("/cms/assets/{filename}")
async def delete_cms_asset(filename: str, admin: dict = Depends(get_current_admin)):
    filepath = ASSETS_DIR / filename
    if filepath.exists():
        filepath.unlink()
    return {"deleted": filename}


# ═══════════════════════════════════════════════════════════════════
# EasyLoc — Second site "2-in-1". All routes prefixed /api/easyloc/*
# Collections: easyloc_vehicles, easyloc_reservations, easyloc_content
# Admin auth: unified with EasyLeaz JWT (via get_current_admin)
# ═══════════════════════════════════════════════════════════════════

easyloc_router = APIRouter(prefix="/api/easyloc")

class ELReservationCreate(BaseModel):
    nom: str
    prenom: str
    telephone: str
    email: str
    vehicule: str
    vehicle_id: str = ""
    date_debut: str
    date_fin: str
    message: str = ""

class ELVehicleCreate(BaseModel):
    name: str
    year: int
    image: str
    images: list = Field(default_factory=list)
    price_day: int
    price_weekend: int
    km_included: str = "200 km/jour inclus"
    description: str = ""
    specs: dict = {}
    category: str = "berline"
    available: bool = True
    order: int = 0

EL_SEED_VEHICLES = [
    {"name": "Mercedes-AMG GT", "year": 2024, "image": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80", "price_day": 450, "price_weekend": 1200, "km_included": "200 km/jour inclus", "specs": {"power": "585 ch", "acceleration": "0-100 en 3.2s", "transmission": "Automatique", "fuel": "Essence"}, "category": "sport", "available": True, "order": 0},
    {"name": "Porsche 911 Turbo S", "year": 2024, "image": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80", "price_day": 550, "price_weekend": 1500, "km_included": "200 km/jour inclus", "specs": {"power": "650 ch", "acceleration": "0-100 en 2.7s", "transmission": "PDK", "fuel": "Essence"}, "category": "sport", "available": True, "order": 1},
    {"name": "BMW M8 Competition", "year": 2024, "image": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80", "price_day": 400, "price_weekend": 1100, "km_included": "250 km/jour inclus", "specs": {"power": "625 ch", "acceleration": "0-100 en 3.0s", "transmission": "Automatique", "fuel": "Essence"}, "category": "sport", "available": True, "order": 2},
    {"name": "Range Rover Autobiography", "year": 2024, "image": "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80", "price_day": 380, "price_weekend": 1000, "km_included": "300 km/jour inclus", "specs": {"power": "530 ch", "acceleration": "0-100 en 4.6s", "transmission": "Automatique", "fuel": "Diesel"}, "category": "suv", "available": True, "order": 3},
    {"name": "Bentley Continental GT", "year": 2024, "image": "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80", "price_day": 650, "price_weekend": 1800, "km_included": "200 km/jour inclus", "specs": {"power": "659 ch", "acceleration": "0-100 en 3.6s", "transmission": "Automatique", "fuel": "Essence"}, "category": "luxe", "available": True, "order": 4},
    {"name": "Lamborghini Huracan EVO", "year": 2024, "image": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80", "price_day": 800, "price_weekend": 2200, "km_included": "150 km/jour inclus", "specs": {"power": "640 ch", "acceleration": "0-100 en 2.9s", "transmission": "Automatique", "fuel": "Essence"}, "category": "supercar", "available": True, "order": 5},
    {"name": "Audi RS e-tron GT", "year": 2024, "image": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80", "price_day": 420, "price_weekend": 1150, "km_included": "250 km/jour inclus", "specs": {"power": "646 ch", "acceleration": "0-100 en 3.3s", "transmission": "Automatique", "fuel": "Electrique"}, "category": "electrique", "available": True, "order": 6},
    {"name": "Mercedes Classe S", "year": 2024, "image": "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80", "price_day": 350, "price_weekend": 950, "km_included": "300 km/jour inclus", "specs": {"power": "503 ch", "acceleration": "0-100 en 4.4s", "transmission": "Automatique", "fuel": "Hybride"}, "category": "berline", "available": True, "order": 7},
    {"name": "Ferrari Roma", "year": 2024, "image": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80", "price_day": 900, "price_weekend": 2500, "km_included": "150 km/jour inclus", "specs": {"power": "620 ch", "acceleration": "0-100 en 3.4s", "transmission": "Automatique", "fuel": "Essence"}, "category": "supercar", "available": True, "order": 8},
]

EL_SEED_CONTENT = {
    "hero": {"title": "Location de vehicules premium a Geneve", "subtitle": "Service sur mesure · Vehicules d'exception · Disponibilite immediate", "cta_primary": "Reserver maintenant", "cta_secondary": "Voir les vehicules", "image": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"},
    "process": {"title": "Comment ca fonctionne", "steps": [{"number": "01", "title": "Choisissez votre vehicule", "description": "Parcourez notre catalogue de vehicules premium et selectionnez celui qui correspond a vos envies."}, {"number": "02", "title": "Selectionnez vos dates", "description": "Choisissez vos dates de location et consultez la disponibilite en temps reel."}, {"number": "03", "title": "Validez votre reservation", "description": "Confirmez votre demande et notre equipe vous contactera sous 30 minutes."}]},
    "reservation_cta": {"title": "Reservez votre vehicule en quelques minutes", "subtitle": "Notre equipe est a votre disposition pour vous accompagner dans votre choix.", "cta": "Faire une demande de reservation", "image": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"},
    "appointment": {"title": "Parler avec un conseiller EasyLoc", "subtitle": "Prenez rendez-vous avec l'un de nos conseillers pour un accompagnement personnalise.", "cta": "Prendre rendez-vous", "embed_url": ""},
    "contact": {"phone": "079 949 32 29", "whatsapp": "078 898 32 29", "location": "Geneve", "instagram": "https://www.instagram.com/easylocge?igsh=MWJ0NXo1eGZncmI3MA==", "email": "contact@easyloc.ch"},
    "reservation_form": {"title": "Faire une demande de reservation", "subtitle": "Remplissez le formulaire ci-dessous et nous vous recontacterons dans les plus brefs delais.", "embed_url": ""},
    "navbar": {"brand": "EASYLOC", "links": ["Vehicules", "Comment ca marche", "Reservation", "Contact"]},
    "footer": {"brand": "EASYLOC", "tagline": "Location de vehicules premium a Geneve", "copyright": "2025 EasyLoc. Tous droits reserves."},
    "theme": {"primary": "#C9A227", "primary_hover": "#D4AF37", "accent": "#22D3EE", "background": "#080705", "background_alt": "#0C0A07", "text": "#FAF8F5"},
    "sections_config": {"vehicles": True, "process": True, "reservation_form": True, "appointment": True, "reservation_cta": True, "easyleaz_switch": True, "contact": True},
    "hero_media": {"type": "video", "url": "/videos/easyloc-hero.mp4", "overlay_opacity": 0.6},
}

async def seed_easyloc():
    # Only seed content sections — vehicles are curated manually via admin panel
    for section, content in EL_SEED_CONTENT.items():
        existing = await db.easyloc_content.find_one({"section": section}, {"_id": 0})
        if not existing:
            await db.easyloc_content.insert_one({"section": section, "content": content})

# Public routes
@easyloc_router.get("/content")
async def el_get_all_content():
    docs = await db.easyloc_content.find({}, {"_id": 0}).to_list(100)
    return {doc["section"]: doc["content"] for doc in docs}

@easyloc_router.get("/content/{section}")
async def el_get_content(section: str):
    doc = await db.easyloc_content.find_one({"section": section}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Section not found")
    return doc["content"]

@easyloc_router.get("/vehicles")
async def el_get_vehicles():
    return await db.easyloc_vehicles.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@easyloc_router.get("/vehicles/{vehicle_id}")
async def el_get_vehicle(vehicle_id: str):
    vehicle = await db.easyloc_vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@easyloc_router.get("/vehicles/{vehicle_id}/unavailable-dates")
async def el_get_unavailable_dates(vehicle_id: str):
    """Return list of ISO date strings (YYYY-MM-DD) that are blocked by approved reservations."""
    reservations = await db.easyloc_reservations.find(
        {"vehicle_id": vehicle_id, "status": "approved"},
        {"_id": 0, "date_debut": 1, "date_fin": 1}
    ).to_list(1000)
    blocked = set()
    from datetime import date as _date, timedelta as _td
    for r in reservations:
        try:
            start = _date.fromisoformat(r.get("date_debut", "")[:10])
            end = _date.fromisoformat(r.get("date_fin", "")[:10])
            d = start
            while d <= end:
                blocked.add(d.isoformat())
                d += _td(days=1)
        except (ValueError, TypeError):
            continue
    return sorted(blocked)

@easyloc_router.post("/reservations")
async def el_create_reservation(data: ELReservationCreate):
    reservation = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.easyloc_reservations.insert_one(reservation)
    return {"id": reservation["id"], "status": "pending", "message": "Reservation created successfully"}

# Admin routes (use unified EasyLeaz JWT)
@easyloc_router.put("/admin/content/{section}")
async def el_update_content(section: str, data: dict, admin: dict = Depends(get_current_admin)):
    await db.easyloc_content.update_one({"section": section}, {"$set": {"content": data}}, upsert=True)
    return {"status": "updated", "section": section}

@easyloc_router.post("/admin/vehicles")
async def el_create_vehicle(data: ELVehicleCreate, admin: dict = Depends(get_current_admin)):
    doc = {"id": str(uuid.uuid4()), **data.model_dump()}
    await db.easyloc_vehicles.insert_one(doc)
    return {"id": doc["id"], "status": "created"}

@easyloc_router.put("/admin/vehicles/{vehicle_id}")
async def el_update_vehicle(vehicle_id: str, data: dict, admin: dict = Depends(get_current_admin)):
    result = await db.easyloc_vehicles.update_one({"id": vehicle_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"status": "updated"}

@easyloc_router.delete("/admin/vehicles/{vehicle_id}")
async def el_delete_vehicle(vehicle_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.easyloc_vehicles.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"status": "deleted"}

@easyloc_router.get("/admin/reservations")
async def el_get_reservations(admin: dict = Depends(get_current_admin)):
    return await db.easyloc_reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@easyloc_router.put("/admin/reservations/{reservation_id}")
async def el_update_reservation_status(reservation_id: str, data: dict, admin: dict = Depends(get_current_admin)):
    result = await db.easyloc_reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": data.get("status", "pending")}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"status": "updated"}

# EasyLoc vehicle images upload
EL_VEHICLE_UPLOAD_DIR = UPLOAD_DIR / "easyloc_vehicles"
EL_VEHICLE_UPLOAD_DIR.mkdir(exist_ok=True)

@easyloc_router.post("/admin/vehicles/{vehicle_id}/images")
async def el_upload_vehicle_images(vehicle_id: str, files: List[UploadFile] = File(...), admin: dict = Depends(get_current_admin)):
    vehicle = await db.easyloc_vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    uploaded_urls = []
    for file in files:
        if not file.filename:
            continue
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Format non autorisé: {ext}")
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"Fichier trop volumineux (max 5MB): {file.filename}")
        file_id = str(uuid.uuid4())
        filename = f"{file_id}{ext}"
        filepath = EL_VEHICLE_UPLOAD_DIR / filename
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(content)
        uploaded_urls.append(f"/api/easyloc/uploads/{filename}")
    if uploaded_urls:
        existing = vehicle.get("images", []) or []
        new_images = existing + uploaded_urls
        update = {"images": new_images}
        # Set main image if empty
        if not vehicle.get("image"):
            update["image"] = uploaded_urls[0]
        await db.easyloc_vehicles.update_one({"id": vehicle_id}, {"$set": update})
    updated = await db.easyloc_vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return updated

@easyloc_router.delete("/admin/vehicles/{vehicle_id}/images")
async def el_delete_vehicle_image(vehicle_id: str, image_url: str = Query(...), admin: dict = Depends(get_current_admin)):
    vehicle = await db.easyloc_vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    images = vehicle.get("images", []) or []
    if image_url not in images:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    # Delete file if it's a local upload
    if image_url.startswith("/api/easyloc/uploads/"):
        fname = image_url.rsplit("/", 1)[-1]
        fpath = EL_VEHICLE_UPLOAD_DIR / fname
        if fpath.exists():
            fpath.unlink()
    new_images = [u for u in images if u != image_url]
    update = {"images": new_images}
    # Update main image if needed
    if vehicle.get("image") == image_url:
        update["image"] = new_images[0] if new_images else ""
    await db.easyloc_vehicles.update_one({"id": vehicle_id}, {"$set": update})
    return await db.easyloc_vehicles.find_one({"id": vehicle_id}, {"_id": 0})

@easyloc_router.post("/admin/vehicles/{vehicle_id}/main-image")
async def el_set_main_image(vehicle_id: str, data: dict, admin: dict = Depends(get_current_admin)):
    image_url = data.get("image_url", "")
    vehicle = await db.easyloc_vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if image_url not in (vehicle.get("images", []) or []):
        raise HTTPException(status_code=400, detail="Image pas dans la galerie")
    await db.easyloc_vehicles.update_one({"id": vehicle_id}, {"$set": {"image": image_url}})
    return await db.easyloc_vehicles.find_one({"id": vehicle_id}, {"_id": 0})

@easyloc_router.get("/uploads/{filename}")
async def el_serve_upload(filename: str):
    filepath = EL_VEHICLE_UPLOAD_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    ext = filepath.suffix.lower()
    media_types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}
    return FileResponse(str(filepath), media_type=media_types.get(ext, "application/octet-stream"))

@easyloc_router.post("/seed")
async def el_seed():
    await seed_easyloc()
    return {"success": True}

app.include_router(easyloc_router)

@app.on_event("startup")
async def _startup_easyloc_seed():
    await seed_easyloc()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
