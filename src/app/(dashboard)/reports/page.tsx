'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { DonutChart, SparkBar } from '@/components/charts';
import { motion } from 'framer-motion';
import {
    BarChart3, BedDouble, Users, CalendarArrowDown, CalendarArrowUp,
    ShieldAlert, AlertTriangle, KeyRound, Moon, TrendingUp,
} from 'lucide-react';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function ReportsPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['report-stats'],
        queryFn: dashboardApi.getStats,
    });

    const { data: activity } = useQuery({
        queryKey: ['report-activity'],
        queryFn: () => dashboardApi.getActivity(30),
    });

    const totalRooms = stats ? Object.values(stats.roomSummary).reduce((a, b) => a + b, 0) : 0;
    const occupiedCount = stats?.roomSummary?.OCCUPIED ?? 0;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

    const donutSegments = [
        { label: 'Vacant Clean', value: stats?.roomSummary?.VACANT_CLEAN ?? 0, color: '#10b981' },
        { label: 'Occupied', value: stats?.roomSummary?.OCCUPIED ?? 0, color: '#3b82f6' },
        { label: 'Vacant Dirty', value: stats?.roomSummary?.VACANT_DIRTY ?? 0, color: '#eab308' },
        { label: 'Out of Order', value: stats?.roomSummary?.OUT_OF_ORDER ?? 0, color: '#ef4444' },
    ];

    const sparkData = [
        { label: 'VC', value: stats?.roomSummary?.VACANT_CLEAN ?? 0, color: '#10b981' },
        { label: 'VD', value: stats?.roomSummary?.VACANT_DIRTY ?? 0, color: '#eab308' },
        { label: 'OC', value: stats?.roomSummary?.OCCUPIED ?? 0, color: '#3b82f6' },
        { label: 'OO', value: stats?.roomSummary?.OUT_OF_ORDER ?? 0, color: '#ef4444' },
    ];

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <Header title="Reports" />
            <div className="p-6 lg:p-8 space-y-6">
                {/* Night Audit Header */}
                <motion.div
                    {...fadeIn}
                    className="bg-gradient-to-r from-indigo-500/[0.06] to-violet-500/[0.06] border border-indigo-500/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Moon className="w-5 h-5 text-pms-text" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-pms-text">Night Audit Report</h2>
                            <p className="text-xs text-pms-text-muted">{today}</p>
                        </div>
                    </div>
                </motion.div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* KPI Row */}
                        <div className="grid grid-cols-5 gap-4">
                            {[
                                { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, color: occupancyRate > 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500' },
                                { label: 'Arrivals', value: stats?.arrivalsToday ?? 0, icon: CalendarArrowDown, color: 'text-blue-600 dark:text-blue-400' },
                                { label: 'Departures', value: stats?.departuresToday ?? 0, icon: CalendarArrowUp, color: 'text-violet-600 dark:text-violet-400' },
                                { label: 'In-House', value: stats?.inHouseGuests ?? 0, icon: Users, color: 'text-emerald-600 dark:text-emerald-400' },
                                { label: 'Reservations', value: stats?.totalReservations ?? 0, icon: BarChart3, color: 'text-pms-text-secondary' },
                            ].map((kpi, i) => (
                                <motion.div
                                    key={kpi.label}
                                    {...fadeIn}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-pms-surface border border-pms-border rounded-2xl p-5"
                                >
                                    <kpi.icon className={`w-4 h-4 ${kpi.color} mb-3`} />
                                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                                    <p className="text-[10px] text-white/35 mt-1">{kpi.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Room Status Distribution */}
                            <motion.div
                                {...fadeIn}
                                transition={{ delay: 0.3 }}
                                className="col-span-4 bg-pms-surface border border-pms-border rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <BedDouble className="w-4 h-4 text-pms-text-muted" />
                                    <h3 className="text-sm font-semibold text-pms-text">Room Distribution</h3>
                                </div>
                                <div className="flex justify-center mb-5">
                                    <DonutChart segments={donutSegments} size={140} thickness={16} />
                                </div>
                                <div className="space-y-2">
                                    {donutSegments.map((seg) => (
                                        <div key={seg.label} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: seg.color }} />
                                            <span className="text-[11px] text-pms-text-muted flex-1">{seg.label}</span>
                                            <span className="text-xs font-semibold text-pms-text-secondary">{seg.value}</span>
                                            <span className="text-[10px] text-white/25">{totalRooms > 0 ? Math.round((seg.value / totalRooms) * 100) : 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Room Status Bar Chart */}
                            <motion.div
                                {...fadeIn}
                                transition={{ delay: 0.35 }}
                                className="col-span-4 bg-pms-surface border border-pms-border rounded-2xl p-6"
                            >
                                <h3 className="text-sm font-semibold text-white mb-5">Status Breakdown</h3>
                                <SparkBar data={sparkData} height={120} />
                                <div className="mt-4 pt-4 border-t border-pms-border">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-white/35">Total Rooms</span>
                                        <span className="font-semibold text-pms-text-secondary">{totalRooms}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-1">
                                        <span className="text-white/35">Available</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats?.roomSummary?.VACANT_CLEAN ?? 0}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Outstanding Issues */}
                            <motion.div
                                {...fadeIn}
                                transition={{ delay: 0.4 }}
                                className="col-span-4 bg-pms-surface border border-pms-border rounded-2xl p-6"
                            >
                                <h3 className="text-sm font-semibold text-white mb-5">Outstanding Issues</h3>
                                <div className="space-y-3">
                                    <div className={`flex items-center gap-3 p-3 rounded-xl ${(stats?.openIncidents ?? 0) > 0 ? 'bg-red-500/[0.06] border border-red-500/10' : 'bg-pms-surface'}`}>
                                        <ShieldAlert className={`w-4 h-4 ${(stats?.openIncidents ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-white/20'}`} />
                                        <span className="text-xs text-pms-text-muted flex-1">Open Incidents</span>
                                        <span className={`text-lg font-bold ${(stats?.openIncidents ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-white/20'}`}>{stats?.openIncidents ?? 0}</span>
                                    </div>
                                    <div className={`flex items-center gap-3 p-3 rounded-xl ${(stats?.unreadAlerts ?? 0) > 0 ? 'bg-orange-500/[0.06] border border-orange-500/10' : 'bg-pms-surface'}`}>
                                        <AlertTriangle className={`w-4 h-4 ${(stats?.unreadAlerts ?? 0) > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-white/20'}`} />
                                        <span className="text-xs text-pms-text-muted flex-1">Unread Alerts</span>
                                        <span className={`text-lg font-bold ${(stats?.unreadAlerts ?? 0) > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-white/20'}`}>{stats?.unreadAlerts ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-pms-surface">
                                        <KeyRound className="w-4 h-4 text-white/20" />
                                        <span className="text-xs text-pms-text-muted flex-1">Keys Issued Today</span>
                                        <span className="text-lg font-bold text-pms-text-secondary">{stats?.recentKeys ?? 0}</span>
                                    </div>
                                    <div className={`flex items-center gap-3 p-3 rounded-xl ${(stats?.outOfOrderRooms ?? 0) > 0 ? 'bg-yellow-500/[0.06] border border-yellow-500/10' : 'bg-pms-surface'}`}>
                                        <BedDouble className={`w-4 h-4 ${(stats?.outOfOrderRooms ?? 0) > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-white/20'}`} />
                                        <span className="text-xs text-pms-text-muted flex-1">Out of Order</span>
                                        <span className={`text-lg font-bold ${(stats?.outOfOrderRooms ?? 0) > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-white/20'}`}>{stats?.outOfOrderRooms ?? 0}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Recent Audit Trail */}
                        <motion.div
                            {...fadeIn}
                            transition={{ delay: 0.45 }}
                            className="bg-pms-surface border border-pms-border rounded-2xl p-6"
                        >
                            <h3 className="text-sm font-semibold text-white mb-4">Today&apos;s Audit Trail</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                                {activity?.recentAudit?.slice(0, 12).map((log) => (
                                    <div key={log.id} className="flex items-center gap-2 py-1.5">
                                        <div className="w-1 h-1 rounded-full bg-blue-500/40 shrink-0" />
                                        <span className="text-[11px] text-pms-text-muted flex-1 truncate">
                                            <span className="text-pms-text-secondary font-medium">{log.action.replace(/_/g, ' ')}</span>
                                            {' by '}<span className="text-pms-text-muted">{log.user?.name}</span>
                                        </span>
                                        <span className="text-[10px] text-white/20 shrink-0">
                                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </>
    );
}
