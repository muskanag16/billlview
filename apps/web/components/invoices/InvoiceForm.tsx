"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '../../lib/api/invoices';
import { getClients } from '../../lib/api/clients';
import InvoiceItemsEditor from './InvoiceItemsEditor';
import InvoiceTotals from './InvoiceTotals';
import Link from 'next/link';

interface InvoiceItem {
    description: string;
    quantity: string;
    rate: string;
}

interface Props {
    invoiceId?: string;
}

export default function InvoiceForm({ invoiceId }: Props) {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];
    const [header, setHeader] = useState({
        client_id: '',
        invoice_number: `INV-${Date.now()}`,
        issue_date: today,
        due_date: today,
        notes: '',
        status: 'draft',
    });
    const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: '1', rate: '0.00' }]);
    const [tax, setTax] = useState('0.00');
    const [discount, setDiscount] = useState('0.00');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        getClients(token).then(setClients).catch(console.error);

        if (invoiceId) {
            import('../../lib/api/invoices').then(({ getInvoice }) => {
                getInvoice(token, invoiceId).then((data) => {
                    setHeader({
                        client_id: data.client_id,
                        invoice_number: data.invoice_number,
                        issue_date: data.issue_date,
                        due_date: data.due_date,
                        notes: data.notes || '',
                        status: data.status,
                    });
                    setItems(data.items.map((item: any) => ({
                        description: item.description,
                        quantity: String(item.quantity),
                        rate: String(item.rate),
                    })));
                    setTax(String(data.tax));
                    setDiscount(String(data.discount));
                }).catch(console.error);
            });
        }
    }, [invoiceId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const payload = {
                ...header,
                tax: parseFloat(tax) || 0,
                discount: parseFloat(discount) || 0,
                items: items.map((item) => ({
                    description: item.description,
                    quantity: parseFloat(item.quantity),
                    rate: parseFloat(item.rate),
                })),
            };
            if (invoiceId) {
                const { updateInvoice } = await import('../../lib/api/invoices');
                await updateInvoice(token, invoiceId, payload);
            } else {
                await createInvoice(token, payload);
            }
            router.push('/invoices');
        } catch (err: any) {
            setError(err.message || 'Failed to create invoice');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}

            <div className="glass-panel p-6 rounded-2xl space-y-5">
                <h2 className="text-lg font-bold text-slate-900">Invoice Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client *</label>
                        <select required value={header.client_id} onChange={(e) => setHeader({ ...header, client_id: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm">
                            <option value="">Select a client...</option>
                            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice Number *</label>
                        <input required type="text" value={header.invoice_number} onChange={(e) => setHeader({ ...header, invoice_number: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Issue Date *</label>
                        <input required type="date" value={header.issue_date} onChange={(e) => setHeader({ ...header, issue_date: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                        <input required type="date" value={header.due_date} onChange={(e) => setHeader({ ...header, due_date: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select value={header.status} onChange={(e) => setHeader({ ...header, status: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm">
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea rows={3} value={header.notes} onChange={(e) => setHeader({ ...header, notes: e.target.value })} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm" />
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
                <InvoiceItemsEditor items={items} onChange={setItems} />
            </div>

            <div className="glass-panel p-6 rounded-2xl">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Adjustments & Total</h2>
                <InvoiceTotals items={items} tax={tax} discount={discount} onTaxChange={setTax} onDiscountChange={setDiscount} />
            </div>

            <div className="flex justify-end gap-4">
                <Link href="/invoices" className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">Cancel</Link>
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium rounded-xl hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 disabled:opacity-50 transition-all hover:scale-[1.02]">
                    {saving ? 'Saving...' : 'Save Invoice'}
                </button>
            </div>
        </form>
    );
}
