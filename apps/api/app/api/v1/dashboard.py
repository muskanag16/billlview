from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.invoice import Invoice
from pydantic import BaseModel
from typing import List
from decimal import Decimal
from datetime import timedelta
from collections import defaultdict

router = APIRouter()

class RecentInvoice(BaseModel):
    id: str
    invoice_number: str
    status: str
    total: Decimal
    due_date: str
    public_token: str

    class Config:
        from_attributes = True

class IncomeData(BaseModel):
    month: str
    income: Decimal

class DashboardMetrics(BaseModel):
    total_earned: Decimal
    total_outstanding: Decimal
    total_overdue: Decimal
    invoice_count_draft: int
    invoice_count_sent: int
    invoice_count_paid: int
    recent_invoices: List[RecentInvoice]
    income_over_time: List[IncomeData]

@router.get("/", response_model=DashboardMetrics)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Aggregate financial metrics scoped strictly to the current user."""
    user_id = current_user.id
    today = date.today()

    # Total earned: sum of all paid invoice totals
    total_earned = db.query(func.coalesce(func.sum(Invoice.total), 0)).filter(
        Invoice.user_id == user_id, Invoice.status == "paid"
    ).scalar()

    # Outstanding: not paid invoices not yet past due date
    total_outstanding = db.query(func.coalesce(func.sum(Invoice.total), 0)).filter(
        Invoice.user_id == user_id,
        Invoice.status != "paid",
        Invoice.due_date >= today
    ).scalar()

    # Overdue: not paid invoices past their due date
    total_overdue = db.query(func.coalesce(func.sum(Invoice.total), 0)).filter(
        Invoice.user_id == user_id,
        Invoice.status != "paid",
        Invoice.due_date < today
    ).scalar()

    # Status counts
    count_draft = db.query(func.count(Invoice.id)).filter(Invoice.user_id == user_id, Invoice.status == "draft").scalar()
    count_sent = db.query(func.count(Invoice.id)).filter(Invoice.user_id == user_id, Invoice.status == "sent").scalar()
    count_paid = db.query(func.count(Invoice.id)).filter(Invoice.user_id == user_id, Invoice.status == "paid").scalar()

    # Recent 5 invoices
    recent = db.query(Invoice).filter(Invoice.user_id == user_id).order_by(Invoice.created_at.desc()).limit(5).all()

    def resolve_status(inv):
        if inv.status == "paid":
            return "paid"
        if inv.status != "paid" and inv.due_date < today:
            return "overdue"
        return inv.status

    recent_invoices = [
        RecentInvoice(
            id=str(inv.id),
            invoice_number=inv.invoice_number,
            status=resolve_status(inv),
            total=inv.total,
            due_date=str(inv.due_date),
            public_token=inv.public_token,
        )
        for inv in recent
    ]

    # Income over time (last 6 months, paid invoices)
    six_months_ago = today - timedelta(days=180)
    paid_invoices_6mo = db.query(Invoice).filter(
        Invoice.user_id == user_id,
        Invoice.status == "paid",
        Invoice.issue_date >= six_months_ago
    ).all()

    income_by_month = defaultdict(Decimal)
    for inv in paid_invoices_6mo:
        month_str = inv.issue_date.strftime("%b %Y")  # e.g. "Jan 2026"
        income_by_month[month_str] += inv.total

    # To keep chronological order, let's just generate the last 6 months list
    income_over_time = []
    for i in range(5, -1, -1):
        dt = today.replace(day=1)
        for _ in range(i):
            dt = (dt.replace(day=1) - timedelta(days=1)).replace(day=1)
        m_str = dt.strftime("%b %Y")
        income_over_time.append(IncomeData(month=m_str, income=income_by_month.get(m_str, Decimal(0))))

    return DashboardMetrics(
        total_earned=Decimal(str(total_earned)),
        total_outstanding=Decimal(str(total_outstanding)),
        total_overdue=Decimal(str(total_overdue)),
        invoice_count_draft=count_draft,
        invoice_count_sent=count_sent,
        invoice_count_paid=count_paid,
        recent_invoices=recent_invoices,
        income_over_time=income_over_time,
    )
