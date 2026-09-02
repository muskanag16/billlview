from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.services.client_service import ClientService
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[ClientResponse])
def list_clients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all clients for the current user."""
    return ClientService.list_clients(db, current_user.id)

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new client."""
    return ClientService.create_client(db, current_user.id, client_in)

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific client by ID."""
    return ClientService.get_client(db, client_id, current_user.id)

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: UUID,
    client_update: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific client."""
    return ClientService.update_client(db, client_id, current_user.id, client_update)

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific client."""
    ClientService.delete_client(db, client_id, current_user.id)
