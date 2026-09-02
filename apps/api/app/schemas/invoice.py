from pydantic import BaseModel, ConfigDict, model_validator
from datetime import date
from typing import List, Optional
from uuid import UUID
from datetime import date
from decimal import Decimal
from app.schemas.client import ClientResponse
from app.schemas.business_settings import BusinessSettingsResponse

class InvoiceItemBase(BaseModel):
    description: str
    quantity: Decimal
    rate: Decimal

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: UUID
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)

class InvoiceBase(BaseModel):
    client_id: UUID
    invoice_number: str
    issue_date: date
    due_date: date
    notes: Optional[str] = None
    status: str = "draft"
    tax: Decimal = Decimal('0.00')
    discount: Decimal = Decimal('0.00')

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceUpdate(BaseModel):
    client_id: Optional[UUID] = None
    invoice_number: Optional[str] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    tax: Optional[Decimal] = None
    discount: Optional[Decimal] = None
    items: Optional[List[InvoiceItemCreate]] = None

class InvoiceResponse(InvoiceBase):
    id: UUID
    user_id: UUID
    subtotal: Decimal
    total: Decimal
    public_token: str
    items: List[InvoiceItemResponse]
    client: Optional[ClientResponse] = None
    business: Optional[BusinessSettingsResponse] = None

    @model_validator(mode='after')
    def compute_overdue_status(self) -> 'InvoiceResponse':
        if self.status != 'paid' and self.due_date < date.today():
            self.status = 'overdue'
        return self

    model_config = ConfigDict(from_attributes=True)
