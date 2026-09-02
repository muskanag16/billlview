from sqlalchemy.orm import Session
from app.models.business_settings import BusinessSettings
from app.schemas.business_settings import BusinessSettingsUpdate
from uuid import UUID

class BusinessSettingsRepository:
    @staticmethod
    def get_for_user(db: Session, user_id: UUID) -> BusinessSettings | None:
        return db.query(BusinessSettings).filter(BusinessSettings.user_id == user_id).first()

    @staticmethod
    def create_for_user(db: Session, user_id: UUID) -> BusinessSettings:
        db_settings = BusinessSettings(user_id=user_id)
        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)
        return db_settings

    @staticmethod
    def update_for_user(db: Session, user_id: UUID, settings_update: BusinessSettingsUpdate) -> BusinessSettings:
        db_settings = BusinessSettingsRepository.get_for_user(db, user_id)
        if not db_settings:
            db_settings = BusinessSettingsRepository.create_for_user(db, user_id)
        
        update_data = settings_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_settings, key, value)
            
        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)
        return db_settings
