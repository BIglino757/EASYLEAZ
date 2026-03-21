from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'easyleaz2024')

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
    badge: str = ""
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
    badge: str = ""

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
    badge: Optional[str] = None
    status: Optional[str] = None

class CMSContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    section_key: str
    content: dict
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CMSContentUpdate(BaseModel):
    content: dict

class LeasingRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    phone: str
    email: str
    income: str = ""
    professional_status: str = ""
    desired_vehicle: str = ""
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LeasingRequestCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str
    income: str = ""
    professional_status: str = ""
    desired_vehicle: str = ""

class AdminLogin(BaseModel):
    password: str

# ─── Auth ───

async def verify_admin(x_admin_token: str = Header(None)):
    if x_admin_token != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Non autorisé")
    return True

# ─── Health ───

@api_router.get("/")
async def root():
    return {"message": "EasyLeaz API"}

# ─── Admin Auth ───

@api_router.post("/admin/login")
async def admin_login(data: AdminLogin):
    if data.password == ADMIN_PASSWORD:
        return {"success": True, "token": ADMIN_PASSWORD}
    raise HTTPException(status_code=401, detail="Mot de passe incorrect")

# ─── Vehicles ───

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles():
    vehicles = await db.vehicles.find({"status": "active"}, {"_id": 0}).to_list(100)
    return vehicles

@api_router.get("/vehicles/all", response_model=List[Vehicle])
async def get_all_vehicles(auth: bool = Depends(verify_admin)):
    vehicles = await db.vehicles.find({}, {"_id": 0}).to_list(100)
    return vehicles

@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(data: VehicleCreate, auth: bool = Depends(verify_admin)):
    vehicle = Vehicle(**data.model_dump())
    doc = vehicle.model_dump()
    await db.vehicles.insert_one(doc)
    return vehicle

@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, data: VehicleUpdate, auth: bool = Depends(verify_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    await db.vehicles.update_one({"id": vehicle_id}, {"$set": update_data})
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    return vehicle

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, auth: bool = Depends(verify_admin)):
    result = await db.vehicles.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    return {"success": True}

# ─── CMS ───

DEFAULT_CMS = {
    "hero": {
        "title": "LEASING AUTOMOBILE PREMIUM À GENÈVE",
        "subtitle": "Neuf & occasion • Réponse rapide • Accompagnement complet",
        "cta_primary": "Demande de leasing",
        "cta_secondary": "Prendre rendez-vous",
        "background_image": "https://images.unsplash.com/photo-1617814076231-2c58846db944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxtZXJjZWRlcyUyMGFtZyUyMGRhcmt8ZW58MHx8fHwxNzc0MTEwNTk1fDA&ixlib=rb-4.1.0&q=85"
    },
    "vehicles": {
        "title": "NOS VÉHICULES",
        "subtitle": "Une sélection premium de véhicules neufs et d'occasion"
    },
    "process": {
        "title": "COMMENT ÇA MARCHE",
        "subtitle": "Un processus simple et rapide en 3 étapes",
        "steps": [
            {"number": "01", "title": "Choix du véhicule", "description": "Parcourez notre sélection ou indiquez-nous le véhicule de vos rêves."},
            {"number": "02", "title": "Demande de leasing", "description": "Remplissez votre demande en quelques minutes. Nous nous occupons du reste."},
            {"number": "03", "title": "Validation rapide", "description": "Recevez une réponse rapide et prenez le volant de votre nouveau véhicule."}
        ]
    },
    "leasing_form": {
        "title": "FAITES VOTRE DEMANDE DE LEASING",
        "subtitle": "En quelques minutes, soumettez votre dossier et recevez une réponse rapide."
    },
    "appointment": {
        "title": "PARLER AVEC UN EXPERT EASYLEAZ",
        "subtitle": "Prenez rendez-vous avec l'un de nos conseillers spécialisés",
        "calendly_url": ""
    },
    "contact": {
        "title": "CONTACTEZ-NOUS",
        "phone": "0799493229",
        "location": "Genève",
        "instagram_url": "https://www.instagram.com/easyleazge?igsh=dnQ5ODBxcGthMWp2",
        "whatsapp": "0799493229"
    },
    "navbar": {
        "logo_text": "EASY LEAZ",
        "links": ["Véhicules", "Processus", "Demande", "Contact"]
    }
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
async def update_cms_section(section_key: str, data: CMSContentUpdate, auth: bool = Depends(verify_admin)):
    update = {"content": data.content, "updated_at": datetime.now(timezone.utc).isoformat()}
    result = await db.cms_content.update_one({"section_key": section_key}, {"$set": update}, upsert=True)
    doc = await db.cms_content.find_one({"section_key": section_key}, {"_id": 0})
    return doc

# ─── Leasing Requests ───

@api_router.post("/leasing-requests", response_model=LeasingRequest)
async def create_leasing_request(data: LeasingRequestCreate):
    req = LeasingRequest(**data.model_dump())
    doc = req.model_dump()
    await db.leasing_requests.insert_one(doc)
    return req

@api_router.get("/leasing-requests", response_model=List[LeasingRequest])
async def get_leasing_requests(auth: bool = Depends(verify_admin)):
    requests = await db.leasing_requests.find({}, {"_id": 0}).to_list(1000)
    return requests

@api_router.put("/leasing-requests/{request_id}")
async def update_leasing_request_status(request_id: str, status: str, auth: bool = Depends(verify_admin)):
    await db.leasing_requests.update_one({"id": request_id}, {"$set": {"status": status}})
    doc = await db.leasing_requests.find_one({"id": request_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return doc

# ─── Seed Data ───

@api_router.post("/seed")
async def seed_data():
    count = await db.vehicles.count_documents({})
    if count == 0:
        vehicles = [
            {"id": str(uuid.uuid4()), "brand": "Mercedes-AMG", "model": "GT 63 S", "year": 2024, "mileage": 1200, "fuel": "Essence", "transmission": "Automatique", "price": 185000, "monthly_payment": 2450, "image_url": "https://images.unsplash.com/photo-1617814076231-2c58846db944?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxtZXJjZWRlcyUyMGFtZyUyMGRhcmt8ZW58MHx8fHwxNzc0MTEwNTk1fDA&ixlib=rb-4.1.0&q=85", "badge": "Occasion sélectionnée", "status": "active", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "brand": "Porsche", "model": "911 Carrera S", "year": 2023, "mileage": 8500, "fuel": "Essence", "transmission": "Automatique", "price": 152000, "monthly_payment": 1980, "image_url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHw0fHxtZXJjZWRlcyUyMGFtZyUyMGRhcmt8ZW58MHx8fHwxNzc0MTEwNTk1fDA&ixlib=rb-4.1.0&q=85", "badge": "Occasion sélectionnée", "status": "active", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "brand": "McLaren", "model": "720S", "year": 2023, "mileage": 3200, "fuel": "Essence", "transmission": "Automatique", "price": 265000, "monthly_payment": 3500, "image_url": "https://images.pexels.com/photos/5050537/pexels-photo-5050537.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": "Premium", "status": "active", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "brand": "BMW", "model": "M4 Competition", "year": 2024, "mileage": 500, "fuel": "Essence", "transmission": "Automatique", "price": 98000, "monthly_payment": 1290, "image_url": "https://images.pexels.com/photos/3457780/pexels-photo-3457780.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": "Neuf", "status": "active", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "brand": "Audi", "model": "RS e-tron GT", "year": 2024, "mileage": 200, "fuel": "Électrique", "transmission": "Automatique", "price": 145000, "monthly_payment": 1890, "image_url": "https://images.unsplash.com/photo-1712194288783-bb3bb380025b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwzfHxNY0xhcmVuJTIwUG9yc2NoZSUyMEJNVyUyMGx1eHVyeSUyMHN1cGVyY2FyJTIwc2hvd3Jvb218ZW58MHx8fHwxNzc0MTEwNzI3fDA&ixlib=rb-4.1.0&q=85", "badge": "Neuf", "status": "active", "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "brand": "McLaren", "model": "Artura", "year": 2024, "mileage": 800, "fuel": "Hybride", "transmission": "Automatique", "price": 235000, "monthly_payment": 3100, "image_url": "https://images.pexels.com/photos/6732611/pexels-photo-6732611.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": "Premium", "status": "active", "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.vehicles.insert_many(vehicles)
    cms_count = await db.cms_content.count_documents({})
    if cms_count == 0:
        for key, content in DEFAULT_CMS.items():
            await db.cms_content.insert_one({"section_key": key, "content": content, "updated_at": datetime.now(timezone.utc).isoformat()})
    return {"success": True, "message": "Données initiales créées"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
