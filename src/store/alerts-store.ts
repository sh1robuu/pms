import { create } from 'zustand';
import type { Alert } from '@/types';

interface AlertsState {
    alerts: Alert[];
    unreadCount: number;
    addAlert: (alert: Alert) => void;
    setAlerts: (alerts: Alert[]) => void;
    setUnreadCount: (count: number) => void;
    markAsRead: (id: string) => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
    alerts: [],
    unreadCount: 0,
    addAlert: (alert) =>
        set((state) => ({
            alerts: [alert, ...state.alerts].slice(0, 100),
            unreadCount: state.unreadCount + 1,
        })),
    setAlerts: (alerts) => set({ alerts }),
    setUnreadCount: (count) => set({ unreadCount: count }),
    markAsRead: (id) =>
        set((state) => ({
            alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
            unreadCount: Math.max(0, state.unreadCount - 1),
        })),
}));
