from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.invoice import Invoice, InvoiceItem
from uuid import UUID
from datetime import date

class InvoiceRepository:
    @staticmethod
    def get_for_user(db: Session, invoice_id: UUID, user_id: UUID) -> Invoice | None:
        return db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == user_id).first()
        
    @staticmethod
    def get_by_token(db: Session, public_token: str) -> Invoice | None:
        return db.query(Invoice).filter(Invoice.public_token == public_token).first()

    @staticmethod
    def list_for_user(
        db: Session, 
        user_id: UUID,
        search: str = None,
        status: str = None,
        client_id: UUID = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> list[Invoice]:
        query = db.query(Invoice).filter(Invoice.user_id == user_id)
        
        if status:
            if status == "overdue":
                query = query.filter(Invoice.status != "paid", Invoice.due_date < date.today())
            elif status in ["draft", "sent"]:
                query = query.filter(Invoice.status == status, Invoice.due_date >= date.today())
            else:
                query = query.filter(Invoice.status == status)
            
        if client_id:
            query = query.filter(Invoice.client_id == client_id)
            
        if search:
            query = query.filter(
                or_(
                    Invoice.invoice_number.ilike(f"%{search}%"),
                    Invoice.notes.ilike(f"%{search}%")
                )
            )
            
        if sort_by == "issue_date":
            order_col = Invoice.issue_date
        elif sort_by == "due_date":
            order_col = Invoice.due_date
        elif sort_by == "total":
            order_col = Invoice.total
        else:
            order_col = Invoice.created_at

        if sort_order == "asc":
            query = query.order_by(order_col.asc())
        else:
            query = query.order_by(order_col.desc())
            
        return query.all()

    @staticmethod
    def delete_for_user(db: Session, invoice_id: UUID, user_id: UUID) -> bool:
        db_invoice = InvoiceRepository.get_for_user(db, invoice_id, user_id)
        if not db_invoice:
            return False
        
        db.delete(db_invoice)
        db.commit()
        return True
