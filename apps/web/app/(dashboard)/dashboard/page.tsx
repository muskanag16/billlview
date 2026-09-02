"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getDashboardMetrics } from "../../../lib/api/dashboard";
import MetricCard from "../../../components/dashboard/MetricCard";
import { Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        getDashboardMetrics(token)
            .then(setMetrics)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="animate-pulse">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Link
                    href="/invoices/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                    <Plus size={16} />
                    New Invoice
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                    title="Total Earned" 
                    value={`$${metrics.total_earned}`} 
                    type="success"
                />
                <MetricCard 
                    title="Outstanding" 
                    value={`$${metrics.total_outstanding}`} 
                    type="warning"
                />
                <MetricCard 
                    title="Overdue" 
                    value={`$${metrics.total_overdue}`} 
                    type="danger"
                />
            </div>

            {/* Income Chart */}
            <div className="bg-white shadow rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Over Time</h2>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.income_over_time}>
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `$${value}`} 
                            />
                            <Tooltip 
                                cursor={{fill: '#f3f4f6'}} 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`$${value}`, 'Income']}
                            />
                            <Bar dataKey="income" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                    <Link href="/invoices" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">Invoice Number</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Due Date</th>
                                <th className="px-6 py-3 font-medium text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {metrics.recent_invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                metrics.recent_invoices.map((inv: any) => (
                                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <Link href={`/invoices/${inv.id}`} className="hover:underline">
                                                {inv.invoice_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                ${inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                  inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                  inv.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                  'bg-gray-100 text-gray-800'}`}
                                            >
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{inv.due_date}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">${inv.total}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
