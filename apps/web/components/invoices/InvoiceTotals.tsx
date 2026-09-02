"use client";

interface InvoiceItem {
    description: string;
    quantity: string;
    rate: string;
}

interface Props {
    items: InvoiceItem[];
    tax: string;
    discount: string;
    onTaxChange: (value: string) => void;
    onDiscountChange: (value: string) => void;
}

function parseDecimal(val: string): number {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
}

export default function InvoiceTotals({ items, tax, discount, onTaxChange, onDiscountChange }: Props) {
    const subtotal = items.reduce((acc, item) => {
        return acc + parseDecimal(item.quantity) * parseDecimal(item.rate);
    }, 0);

    const total = subtotal + parseDecimal(tax) - parseDecimal(discount);

    const fmt = (n: number) => n.toFixed(2);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tax}
                        onChange={(e) => onTaxChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Amount</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discount}
                        onChange={(e) => onDiscountChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${fmt(subtotal)}</span>
                </div>
                {parseDecimal(tax) > 0 && (
                    <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>+${fmt(parseDecimal(tax))}</span>
                    </div>
                )}
                {parseDecimal(discount) > 0 && (
                    <div className="flex justify-between text-gray-600">
                        <span>Discount</span>
                        <span>-${fmt(parseDecimal(discount))}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
                    <span>Total</span>
                    <span>${fmt(Math.max(0, total))}</span>
                </div>
                <p className="text-xs text-gray-400 italic">
                    * Final total is recalculated by the server on save.
                </p>
            </div>
        </div>
    );
}
