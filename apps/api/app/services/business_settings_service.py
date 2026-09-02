from sqlalchemy.orm import Session
from app.repositories.business_settings_repository import BusinessSettingsRepository
from app.schemas.business_settings import BusinessSettingsUpdate
from uuid import UUID

class BusinessSettingsService:
    @staticmethod
    def get_settings(db: Session, user_id: UUID):
        settings = BusinessSettingsRepository.get_for_user(db, user_id)
        if not settings:
            settings = BusinessSettingsRepository.create_for_user(db, user_id)
        return settings

    @staticmethod
    def update_settings(db: Session, user_id: UUID, settings_update: BusinessSettingsUpdate):
        return BusinessSettingsRepository.update_for_user(db, user_id, settings_update)
