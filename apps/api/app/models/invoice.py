from sqlalchemy import Column, String, DateTime, func, ForeignKey, Numeric, Date, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
import uuid
import secrets
from app.core.database import Base

def generate_public_token():
    return secrets.token_urlsafe(32)

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False, index=True)
    invoice_number = Column(String(100), nullable=False)
    issue_date = Column(Date, nullable=False, index=True)
    due_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, index=True) # draft, sent, paid
    subtotal = Column(Numeric(12, 2), default=0)
    tax = Column(Numeric(12, 2), default=0)
    discount = Column(Numeric(12, 2), default=0)
    total = Column(Numeric(12, 2), default=0)
    public_token = Column(String(255), unique=True, nullable=False, default=generate_public_token)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    client = relationship("Client")
    user = relationship("User")

    @property
    def business(self):
        return self.user.business_settings if self.user else None

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    rate = Column(Numeric(12, 2), nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    invoice = relationship("Invoice", back_populates="items")
