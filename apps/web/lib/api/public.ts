const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Fetch a full invoice by its public token.
 * No Authorization header required — this is an unauthenticated endpoint.
 */
export async function getPublicInvoice(token: string) {
    const response = await fetch(`${API_URL}/public/invoice/${token}`, {
        method: 'GET',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.detail?.message || 'Invoice not found or link is invalid.');
    }
    return response.json();
}

/**
 * Submit a simulated payment for the given public token.
 * Returns the updated invoice on success.
 */
export async function payPublicInvoice(token: string) {
    const response = await fetch(`${API_URL}/public/invoice/${token}/pay`, {
        method: 'POST',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.detail?.message || 'Payment failed.');
    }
    return response.json();
}
