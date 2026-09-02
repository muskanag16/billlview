from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from app.services.invoice_service import InvoiceService
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import List, Optional
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[InvoiceResponse])
def list_invoices(
    search: Optional[str] = Query(None, description="Search by invoice number or notes"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (draft, sent, paid, overdue)"),
    client_id: Optional[UUID] = Query(None, description="Filter by client ID"),
    sort_by: Optional[str] = Query(None, description="Sort column (e.g. created_at, issue_date, due_date, total)"),
    sort_order: Optional[str] = Query(None, description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all invoices for the current user with optional filtering."""
    return InvoiceService.list_invoices(db, current_user.id, search, status_filter, client_id, sort_by, sort_order)

@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new invoice."""
    return InvoiceService.create_invoice(db, current_user.id, invoice_in)

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific invoice by ID."""
    return InvoiceService.get_invoice(db, invoice_id, current_user.id)

@router.post("/{invoice_id}/send", response_model=InvoiceResponse)
def send_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Simulate sending an invoice by email (marks as sent)."""
    return InvoiceService.send_invoice(db, invoice_id, current_user.id)

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: UUID,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing invoice."""
    return InvoiceService.update_invoice(db, invoice_id, current_user.id, invoice_update)

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific invoice."""
    InvoiceService.delete_invoice(db, invoice_id, current_user.id)
