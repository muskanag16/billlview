from sqlalchemy.orm import Session
from app.repositories.invoice_repository import InvoiceRepository
from app.models.invoice import Invoice, InvoiceItem
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate
from app.services.invoice_calculator import InvoiceCalculator
from app.core.errors import ResourceNotFoundError
from uuid import UUID

class InvoiceService:
    @staticmethod
    def _calculate_and_build_items(items_in, tax, discount):
        db_items = []
        line_totals = []
        for item_in in items_in:
            line_total = InvoiceCalculator.calculate_line_total(item_in.quantity, item_in.rate)
            line_totals.append(line_total)
            db_items.append(
                InvoiceItem(
                    description=item_in.description,
                    quantity=item_in.quantity,
                    rate=item_in.rate,
                    line_total=line_total
                )
            )
        
        subtotal, total = InvoiceCalculator.calculate_totals(line_totals, tax, discount)
        return db_items, subtotal, total

    @staticmethod
    def create_invoice(db: Session, user_id: UUID, invoice_in: InvoiceCreate) -> Invoice:
        db_items, subtotal, total = InvoiceService._calculate_and_build_items(
            invoice_in.items, invoice_in.tax, invoice_in.discount
        )

        db_invoice = Invoice(
            user_id=user_id,
            client_id=invoice_in.client_id,
            invoice_number=invoice_in.invoice_number,
            issue_date=invoice_in.issue_date,
            due_date=invoice_in.due_date,
            notes=invoice_in.notes,
            status=invoice_in.status,
            tax=invoice_in.tax,
            discount=invoice_in.discount,
            subtotal=subtotal,
            total=total,
            items=db_items
        )
        
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        return db_invoice

    @staticmethod
    def update_invoice(db: Session, invoice_id: UUID, user_id: UUID, invoice_update: InvoiceUpdate) -> Invoice:
        db_invoice = InvoiceRepository.get_for_user(db, invoice_id, user_id)
        if not db_invoice:
            raise ResourceNotFoundError("Invoice not found")

        update_data = invoice_update.model_dump(exclude_unset=True, exclude={"items"})
        for key, value in update_data.items():
            setattr(db_invoice, key, value)

        if invoice_update.items is not None:
            db_invoice.items.clear()
            db_items, subtotal, total = InvoiceService._calculate_and_build_items(
                invoice_update.items, 
                db_invoice.tax, 
                db_invoice.discount
            )
            db_invoice.items.extend(db_items)
            db_invoice.subtotal = subtotal
            db_invoice.total = total
        else:
            # Need to recalculate if tax or discount changed but items didn't
            line_totals = [item.line_total for item in db_invoice.items]
            subtotal, total = InvoiceCalculator.calculate_totals(line_totals, db_invoice.tax, db_invoice.discount)
            db_invoice.subtotal = subtotal
            db_invoice.total = total

        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        return db_invoice

    @staticmethod
    def get_invoice(db: Session, invoice_id: UUID, user_id: UUID) -> Invoice:
        invoice = InvoiceRepository.get_for_user(db, invoice_id, user_id)
        if not invoice:
            raise ResourceNotFoundError("Invoice not found")
        return invoice
        
    @staticmethod
    def send_invoice(db: Session, invoice_id: UUID, user_id: UUID) -> Invoice:
        invoice = InvoiceRepository.get_for_user(db, invoice_id, user_id)
        if not invoice:
            raise ResourceNotFoundError("Invoice not found")
        
        # Simulate sending email
        if invoice.status == "draft":
            invoice.status = "sent"
            db.add(invoice)
            db.commit()
            db.refresh(invoice)
            
        return invoice

    @staticmethod
    def list_invoices(db: Session, user_id: UUID, search: str = None, status: str = None, client_id: UUID = None, sort_by: str = None, sort_order: str = None):
        return InvoiceRepository.list_for_user(db, user_id, search, status, client_id, sort_by, sort_order)

    @staticmethod
    def delete_invoice(db: Session, invoice_id: UUID, user_id: UUID):
        success = InvoiceRepository.delete_for_user(db, invoice_id, user_id)
        if not success:
            raise ResourceNotFoundError("Invoice not found")
