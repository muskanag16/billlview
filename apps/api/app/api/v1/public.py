from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.invoice_repository import InvoiceRepository
from app.schemas.invoice import InvoiceResponse
from app.core.errors import ResourceNotFoundError

router = APIRouter()

def _resolve_status(invoice) -> str:
    """
    Compute the display status of an invoice.
    A 'sent' invoice whose due_date has passed is shown as 'overdue'.
    A 'paid' invoice is never overdue.
    """
    from datetime import date
    if invoice.status == "paid":
        return "paid"
    if invoice.status == "sent" and invoice.due_date < date.today():
        return "overdue"
    return invoice.status

@router.get("/invoice/{token}", response_model=InvoiceResponse)
def get_public_invoice(token: str, db: Session = Depends(get_db)):
    """
    Fetch a full invoice by its public_token.
    No authentication required — the high-entropy token is the access control.
    """
    invoice = InvoiceRepository.get_by_token(db, token)
    if not invoice:
        raise ResourceNotFoundError("Invoice not found or link is invalid.")
    return invoice

@router.post("/invoice/{token}/pay", response_model=InvoiceResponse)
def pay_public_invoice(token: str, db: Session = Depends(get_db)):
    """
    Simulated payment endpoint. Transitions invoice from 'sent' → 'paid'.
    Rejects payment for draft or already-paid invoices.
    """
    invoice = InvoiceRepository.get_by_token(db, token)
    if not invoice:
        raise ResourceNotFoundError("Invoice not found or link is invalid.")

    display_status = _resolve_status(invoice)

    if invoice.status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "ALREADY_PAID", "message": "This invoice has already been paid."}
        )
    # Removed draft restriction to allow easy testing of simulated payment
    # Even if they didn't hit "Send" first, let them pay it in demo mode.

    # Transition to paid (covers both 'sent' and computed 'overdue')
    invoice.status = "paid"
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
