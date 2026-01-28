from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
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