'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Clock, User, CheckCircle } from 'lucide-react';
import type { Severity, IncidentStatus } from '@/types';

const severityConfig: Record<Severity, { bg: string; text: string; dot: string }> = {
    CRITICAL: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
    HIGH: { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
    MEDIUM: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
    LOW: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
};

const statusConfig: Record<IncidentStatus, { bg: string; text: string }> = {
    OPEN: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
    INVESTIGATING: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400' },
    RESOLVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    CLOSED: { bg: 'bg-white/5', text: 'text-pms-text-faint' },
};

export default function IncidentsPage() {
    const queryClient = useQueryClient();
    const { data: incidents, isLoading } = useQuery({
        queryKey: ['incidents'],
        queryFn: () => incidentsApi.getAll(),
        refetchInterval: 15000,
    });

    const { data: incidentStats } = useQuery({
        queryKey: ['incident-stats'],
        queryFn: incidentsApi.getStats,
        refetchInterval: 15000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            incidentsApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            queryClient.invalidateQueries({ queryKey: ['incident-stats'] });
        },
    });

    return (
        <>
            <Header title="Incident Center" />
            <div className="p-8">
                {/* Stats */}
                <div className="flex items-center gap-4 mb-6">
                    {[
                        { label: 'Open', value: incidentStats?.open ?? 0, color: 'text-red-600 dark:text-red-400' },
                        { label: 'Investigating', value: incidentStats?.investigating ?? 0, color: 'text-yellow-600 dark:text-yellow-400' },
                        { label: 'Total', value: incidentStats?.total ?? 0, color: 'text-pms-text-secondary' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex items-center gap-2 px-4 py-2 bg-pms-surface rounded-xl border border-pms-border">
                            <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                            <span className="text-[10px] text-pms-text-faint uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Incidents list */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : incidents?.length === 0 ? (
                        <div className="text-center py-20 text-pms-text-faint text-sm">No incidents</div>
                    ) : (
                        incidents?.map((incident, i) => {
                            const sev = severityConfig[incident.severity];
                            const sta = statusConfig[incident.status as IncidentStatus];
                            return (
                                <motion.div
                                    key={incident.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={`p-5 rounded-2xl border ${sev.bg} hover:bg-pms-surface transition-all`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sev.bg}`}>
                                            <ShieldAlert className={`w-5 h-5 ${sev.text}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${sev.text}`}>
                                                    {incident.severity}
                                                </span>
                                                <span className="text-[10px] text-white/20">•</span>
                                                <span className="text-xs text-pms-text-muted">{incident.type.replace(/_/g, ' ')}</span>
                                            </div>
                                            <p className="text-sm text-pms-text mb-2">{incident.description}</p>
                                            <div className="flex items-center gap-4 text-[11px] text-pms-text-faint">
                                                {incident.room && (
                                                    <span className="flex items-center gap-1">Room {incident.room.roomNumber}</span>
                                                )}
                                                {incident.reservation && (
                                                    <span className="flex items-center gap-1">{incident.reservation.confirmationNumber}</span>
                                                )}
                                                {incident.guest && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {incident.guest.firstName} {incident.guest.lastName}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(incident.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${sta.bg} ${sta.text}`}>
                                                {incident.status}
                                            </span>
                                            {incident.status === 'OPEN' && (
                                                <button
                                                    onClick={() => updateStatusMutation.mutate({ id: incident.id, status: 'INVESTIGATING' })}
                                                    className="px-3 py-1.5 text-[10px] font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 rounded-lg border border-yellow-500/20 transition-all"
                                                >
                                                    Investigate
                                                </button>
                                            )}
                                            {incident.status === 'INVESTIGATING' && (
                                                <button
                                                    onClick={() => updateStatusMutation.mutate({ id: incident.id, status: 'RESOLVED' })}
                                                    className="px-3 py-1.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
