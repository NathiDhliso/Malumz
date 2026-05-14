from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import hashlib
import hmac
import json
import smtplib
from pathlib import Path
from email.message import EmailMessage
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
import secrets
import requests
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Simple in-memory storage for testing (replace with MongoDB in production)
in_memory_storage = {
    "gap_tests": [],
    "contact_forms": [],
    "purchases": [],
    "status_checks": []
}

PRODUCTS = {
    "dog-trainer-ebook": {
        "name": "The Dog Trainer eBook",
        "amount_cents": 9900,
        "asset": ROOT_DIR.parent / "Dog Trainer.epub",
    },
    "dog-trainer-audiobook": {
        "name": "The Dog Trainer Audiobook",
        "amount_cents": 19900,
        "asset_dir": ROOT_DIR.parent / "Dog_Trainer-AudioBook",
    },
}

AUDIO_TRACKS = [
    "01_A NOTE ON THE METAPHOR.mp3",
    "02_CHAPTER 0_ THE BIRTHDAY CARD.mp3",
    "03_CHAPTER 1_ THE BANTU KENNEL.mp3",
    "04_CHAPTER 2_ THE FIRE BEFORE ME.mp3",
    "05_CHAPTER 3_ SEEK FIRST THE KINGDOM.mp3",
    "06_CHAPTER 4_ THE FLOOR BENEATH THE LADDER.mp3",
    "07_CHAPTER 5_ SAINTS, GATEKEEPERS AND THE OVERWHELMED.mp3",
    "08_CHAPTER 6_ FIVE FRIENDS AND A KNIFE.mp3",
    "09_CHAPTER 7_ THE VELVET MUZZLE.mp3",
    "10_CHAPTER 8_ THE RAINBOW TRAP.mp3",
    "11_CHAPTER 9_ THE SECOND EVICTION.mp3",
    "12_CHAPTER 10_ THE BLUE-HAIRED GIRL.mp3",
    "13_CHAPTER 11_ REAPING WHAT THEY PLANTED.mp3",
    "14_CHAPTER 12_ THE SOFT CAGE.mp3",
    "15_CHAPTER 13_ THE DOG WHO TRAINED HIMSELF.mp3",
    "16_CHAPTER 14_ THE FIRST CIRCLE.mp3",
    "17_THE CROSSING.mp3",
]

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Malumz Movement API starting up...")
    yield
    # Shutdown
    print("Malumz Movement API shutting down...")

# Create the main app without a prefix
app = FastAPI(lifespan=lifespan)

# Add CORS middleware BEFORE including routers
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# Gap Test Models
class GapTestAnswer(BaseModel):
    trainer: str
    questions: List[int]  # List of 10 scores (0-10 each)

class GapTestSubmission(BaseModel):
    name: str
    email: EmailStr
    answers: List[GapTestAnswer]  # 6 trainers

class GapTestResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    total_score: int
    scores_by_trainer: Dict[str, int]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Contact Form Models
class ContactFormSubmission(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ContactFormResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    subject: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Mock Purchase Models
class MockPurchaseSubmission(BaseModel):
    name: str
    email: EmailStr
    product: str
    price: str

class MockPurchaseResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    product: str
    price: str
    status: str = "pending"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    buyerEmail: Optional[EmailStr] = None
    productId: str

class ActivateRequest(BaseModel):
    checkoutId: str


# Routes
@api_router.get("/")
async def root():
    return {"message": "Malumz Movement API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    in_memory_storage["status_checks"].append(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = in_memory_storage["status_checks"].copy()
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Gap Test Routes
@api_router.post("/gap-test", response_model=GapTestResult)
async def submit_gap_test(submission: GapTestSubmission):
    """Submit gap test and calculate score"""
    
    # Calculate scores by trainer
    scores_by_trainer = {}
    total_score = 0
    
    for answer in submission.answers:
        trainer_score = sum(answer.questions)
        scores_by_trainer[answer.trainer] = trainer_score
        total_score += trainer_score
    
    result = GapTestResult(
        name=submission.name,
        email=submission.email,
        total_score=total_score,
        scores_by_trainer=scores_by_trainer
    )
    
    # Save to in-memory storage
    doc = result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    in_memory_storage["gap_tests"].append(doc)
    
    return result

@api_router.get("/gap-test/{test_id}", response_model=GapTestResult)
async def get_gap_test(test_id: str):
    """Retrieve gap test result by ID"""
    result = None
    for test in in_memory_storage["gap_tests"]:
        if test["id"] == test_id:
            result = test
            break
    
    if not result:
        raise HTTPException(status_code=404, detail="Gap test not found")
    
    if isinstance(result['timestamp'], str):
        result['timestamp'] = datetime.fromisoformat(result['timestamp'])
    
    return result


# Contact Form Routes
@api_router.post("/contact", response_model=ContactFormResult)
async def submit_contact_form(submission: ContactFormSubmission):
    """Submit contact form"""
    
    result = ContactFormResult(**submission.model_dump())
    
    # Save to in-memory storage
    doc = result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    in_memory_storage["contact_forms"].append(doc)
    try:
        send_contact_email(result)
    except Exception as exc:
        logging.error("Contact email failed: %s", exc)
    
    return result


# Mock Purchase Routes
@api_router.post("/mock-purchase", response_model=MockPurchaseResult)
async def submit_mock_purchase(submission: MockPurchaseSubmission):
    """Mock purchase endpoint (no actual payment processing)"""
    
    result = MockPurchaseResult(**submission.model_dump())
    
    # Save to in-memory storage
    doc = result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    in_memory_storage["purchases"].append(doc)
    
    return result

@api_router.post("/malumz/checkout")
async def create_malumz_checkout(request: CheckoutRequest):
    product = PRODUCTS.get(request.productId)
    if not product:
        raise HTTPException(status_code=400, detail="Invalid product")

    secret_key = os.environ.get("YOCO_SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=500, detail="Payment configuration missing")

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    metadata = {
        "type": "malumz_product",
        "productId": request.productId,
    }
    if request.buyerEmail:
        metadata["buyerEmail"] = request.buyerEmail

    checkout_body = {
        "amount": product["amount_cents"],
        "currency": "ZAR",
        "lineItems": [
            {
                "displayName": product["name"],
                "quantity": 1,
                "pricingDetails": {"price": product["amount_cents"]},
            }
        ],
        "metadata": metadata,
        "successUrl": f"{frontend_url}/book?paid=true&product={request.productId}",
        "cancelUrl": f"{frontend_url}/book",
    }

    response = requests.post(
        "https://payments.yoco.com/api/checkouts",
        json=checkout_body,
        headers={
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json",
            "Idempotency-Key": f"{request.productId}-{secrets.token_urlsafe(16)}",
        },
        timeout=20,
    )
    if response.status_code not in (200, 201):
        logging.error("Yoco checkout failed: %s", response.text)
        raise HTTPException(status_code=502, detail="Checkout failed")

    payload = response.json()
    checkout_id = payload.get("id")
    checkout_url = payload.get("redirectUrl") or payload.get("url")
    if not checkout_id or not checkout_url:
        raise HTTPException(status_code=502, detail="Invalid checkout response")

    in_memory_storage["purchases"].append({
        "id": str(uuid.uuid4()),
        "checkout_id": checkout_id,
        "buyer_email": request.buyerEmail or "",
        "product_id": request.productId,
        "amount_cents": product["amount_cents"],
        "status": "pending",
        "access_token": secrets.token_urlsafe(32),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {"checkoutUrl": checkout_url, "checkoutId": checkout_id}

@api_router.post("/malumz/activate")
async def activate_malumz_purchase(request: ActivateRequest):
    purchase = next((item for item in in_memory_storage["purchases"] if item.get("checkout_id") == request.checkoutId), None)

    if purchase and purchase["status"] == "completed":
        return build_access_response(purchase)

    secret_key = os.environ.get("YOCO_SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=500, detail="Payment configuration missing")

    response = requests.get(
        f"https://payments.yoco.com/api/checkouts/{request.checkoutId}",
        headers={"Authorization": f"Bearer {secret_key}"},
        timeout=20,
    )
    if response.status_code != 200:
        logging.error("Yoco activation failed: %s", response.text)
        raise HTTPException(status_code=502, detail="Payment verification failed")

    checkout = response.json()
    if checkout.get("status") not in ("completed", "succeeded"):
        return {"status": "pending"}

    metadata = checkout.get("metadata") or {}
    product_id = metadata.get("productId")
    if metadata.get("type") != "malumz_product" or product_id not in PRODUCTS:
        raise HTTPException(status_code=400, detail="Invalid checkout metadata")

    if purchase:
        if purchase["product_id"] != product_id:
            raise HTTPException(status_code=400, detail="Invalid checkout metadata")
        purchase["status"] = "completed"
        purchase["completed_at"] = datetime.now(timezone.utc).isoformat()
    else:
        product = PRODUCTS[product_id]
        purchase = {
            "id": str(uuid.uuid4()),
            "checkout_id": request.checkoutId,
            "buyer_email": metadata.get("buyerEmail", ""),
            "product_id": product_id,
            "amount_cents": product["amount_cents"],
            "status": "completed",
            "access_token": secrets.token_urlsafe(32),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        in_memory_storage["purchases"].append(purchase)

    return build_access_response(purchase)

@api_router.get("/malumz/access/{purchase_id}/ebook")
async def download_ebook(purchase_id: str, token: str = Query(...)):
    purchase = find_completed_purchase(purchase_id, token, "dog-trainer-ebook")
    asset = PRODUCTS[purchase["product_id"]]["asset"]
    if not asset.exists():
        raise HTTPException(status_code=404, detail="eBook file not found")
    return FileResponse(asset, media_type="application/epub+zip", filename="The Dog Trainer.epub")

@api_router.get("/malumz/access/{purchase_id}/audio/{track_index}")
async def stream_audio(purchase_id: str, track_index: int, token: str = Query(...)):
    purchase = find_completed_purchase(purchase_id, token, "dog-trainer-audiobook")
    if track_index < 0 or track_index >= len(AUDIO_TRACKS):
        raise HTTPException(status_code=404, detail="Track not found")
    audio_path = PRODUCTS[purchase["product_id"]]["asset_dir"] / AUDIO_TRACKS[track_index]
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(audio_path, media_type="audio/mpeg", filename=AUDIO_TRACKS[track_index])

def find_completed_purchase(purchase_id: str, token: str, product_id: str):
    payload = verify_access_token(token)
    if payload.get("purchase_id") != purchase_id or payload.get("product_id") != product_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return {
        "id": purchase_id,
        "product_id": product_id,
    }

def build_access_response(purchase):
    base = "/api/malumz/access"
    purchase_id = purchase["id"]
    token = create_access_token(purchase)
    if purchase["product_id"] == "dog-trainer-ebook":
        return {
            "status": "completed",
            "productId": purchase["product_id"],
            "ebookUrl": f"{base}/{purchase_id}/ebook?token={token}",
        }
    return {
        "status": "completed",
        "productId": purchase["product_id"],
        "audioTracks": [
            {
                "title": AUDIO_TRACKS[index].replace(".mp3", "").replace("_", " "),
                "url": f"{base}/{purchase_id}/audio/{index}?token={token}",
            }
            for index in range(len(AUDIO_TRACKS))
        ],
    }

def signing_secret():
    secret_key = os.environ.get("ACCESS_TOKEN_SECRET") or os.environ.get("YOCO_SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=500, detail="Access configuration missing")
    return secret_key.encode("utf-8")

def create_access_token(purchase):
    payload = {
        "purchase_id": purchase["id"],
        "checkout_id": purchase.get("checkout_id", ""),
        "product_id": purchase["product_id"],
    }
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_json).decode("utf-8").rstrip("=")
    signature = hmac.new(signing_secret(), payload_b64.encode("utf-8"), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    return f"{payload_b64}.{signature_b64}"

def verify_access_token(token):
    try:
        payload_b64, signature_b64 = token.split(".", 1)
        expected = hmac.new(signing_secret(), payload_b64.encode("utf-8"), hashlib.sha256).digest()
        actual = base64.urlsafe_b64decode(signature_b64 + "=" * (-len(signature_b64) % 4))
        if not hmac.compare_digest(expected, actual):
            raise ValueError("Invalid signature")
        payload_json = base64.urlsafe_b64decode(payload_b64 + "=" * (-len(payload_b64) % 4))
        return json.loads(payload_json)
    except Exception:
        raise HTTPException(status_code=403, detail="Access denied")

def send_contact_email(result: ContactFormResult):
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    from_email = os.environ.get("FROM_EMAIL", smtp_user or "no-reply@malumz.co.za")
    to_email = os.environ.get("CONTACT_TO_EMAIL", "nkosinathi.dhliso@gmail.com")
    if not smtp_host or not smtp_user or not smtp_password:
        logging.info("SMTP not configured; contact submission stored without email")
        return

    # Plain-text fallback
    plain_body = (
        f"New message from {result.name} ({result.email})\n"
        f"Subject: {result.subject}\n\n"
        f"{result.message}\n\n"
        f"---\n"
        f"Reply directly to this email to respond to {result.name}.\n"
    )

    # Professional HTML template — Apple-style minimal
    html_body = f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="padding:32px 32px 0;border-bottom:1px solid #f0f0f0;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#86868b;">New message</p>
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#1d1d1f;">{result.subject}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1d1d1f;white-space:pre-wrap;">{result.message}</p>
        </td></tr>
        <!-- Sender info -->
        <tr><td style="padding:0 32px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;border-radius:8px;padding:16px;">
            <tr><td>
              <p style="margin:0 0 4px;font-size:13px;color:#86868b;">From</p>
              <p style="margin:0 0 2px;font-size:15px;font-weight:500;color:#1d1d1f;">{result.name}</p>
              <p style="margin:0;font-size:13px;color:#C2491A;">{result.email}</p>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #f0f0f0;">
          <p style="margin:0;font-size:11px;color:#86868b;text-align:center;">
            Reply directly to this email to respond to {result.name}.<br>
            Sent via malumz.co.za
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    msg = EmailMessage()
    msg["Subject"] = f"Malumz: {result.subject}"
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Reply-To"] = result.email
    msg.set_content(plain_body)
    msg.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)