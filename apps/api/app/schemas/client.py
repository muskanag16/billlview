from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID

class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class ClientResponse(ClientBase):
    id: UUID
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
