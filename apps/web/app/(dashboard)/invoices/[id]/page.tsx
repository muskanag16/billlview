"use client";

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInvoice, sendInvoice } from '../../../../lib/api/invoices';
import { payPublicInvoice } from '../../../../lib/api/public';
import { getClients } from '../../../../lib/api/clients';
import PublicInvoiceView from '../../../../components/invoices/PublicInvoiceView';
import { Printer, Mail, Link as LinkIcon, Edit, ChevronLeft } from 'lucide-react';

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const invData = await getInvoice(token, id);
                setInvoice(invData);

                const clientsData = await getClients(token);
                const foundClient = clientsData.find((c: any) => c.id === invData.client_id);
                setClient(foundClient);

            } catch (err: any) {
                setError(err.message || 'Failed to load invoice');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleSend = async () => {
        setSending(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const updated = await sendInvoice(token, id);
            setInvoice(updated);
            alert('Invoice simulated as sent successfully!');
        } catch (err: any) {
            alert('Failed to send invoice: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleInternalPay = async () => {
        if (!invoice?.public_token) return;
        setPaying(true);
        try {
            const updated = await payPublicInvoice(invoice.public_token);
            setInvoice(updated);
            alert('Simulated payment successful! Invoice is now paid.');
        } catch (err: any) {
            alert('Payment simulation failed: ' + err.message);
        } finally {
            setPaying(false);
        }
    };

    const handleCopyLink = () => {
        const publicUrl = `${window.location.origin}/public/invoice/${invoice?.public_token}`;
        navigator.clipboard.writeText(publicUrl).then(() => {
            setCopySuccess('Link copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-500">Loading invoice...</div>;
    if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded">{error}</div>;
    if (!invoice) return <div className="p-8 text-center">Invoice not found.</div>;

    // We enhance the invoice object with client details for the PublicInvoiceView
    const displayInvoice = {
        ...invoice,
        client_name: client?.name,
        client_email: client?.email,
        client_address: client?.address
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Action Bar - Hidden during print */}
            <div className="print:hidden flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <Link href="/invoices" className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                    <ChevronLeft size={16} className="mr-1" />
                    Back to Invoices
                </Link>
                
                <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                    <button 
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                        <LinkIcon size={16} />
                        {copySuccess || 'Copy Link'}
                    </button>
                    
                    <button 
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                        <Printer size={16} />
                        Print / PDF
                    </button>

                    <Link
                        href={`/invoices/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
                    >
                        <Edit size={16} />
                        Edit
                    </Link>

                    {invoice.status === 'draft' && (
                        <button 
                            onClick={handleSend}
                            disabled={sending}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            <Mail size={16} />
                            {sending ? 'Sending...' : 'Send Invoice'}
                        </button>
                    )}
                </div>
            </div>

            {/* Printable Invoice Container */}
            <div className="print:m-0 print:p-0 print:shadow-none">
                <PublicInvoiceView 
                    invoice={displayInvoice} 
                    displayStatus={invoice.status} 
                    onPay={handleInternalPay}
                    paying={paying}
                />
            </div>
        </div>
    );
}
