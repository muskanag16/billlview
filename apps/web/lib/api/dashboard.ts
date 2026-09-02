const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getDashboardMetrics(token: string) {
    const res = await fetch(`${API_URL}/dashboard/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!res.ok) {
        if (res.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch dashboard metrics');
    }

    return res.json();
}
