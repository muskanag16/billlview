"use client";

import { useState, useEffect } from 'react';
import { use } from 'react';
import { getPublicInvoice, payPublicInvoice } from '../../../../lib/api/public';
import PublicInvoiceView from '../../../../components/invoices/PublicInvoiceView';

function resolveDisplayStatus(invoice: any): string {
    if (invoice.status === 'paid') return 'paid';
    if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) return 'overdue';
    return invoice.status;
}

export default function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paying, setPaying] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    useEffect(() => {
        getPublicInvoice(token)
            .then(setInvoice)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    const handlePay = async () => {
        setPaying(true);
        try {
            const updated = await payPublicInvoice(token);
            setInvoice(updated);
            setPaySuccess(true);
        } catch (err: any) {
            setError(err.message || 'Payment failed.');
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-sm animate-pulse">Loading invoice...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white shadow rounded-xl p-10 text-center max-w-sm">
                    <p className="text-4xl mb-4">❌</p>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    const displayStatus = resolveDisplayStatus(invoice);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            {paySuccess && (
                <div className="max-w-3xl mx-auto mb-6 px-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm font-medium">
                        ✅ Payment successful! This invoice is now marked as paid.
                    </div>
                </div>
            )}
            <PublicInvoiceView
                invoice={invoice}
                displayStatus={displayStatus}
                onPay={handlePay}
                paying={paying}
            />
        </div>
    );
}
