"use client";

import InvoiceForm from '../../../../../components/invoices/InvoiceForm';
import Link from 'next/link';
import { use } from 'react';

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
                <Link href={`/invoices/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
                    ← Back to Invoice View
                </Link>
            </div>
            <InvoiceForm invoiceId={id} />
        </div>
    );
}
