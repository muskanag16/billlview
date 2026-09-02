from decimal import Decimal
from app.services.invoice_calculator import InvoiceCalculator
from app.api.v1.invoices import InvoiceItemCreate

def test_calculator_basic():
    items = [
        InvoiceItemCreate(description="Item 1", quantity=Decimal("2"), rate=Decimal("100.50")),
    ]
    subtotal, tax_amount, discount_amount, total, calculated_items = InvoiceCalculator.calculate_totals(
        items,
        tax_rate=Decimal("0"),
        discount_rate=Decimal("0")
    )
    
    assert subtotal == Decimal("201.00")
    assert tax_amount == Decimal("0.00")
    assert discount_amount == Decimal("0.00")
    assert total == Decimal("201.00")
    assert calculated_items[0]["line_total"] == Decimal("201.00")

def test_calculator_with_tax_and_discount():
    items = [
        InvoiceItemCreate(description="Item 1", quantity=Decimal("1"), rate=Decimal("100.00")),
    ]
    # discount applies first
    subtotal, tax_amount, discount_amount, total, calculated_items = InvoiceCalculator.calculate_totals(
        items,
        tax_rate=Decimal("10"), # 10%
        discount_rate=Decimal("20") # 20%
    )
    
    assert subtotal == Decimal("100.00")
    assert discount_amount == Decimal("20.00") # 20% of 100
    assert tax_amount == Decimal("8.00") # 10% of (100 - 20)
    assert total == Decimal("88.00") # 100 - 20 + 8

def test_calculator_zero_floor():
    items = [
        InvoiceItemCreate(description="Item 1", quantity=Decimal("1"), rate=Decimal("100.00")),
    ]
    subtotal, tax_amount, discount_amount, total, calculated_items = InvoiceCalculator.calculate_totals(
        items,
        tax_rate=Decimal("0"),
        discount_rate=Decimal("150") # Discount greater than subtotal
    )
    
    assert subtotal == Decimal("100.00")
    assert discount_amount == Decimal("100.00") # Capped at subtotal
    assert total == Decimal("0.00") # Floor at zero
