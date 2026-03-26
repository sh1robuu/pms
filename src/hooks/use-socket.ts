'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAlertsStore } from '@/store/alerts-store';
import { useAuthStore } from '@/store/auth-store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const addAlert = useAlertsStore((s) => s.addAlert);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        const socket = io(`${WS_URL}/ws`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        socket.on('alert', (alert) => {
            addAlert(alert);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, [isAuthenticated, addAlert]);

    return socketRef.current;
}
