"use client";

import { useState, useEffect } from 'react';
import { getClients, deleteClient } from '../../../lib/api/clients';
import Link from 'next/link';

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const data = await getClients(token);
                setClients(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return;
        
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await deleteClient(token, id);
                await fetchClients();
            }
        } catch (error) {
            console.error('Failed to delete client', error);
        }
    };

    if (loading) return <div className="p-8">Loading clients...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                <Link
                    href="/clients/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Add Client
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-lg shadow border border-gray-200">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new client.</p>
                    <div className="mt-6">
                        <Link
                            href="/clients/new"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            New Client
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {clients.map((client) => (
                            <li key={client.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{client.name}</p>
                                        <p className="flex items-center text-sm text-gray-500 mt-1">
                                            {client.email || 'No email provided'} 
                                            {client.company ? ` • ${client.company}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex space-x-4">
                                        <Link href={`/clients/${client.id}`} className="text-sm text-gray-500 hover:text-indigo-600">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(client.id)} className="text-sm text-red-500 hover:text-red-700">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
