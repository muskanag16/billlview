from decimal import Decimal, ROUND_HALF_UP

class InvoiceCalculator:
    @staticmethod
    def calculate_line_total(quantity: Decimal, rate: Decimal) -> Decimal:
        """Calculate line total: quantity * rate."""
        result = quantity * rate
        return result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @staticmethod
    def calculate_totals(line_totals: list[Decimal], tax: Decimal, discount: Decimal) -> tuple[Decimal, Decimal]:
        """
        Calculate subtotal and total.
        subtotal = sum(line_totals)
        total = subtotal + tax - discount
        Returns (subtotal, total)
        """
        subtotal = sum(line_totals)
        total = subtotal + tax - discount
        
        # Ensure total doesn't go below 0
        if total < Decimal('0.00'):
            total = Decimal('0.00')
            
        return subtotal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP), total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
