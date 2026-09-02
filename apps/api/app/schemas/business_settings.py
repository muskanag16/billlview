from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

class BusinessSettingsBase(BaseModel):
    business_name: Optional[str] = None
    logo_url: Optional[str] = None
    currency: Optional[str] = "USD"
    invoice_number_prefix: Optional[str] = None

class BusinessSettingsUpdate(BusinessSettingsBase):
    pass

class BusinessSettingsResponse(BusinessSettingsBase):
    id: UUID
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
