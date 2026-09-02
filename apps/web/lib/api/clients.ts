const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getClients(token: string) {
    const response = await fetch(`${API_URL}/clients/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
}

export async function getClient(token: string, id: string) {
    const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch client');
    return response.json();
}

export async function createClient(token: string, data: any) {
    const response = await fetch(`${API_URL}/clients/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create client');
    return response.json();
}

export async function updateClient(token: string, id: string, data: any) {
    const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update client');
    return response.json();
}

export async function deleteClient(token: string, id: string) {
    const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete client');
    return true;
}
