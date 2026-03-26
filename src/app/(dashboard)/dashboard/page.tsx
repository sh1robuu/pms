'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi, alertsApi, reservationsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { useAlertsStore } from '@/store/alerts-store';
import { DonutChart } from '@/components/charts';
import { KpiSkeleton } from '@/components/ui/skeleton-loaders';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Link from 'next/link';
import {
    CalendarArrowDown, CalendarArrowUp, Users, Crown,
    AlertTriangle, ShieldAlert, KeyRound, CircleOff,
    ArrowRight, Check, LogOut as LogOutIcon, BedDouble,
    Clock, TrendingUp,
} from 'lucide-react';
import type { Severity } from '@/types';

const severityColors: Record<Severity, string> = {
    CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    LOW: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
        refetchInterval: 15000,
    });
    const { data: activity } = useQuery({ queryKey: ['dashboard-activity'], queryFn: () => dashboardApi.getActivity(15), refetchInterval: 30000 });
    const { data: alerts } = useQuery({ queryKey: ['alerts-all'], queryFn: () => alertsApi.getAll({ limit: '10' }) });
    const { data: todayArrivals } = useQuery({ queryKey: ['today-arrivals-preview'], queryFn: () => reservationsApi.getArrivals() });
    const setAlerts = useAlertsStore((s) => s.setAlerts);
    const setUnreadCount = useAlertsStore((s) => s.setUnreadCount);
    useEffect(() => { if (alerts) { setAlerts(alerts); setUnreadCount(alerts.filter((a) => !a.isRead).length); } }, [alerts, setAlerts, setUnreadCount]);

    const kpis = [
        { label: 'Arrivals Today', value: stats?.arrivalsToday ?? '-', icon: CalendarArrowDown, gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/25' },
        { label: 'Departures', value: stats?.departuresToday ?? '-', icon: CalendarArrowUp, gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/25' },
        { label: 'In-House Guests', value: stats?.inHouseGuests ?? '-', icon: Users, gradient: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/25' },
        { label: 'VIP Arrivals', value: stats?.vipArrivals ?? '-', icon: Crown, gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/25' },
    ];

    const dangerKpis = [
        { label: 'Open Incidents', value: stats?.openIncidents ?? 0, icon: ShieldAlert, danger: (stats?.openIncidents ?? 0) > 0 },
        { label: 'Unread Alerts', value: stats?.unreadAlerts ?? 0, icon: AlertTriangle, danger: (stats?.unreadAlerts ?? 0) > 0 },
        { label: 'Out of Order', value: stats?.outOfOrderRooms ?? 0, icon: CircleOff, danger: false },
        { label: 'Keys Today', value: stats?.recentKeys ?? 0, icon: KeyRound, danger: false },
    ];

    const donutSegments = [
        { label: 'Vacant Clean', value: stats?.roomSummary?.VACANT_CLEAN ?? 0, color: '#10b981' },
        { label: 'Occupied', value: stats?.roomSummary?.OCCUPIED ?? 0, color: '#3b82f6' },
        { label: 'Vacant Dirty', value: stats?.roomSummary?.VACANT_DIRTY ?? 0, color: '#eab308' },
        { label: 'Out of Order', value: stats?.roomSummary?.OUT_OF_ORDER ?? 0, color: '#ef4444' },
        { label: 'Conflict', value: stats?.roomSummary?.CONFLICT ?? 0, color: '#f97316' },
    ];

    return (
        <>
            <Header title="Dashboard" />
            <div className="p-6 lg:p-8 space-y-6">
                {/* Row 1: Primary KPIs */}
                <div className="grid grid-cols-4 gap-4">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
                        : kpis.map((kpi, i) => (
                            <motion.div key={kpi.label} {...fadeIn} transition={{ delay: i * 0.06, duration: 0.4 }}
                                className="group relative bg-pms-surface backdrop-blur-sm border border-pms-border rounded-2xl p-5 hover:bg-pms-surface-hover hover:border-pms-border-strong transition-all duration-300 overflow-hidden">
                                <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.gradient} opacity-[0.07] blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500`} />
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg ${kpi.glow} mb-4`}>
                                        <kpi.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-3xl font-bold text-pms-text tracking-tight mb-0.5">{kpi.value}</p>
                                    <p className="text-[11px] text-pms-text-muted font-medium">{kpi.label}</p>
                                </div>
                            </motion.div>
                        ))}
                </div>

                {/* Row 2: Danger KPIs */}
                <div className="grid grid-cols-4 gap-3">
                    {dangerKpis.map((kpi, i) => (
                        <motion.div key={kpi.label} {...fadeIn} transition={{ delay: 0.25 + i * 0.04 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${kpi.danger ? 'bg-red-500/[0.04] border-red-500/20 hover:bg-red-500/[0.08]' : 'bg-pms-surface border-pms-border hover:bg-pms-surface-hover'}`}>
                            <kpi.icon className={`w-4 h-4 ${kpi.danger ? 'text-red-500' : 'text-pms-text-faint'}`} />
                            <span className={`text-lg font-bold ${kpi.danger ? 'text-red-500' : 'text-pms-text-secondary'}`}>{kpi.value}</span>
                            <span className="text-[10px] text-pms-text-faint">{kpi.label}</span>
                            {kpi.danger && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto" />}
                        </motion.div>
                    ))}
                </div>

                {/* Row 3: Main content */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Room Occupancy */}
                    <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="col-span-3 bg-pms-surface border border-pms-border rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <BedDouble className="w-4 h-4 text-pms-text-muted" />
                            <h3 className="text-sm font-semibold text-pms-text">Room Occupancy</h3>
                        </div>
                        <div className="flex justify-center mb-5"><DonutChart segments={donutSegments} size={150} thickness={18} /></div>
                        <div className="space-y-2.5">
                            {donutSegments.map((seg) => (
                                <div key={seg.label} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
                                    <span className="text-[11px] text-pms-text-muted flex-1">{seg.label}</span>
                                    <span className="text-xs font-semibold text-pms-text-secondary">{seg.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Actions + Arrivals */}
                    <motion.div {...fadeIn} transition={{ delay: 0.45 }} className="col-span-5 space-y-5">
                        <div className="bg-pms-surface border border-pms-border rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-pms-text-muted" />
                                <h3 className="text-sm font-semibold text-pms-text">Quick Actions</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <Link href="/arrivals">
                                    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/10 hover:bg-blue-500/[0.12] hover:border-blue-500/20 transition-all cursor-pointer group">
                                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Check In</span>
                                    </div>
                                </Link>
                                <Link href="/departures">
                                    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/10 hover:bg-violet-500/[0.12] hover:border-violet-500/20 transition-all cursor-pointer group">
                                        <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <LogOutIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">Check Out</span>
                                    </div>
                                </Link>
                                <Link href="/keys">
                                    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-teal-500/[0.06] border border-teal-500/10 hover:bg-teal-500/[0.12] hover:border-teal-500/20 transition-all cursor-pointer group">
                                        <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Issue Key</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="bg-pms-surface border border-pms-border rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CalendarArrowDown className="w-4 h-4 text-pms-text-muted" />
                                    <h3 className="text-sm font-semibold text-pms-text">Next Arrivals</h3>
                                </div>
                                <Link href="/arrivals" className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline">View all <ArrowRight className="w-3 h-3" /></Link>
                            </div>
                            <div className="space-y-2">
                                {todayArrivals?.slice(0, 4).map((res) => (
                                    <div key={res.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-pms-inset hover:bg-pms-surface-hover transition-all">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                            {res.guest?.firstName?.charAt(0)}{res.guest?.lastName?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-pms-text truncate">{res.guest?.firstName} {res.guest?.lastName}{res.isVip && <Crown className="inline w-3 h-3 text-amber-500 ml-1" />}</p>
                                            <p className="text-[10px] text-pms-text-faint font-mono">{res.confirmationNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            {res.assignedRoom ? <span className="text-[10px] text-pms-text-muted">Rm {res.assignedRoom.roomNumber}</span> : <span className="text-[10px] text-orange-500">No room</span>}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${res.status === 'CHECKED_IN' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>{res.status === 'CHECKED_IN' ? 'IN' : 'DUE'}</span>
                                    </div>
                                ))}
                                {(!todayArrivals || todayArrivals.length === 0) && <p className="text-xs text-pms-text-faint text-center py-4">No arrivals today</p>}
                            </div>
                        </div>
                    </motion.div>

                    {/* Live Alerts */}
                    <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="col-span-4 bg-pms-surface border border-pms-border rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <AlertTriangle className="w-4 h-4 text-pms-text-muted" />
                            <h3 className="text-sm font-semibold text-pms-text">Live Alerts</h3>
                            <div className="flex items-center gap-1.5 ml-auto px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                            {alerts?.length === 0 && <p className="text-xs text-pms-text-faint py-8 text-center">No alerts</p>}
                            {alerts?.map((alert, i) => (
                                <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border ${severityColors[alert.severity]} ${!alert.isRead ? '' : 'opacity-50'}`}>
                                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium leading-relaxed">{alert.message}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Clock className="w-2.5 h-2.5 opacity-50" />
                                            <span className="text-[9px] opacity-50">{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {alert.room && <span className="text-[9px] opacity-50">Rm {alert.room.roomNumber}</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Activity Feed */}
                <motion.div {...fadeIn} transition={{ delay: 0.55 }} className="bg-pms-surface border border-pms-border rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-pms-text mb-4">Recent Activity</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                        {activity?.recentAudit?.slice(0, 8).map((log) => (
                            <div key={log.id} className="flex items-center gap-2 py-1">
                                <div className="w-1 h-1 rounded-full bg-blue-500/40 shrink-0" />
                                <span className="text-[11px] text-pms-text-muted flex-1 truncate">
                                    <span className="text-pms-text-secondary font-medium">{log.action.replace(/_/g, ' ')}</span>{' by '}<span className="text-pms-text-muted">{log.user?.name}</span>
                                </span>
                                <span className="text-[10px] text-pms-text-faint shrink-0">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </>
    );
}
