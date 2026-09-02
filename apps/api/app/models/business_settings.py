from sqlalchemy import Column, String, DateTime, func, ForeignKey
from sqlalchemy import Uuid as UUID
import uuid
from app.core.database import Base

class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=True)
    logo_url = Column(String(255), nullable=True)
    currency = Column(String(3), default='USD')
    invoice_number_prefix = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
