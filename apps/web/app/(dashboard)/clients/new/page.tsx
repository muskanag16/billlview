"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/api/clients';
import Link from 'next/link';

export default function NewClientPage() {
    const router = useRouter();
    const [client, setClient] = useState({
        name: '',
        email: '',
        company: '',
        address: '',
        phone: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await createClient(token, client);
                router.push('/clients');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create client');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">New Client</h1>
                <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-900">Cancel</Link>
            </div>

            {error && <div className="p-4 mb-6 bg-red-50 text-red-800 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                        required
                        type="text"
                        value={client.name}
                        onChange={(e) => setClient({ ...client, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={client.email}
                        onChange={(e) => setClient({ ...client, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                        type="text"
                        value={client.company}
                        onChange={(e) => setClient({ ...client, company: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        value={client.phone}
                        onChange={(e) => setClient({ ...client, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                        rows={3}
                        value={client.address}
                        onChange={(e) => setClient({ ...client, address: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {saving ? 'Saving...' : 'Create Client'}
                    </button>
                </div>
            </form>
        </div>
    );
}
