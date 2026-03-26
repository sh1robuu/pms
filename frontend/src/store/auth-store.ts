import { create } from 'zustand';
import { api } from '@/lib/api';

interface AuthState {
    user: { id: string; email: string; name: string; role: string } | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: { id: string; email: string; name: string; role: string }) => void;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: (token, user) => {
        api.setToken(token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        api.setToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },
    hydrate: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
                const user = JSON.parse(userStr);
                api.setToken(token);
                set({ user, token, isAuthenticated: true });
            }
        }
    },
}));
