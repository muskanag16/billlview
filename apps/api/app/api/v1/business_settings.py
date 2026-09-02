from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.business_settings import BusinessSettingsResponse, BusinessSettingsUpdate
from app.services.business_settings_service import BusinessSettingsService
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=BusinessSettingsResponse)
def get_business_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get the business settings for the current user."""
    return BusinessSettingsService.get_settings(db, current_user.id)

@router.put("/", response_model=BusinessSettingsResponse)
def update_business_settings(
    settings_update: BusinessSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the business settings for the current user."""
    return BusinessSettingsService.update_settings(db, current_user.id, settings_update)
