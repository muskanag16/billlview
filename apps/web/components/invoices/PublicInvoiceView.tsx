"use client";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    draft:   { bg: 'bg-gray-100',   text: 'text-gray-700',  label: 'Draft'   },
    sent:    { bg: 'bg-blue-100',   text: 'text-blue-700',  label: 'Sent'    },
    paid:    { bg: 'bg-green-100',  text: 'text-green-700', label: 'Paid'    },
    overdue: { bg: 'bg-red-100',    text: 'text-red-700',   label: 'Overdue' },
};

interface Item { id: string; description: string; quantity: number; rate: number; line_total: number; }
interface Props {
    invoice: {
        invoice_number: string;
        issue_date: string;
        due_date: string;
        notes?: string;
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        items: Item[];
        client?: {
            name: string;
            email?: string;
            company?: string;
            address?: string;
            phone?: string;
        };
        business?: {
            business_name?: string;
            logo_url?: string;
            currency?: string;
        };
    };
    displayStatus: string;
    onPay: () => void;
    paying: boolean;
}

export default function PublicInvoiceView({ invoice, displayStatus, onPay, paying }: Props) {
    const style = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.draft;
    const canPay = displayStatus !== 'paid';

    const fmt = (n: number | string) => parseFloat(String(n)).toFixed(2);

    const handlePrint = () => window.print();

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-10 print:p-0 print:max-w-full">
            {/* Action bar — hidden in print */}
            <div className="mb-6 flex justify-between items-center print:hidden">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
                    {style.label}
                </span>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Download PDF
                    </button>
                    {canPay && (
                        <button
                            onClick={onPay}
                            disabled={paying}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 disabled:opacity-50 transition-all hover:-translate-y-0.5 animate-pulse-slow"
                        >
                            {paying ? 'Processing...' : 'Pay Now'}
                        </button>
                    )}
                </div>
            </div>

            {/* Invoice card */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 print:shadow-none print:border-0 relative overflow-hidden">
                {/* Decorative top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 print:hidden"></div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-8">
                    <div>
                        {invoice.business?.logo_url ? (
                            <img src={invoice.business.logo_url} alt="Business Logo" className="h-12 object-contain mb-4" />
                        ) : (
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{invoice.business?.business_name || 'INVOICE'}</h1>
                        )}
                        <p className="text-gray-500 text-sm mt-1">Invoice #{invoice.invoice_number}</p>
                        
                        {/* From Section */}
                        <div className="mt-6 text-sm text-gray-600 space-y-1">
                            <p className="font-semibold text-gray-800">From:</p>
                            {invoice.business?.business_name && <p>{invoice.business.business_name}</p>}
                            {/* In a real app we'd have business address, email, etc. here */}
                        </div>
                    </div>
                    
                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-6">
                        <div className="text-sm text-gray-600 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px]">
                            <div className="flex justify-between gap-4"><span className="font-medium">Issue Date:</span> <span>{invoice.issue_date}</span></div>
                            <div className="flex justify-between gap-4"><span className="font-medium">Due Date:</span> <span>{invoice.due_date}</span></div>
                        </div>

                        {/* To Section */}
                        {invoice.client && (
                            <div className="text-sm text-gray-600 space-y-1 text-left sm:text-right">
                                <p className="font-semibold text-gray-800">Billed To:</p>
                                <p className="font-medium text-indigo-600">{invoice.client.name}</p>
                                {invoice.client.company && <p>{invoice.client.company}</p>}
                                {invoice.client.email && <p>{invoice.client.email}</p>}
                                {invoice.client.address && <p className="whitespace-pre-line">{invoice.client.address}</p>}
                                {invoice.client.phone && <p>{invoice.client.phone}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                                <th className="text-left py-2 pr-4 font-medium">Description</th>
                                <th className="text-right py-2 px-2 font-medium">Qty</th>
                                <th className="text-right py-2 px-2 font-medium">Rate</th>
                                <th className="text-right py-2 pl-4 font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoice.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-3 pr-4 text-gray-800">{item.description}</td>
                                    <td className="py-3 px-2 text-right text-gray-600">{fmt(item.quantity)}</td>
                                    <td className="py-3 px-2 text-right text-gray-600">${fmt(item.rate)}</td>
                                    <td className="py-3 pl-4 text-right text-gray-800 font-medium">${fmt(item.line_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 text-sm space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span><span>${fmt(invoice.subtotal)}</span>
                        </div>
                        {Number(invoice.tax) > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span><span>+${fmt(invoice.tax)}</span>
                            </div>
                        )}
                        {Number(invoice.discount) > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span><span>-${fmt(invoice.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2">
                            <span>Total Due</span><span>${fmt(invoice.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mt-8 border-t pt-6">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                        <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
