const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getInvoices(token: string, search?: string, status?: string, clientId?: string, sortBy?: string, sortOrder?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (clientId) params.append('client_id', clientId);
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_URL}/invoices/${queryString}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
}

export async function getInvoice(token: string, id: string) {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
}

export async function createInvoice(token: string, data: any) {
    const response = await fetch(`${API_URL}/invoices/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create invoice');
    return response.json();
}

export async function updateInvoice(token: string, id: string, data: any) {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update invoice');
    return response.json();
}

export async function deleteInvoice(token: string, id: string) {
    const response = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete invoice');
    return true;
}

export async function sendInvoice(token: string, id: string) {
    const response = await fetch(`${API_URL}/invoices/${id}/send`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to send invoice');
    return response.json();
}
