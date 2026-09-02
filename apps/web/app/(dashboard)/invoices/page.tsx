"use client";

import { useState, useEffect } from 'react';
import { getInvoices, deleteInvoice } from '../../../lib/api/invoices';
import { getClients } from '../../../lib/api/clients';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/10',
    sent: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    overdue: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
};

export default function InvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const data = await getInvoices(token, search || undefined, statusFilter || undefined, clientFilter || undefined, sortBy, sortOrder);
                setInvoices(data);
                
                if (clients.length === 0) {
                    const clientsData = await getClients(token);
                    setClients(clientsData);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [search, statusFilter, clientFilter, sortBy, sortOrder]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this invoice?')) return;
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await deleteInvoice(token, id);
                fetchInvoices();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getDisplayStatus = (invoice: any): string => {
        if (invoice.status === 'paid') return 'paid';
        if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) return 'overdue';
        return invoice.status;
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Invoices</h1>
                <Link href="/invoices/new" className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02]">
                    <span className="mr-2 text-lg leading-none">+</span> New Invoice
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search invoice number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm"
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm">
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                </select>
                <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm">
                    <option value="">All Clients</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex gap-2">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm">
                        <option value="created_at">Date Created</option>
                        <option value="issue_date">Issue Date</option>
                        <option value="due_date">Due Date</option>
                        <option value="total">Amount</option>
                    </select>
                    <button 
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} 
                        className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
                        title="Toggle Sort Order"
                    >
                        {sortOrder === 'desc' ? '↓' : '↑'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading invoices...</div>
            ) : invoices.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-lg shadow border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">No invoices found</h3>
                    <p className="mt-1 text-sm text-gray-500">Create your first invoice to get started.</p>
                    <Link href="/invoices/new" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        New Invoice
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {invoices.map((invoice) => {
                        const displayStatus = getDisplayStatus(invoice);
                        return (
                            <div key={invoice.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-4 mb-1">
                                        <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{invoice.invoice_number}</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[displayStatus] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10'}`}>
                                            {displayStatus}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Due: {invoice.due_date} <span className="mx-2 text-slate-300">|</span> Total: <span className="text-slate-700">${parseFloat(invoice.total).toFixed(2)}</span>
                                    </p>
                                </div>
                                <div className="flex gap-3 items-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => router.push(`/invoices/${invoice.id}`)} className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">View</button>
                                    <button onClick={() => handleDelete(invoice.id)} className="px-4 py-2 rounded-lg text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors">Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
