// API client - uses same-origin (no separate backend server needed)

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            if (typeof window !== 'undefined') localStorage.setItem('token', token);
        } else {
            if (typeof window !== 'undefined') localStorage.removeItem('token');
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api${endpoint}`, {
            ...options,
            headers,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: res.statusText }));
            throw error;
        }

        return res.json();
    }

    get<T>(endpoint: string) { return this.request<T>(endpoint); }
    post<T>(endpoint: string, data?: unknown) {
        return this.request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
    }
    put<T>(endpoint: string, data?: unknown) {
        return this.request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
    }
    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient();

// Auth
export const authApi = {
    login: (email: string, password: string) =>
        api.post<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>('/auth/login', { email, password }),
};

// Dashboard
export const dashboardApi = {
    getStats: () => api.get<import('@/types').DashboardStats>('/dashboard/stats'),
    getActivity: (limit?: number) => api.get<{ recentAudit: import('@/types').AuditLog[]; recentAlerts: import('@/types').Alert[] }>(`/dashboard/activity?limit=${limit || 20}`),
};

// Reservations
export const reservationsApi = {
    getAll: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<import('@/types').Reservation[]>(`/reservations${qs}`);
    },
    getById: (id: string) => api.get<import('@/types').Reservation>(`/reservations/${id}`),
    getArrivals: (date?: string) => api.get<import('@/types').Reservation[]>(`/reservations?view=arrivals${date ? `&date=${date}` : ''}`),
    getDepartures: (date?: string) => api.get<import('@/types').Reservation[]>(`/reservations?view=departures${date ? `&date=${date}` : ''}`),
    create: (data: Record<string, unknown>) => api.post<import('@/types').Reservation>('/reservations', data),
    assignRoom: (id: string, roomId: string) =>
        api.post<{ reservation: import('@/types').Reservation; validation: import('@/types').ValidationResult }>(`/reservations/${id}/assign-room`, { roomId }),
    checkIn: (id: string) =>
        api.post<{ reservation: import('@/types').Reservation; validation: import('@/types').ValidationResult }>(`/reservations/${id}/check-in`),
    checkOut: (id: string) => api.post<import('@/types').Reservation>(`/reservations/${id}/check-out`),
    cancel: (id: string) => api.post<import('@/types').Reservation>(`/reservations/${id}/cancel`),
};

// Rooms
export const roomsApi = {
    getAll: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<import('@/types').Room[]>(`/rooms${qs}`);
    },
    getBoard: () => api.get<import('@/types').RoomBoardData>('/rooms?view=board'),
    getById: (id: string) => api.get<import('@/types').Room>(`/rooms/${id}`),
    getAvailable: (arrivalDate: string, departureDate: string, roomType?: string) => {
        let qs = `?view=available&arrivalDate=${arrivalDate}&departureDate=${departureDate}`;
        if (roomType) qs += `&roomType=${roomType}`;
        return api.get<import('@/types').Room[]>(`/rooms${qs}`);
    },
};

// Keys
export const keysApi = {
    getAll: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<import('@/types').Key[]>(`/keys${qs}`);
    },
    getByReservation: (reservationId: string) => api.get<import('@/types').Key[]>(`/keys?reservationId=${reservationId}`),
    issue: (data: { reservationId: string; roomId: string; guestId: string }) =>
        api.post<{ key: import('@/types').Key; validation: import('@/types').ValidationResult }>('/keys', data),
    revoke: (id: string) => api.post<import('@/types').Key>(`/keys/${id}/revoke`),
};

// Incidents
export const incidentsApi = {
    getAll: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<import('@/types').Incident[]>(`/incidents${qs}`);
    },
    getStats: () => api.get<{ open: number; investigating: number; total: number; resolved: number }>('/incidents?view=stats'),
    updateStatus: (id: string, status: string, ownerId?: string) =>
        api.put<import('@/types').Incident>(`/incidents/${id}`, { status, ownerId }),
};

// Alerts
export const alertsApi = {
    getAll: (params?: Record<string, string>) => {
        const qs = params ? '?' + new URLSearchParams(params).toString() : '';
        return api.get<import('@/types').Alert[]>(`/alerts${qs}`);
    },
    markAsRead: (id: string) => api.put(`/alerts/${id}`),
    markAllAsRead: () => api.put('/alerts'),
};
