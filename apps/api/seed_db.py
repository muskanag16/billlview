import os
import sys

# Add the apps/api directory to sys.path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models.user import User
from app.models.client import Client
from app.models.invoice import Invoice
from app.models.business_settings import BusinessSettings
from app.core.security import get_password_hash
from sqlalchemy.orm import Session
import datetime
from decimal import Decimal

print("Creating database tables...")
Base.metadata.create_all(bind=engine)

print("Seeding database...")
with Session(engine) as db:
    # 1. Create User
    user = db.query(User).filter(User.email == "demo@billflow.dev").first()
    if not user:
        user = User(
            email="demo@billflow.dev",
            password_hash=get_password_hash("demo1234")
        )
        db.add(user)
        db.flush()
        print("Demo user created!")
    else:
        print("Demo user already exists.")

    # 2. Create Business Settings
    settings = db.query(BusinessSettings).filter(BusinessSettings.user_id == user.id).first()
    if not settings:
        settings = BusinessSettings(
            user_id=user.id,
            business_name="Acme Corp Design",
            currency="USD"
        )
        db.add(settings)

    # 3. Create Clients
    client1 = db.query(Client).filter(Client.user_id == user.id, Client.email == "alice@example.com").first()
    if not client1:
        client1 = Client(user_id=user.id, name="Alice Smith", email="alice@example.com", company="Tech Solutions")
        db.add(client1)

    client2 = db.query(Client).filter(Client.user_id == user.id, Client.email == "bob@example.com").first()
    if not client2:
        client2 = Client(user_id=user.id, name="Bob Jones", email="bob@example.com", company="Creative Agency")
        db.add(client2)
    
    db.flush()

    # 4. Create Invoices
    existing_invoices = db.query(Invoice).filter(Invoice.user_id == user.id).count()
    if existing_invoices == 0:
        today = datetime.date.today()
        # Invoice 1: Paid (Earned)
        inv1 = Invoice(
            user_id=user.id, client_id=client1.id, invoice_number="INV-001",
            issue_date=today - datetime.timedelta(days=30), due_date=today - datetime.timedelta(days=15),
            status="paid", subtotal=Decimal('1500.00'), total=Decimal('1500.00')
        )
        db.add(inv1)

        # Invoice 2: Outstanding (Sent, due in future)
        inv2 = Invoice(
            user_id=user.id, client_id=client2.id, invoice_number="INV-002",
            issue_date=today - datetime.timedelta(days=5), due_date=today + datetime.timedelta(days=10),
            status="sent", subtotal=Decimal('850.00'), total=Decimal('850.00')
        )
        db.add(inv2)

        # Invoice 3: Overdue (Sent, due in past)
        inv3 = Invoice(
            user_id=user.id, client_id=client1.id, invoice_number="INV-003",
            issue_date=today - datetime.timedelta(days=40), due_date=today - datetime.timedelta(days=10),
            status="sent", subtotal=Decimal('2200.00'), total=Decimal('2200.00')
        )
        db.add(inv3)
        print("Demo invoices created!")
    
    db.commit()

print("Done! Your database is fully seeded with realistic demo data.")
