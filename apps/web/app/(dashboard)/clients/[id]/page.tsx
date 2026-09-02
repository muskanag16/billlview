"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClient, updateClient } from '../../../../lib/api/clients';
import Link from 'next/link';
import { use } from 'react';

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [client, setClient] = useState({
        name: '',
        email: '',
        company: '',
        address: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const data = await getClient(token, id);
                    setClient({
                        name: data.name || '',
                        email: data.email || '',
                        company: data.company || '',
                        address: data.address || '',
                        phone: data.phone || ''
                    });
                }
            } catch (err: any) {
                setError('Failed to load client');
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await updateClient(token, id, client);
                router.push('/clients');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update client');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading client...</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Client</h1>
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
                        {saving ? 'Saving...' : 'Update Client'}
                    </button>
                </div>
            </form>
        </div>
    );
}
