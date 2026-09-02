from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    return AuthService.register_user(db, user_in)

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return a JWT."""
    return AuthService.authenticate_user(db, user_in)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return current_user
