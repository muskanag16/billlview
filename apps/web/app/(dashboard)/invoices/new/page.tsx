"use client";

import InvoiceForm from '../../../../components/invoices/InvoiceForm';
import Link from 'next/link';

export default function NewInvoicePage() {
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
                <Link href="/invoices" className="text-sm text-gray-500 hover:text-gray-900">
                    ← Back to Invoices
                </Link>
            </div>
            <InvoiceForm />
        </div>
    );
}
