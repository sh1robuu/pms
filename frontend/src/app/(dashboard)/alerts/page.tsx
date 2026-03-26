'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';
import type { Severity } from '@/types';

const severityIcons: Record<Severity, typeof AlertTriangle> = {
    CRITICAL: XCircle,
    HIGH: AlertCircle,
    MEDIUM: AlertTriangle,
    LOW: Info,
};

const severityStyles: Record<Severity, string> = {
    CRITICAL: 'bg-red-500/8 border-red-500/20 text-red-600 dark:text-red-400',
    HIGH: 'bg-orange-500/8 border-orange-500/20 text-orange-600 dark:text-orange-400',
    MEDIUM: 'bg-yellow-500/8 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    LOW: 'bg-blue-500/8 border-blue-500/20 text-blue-600 dark:text-blue-400',
};

export default function AlertsPage() {
    const queryClient = useQueryClient();

    const { data: alerts, isLoading } = useQuery({
        queryKey: ['alerts-page'],
        queryFn: () => alertsApi.getAll({ limit: '100' }),
        refetchInterval: 10000,
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => alertsApi.markAsRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts-page'] }),
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => alertsApi.markAllAsRead(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts-page'] }),
    });

    const unreadCount = alerts?.filter((a) => !a.isRead).length || 0;

    return (
        <>
            <Header title="Alerts" />
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-pms-text-muted" />
                        <span className="text-sm text-pms-text-secondary">{unreadCount} unread alerts</span>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllReadMutation.mutate()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-pms-text-muted hover:text-pms-text bg-pms-surface-hover hover:bg-pms-surface-hover rounded-lg border border-pms-border transition-all"
                        >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : alerts?.length === 0 ? (
                        <div className="text-center py-20 text-pms-text-faint text-sm">No alerts</div>
                    ) : (
                        alerts?.map((alert, i) => {
                            const Icon = severityIcons[alert.severity];
                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    onClick={() => !alert.isRead && markReadMutation.mutate(alert.id)}
                                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${severityStyles[alert.severity]} ${alert.isRead ? 'opacity-50' : 'hover:bg-pms-surface'}`}
                                >
                                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] opacity-60">
                                            <span>{new Date(alert.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            {alert.room && <span>Room {alert.room.roomNumber}</span>}
                                            {alert.reservation && <span>{alert.reservation.confirmationNumber}</span>}
                                            <span className="font-bold uppercase tracking-wider">{alert.severity}</span>
                                        </div>
                                    </div>
                                    {!alert.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-current shrink-0 mt-1" />
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
