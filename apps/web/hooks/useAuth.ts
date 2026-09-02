"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, signup as signupApi, getMe } from '../lib/api/auth';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await getMe(token);
                    setUser(userData);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (credentials: any) => {
        const response = await loginApi(credentials);
        localStorage.setItem('token', response.access_token);
        const userData = await getMe(response.access_token);
        setUser(userData);
        router.push('/dashboard');
    };

    const signup = async (data: any) => {
        await signupApi(data);
        await login({ email: data.email, password: data.password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return { user, loading, login, signup, logout };
}
