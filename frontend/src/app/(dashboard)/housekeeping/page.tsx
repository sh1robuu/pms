'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi, api } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { SprayCan, CheckCircle, Sparkles, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Room } from '@/types';

const hkConfig: Record<string, { bg: string; border: string; text: string; label: string; icon: typeof SprayCan }> = {
    CLEAN: { bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', label: 'Clean', icon: CheckCircle },
    DIRTY: { bg: 'bg-yellow-500/[0.06]', border: 'border-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', label: 'Dirty', icon: SprayCan },
    IN_PROGRESS: { bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/15', text: 'text-blue-600 dark:text-blue-400', label: 'In Progress', icon: SprayCan },
    INSPECTED: { bg: 'bg-violet-500/[0.06]', border: 'border-violet-500/15', text: 'text-violet-600 dark:text-violet-400', label: 'Inspected', icon: Eye },
};

export default function HousekeepingPage() {
    const queryClient = useQueryClient();

    const { data: boardData, isLoading } = useQuery({
        queryKey: ['hk-board'],
        queryFn: roomsApi.getBoard,
        refetchInterval: 10000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, housekeepingStatus }: { id: string; housekeepingStatus: string }) =>
            api.put<Room>(`/rooms/${id}`, { housekeepingStatus }),
        onSuccess: (room) => {
            toast.success(`Room ${room.roomNumber} → ${room.housekeepingStatus}`);
            queryClient.invalidateQueries({ queryKey: ['hk-board'] });
        },
        onError: () => toast.error('Update failed'),
    });

    // Count HK statuses across all rooms
    const allRooms = boardData ? Object.values(boardData.floors).flat() as Room[] : [];
    const hkCounts = {
        CLEAN: allRooms.filter((r) => r.housekeepingStatus === 'CLEAN').length,
        DIRTY: allRooms.filter((r) => r.housekeepingStatus === 'DIRTY').length,
        IN_PROGRESS: allRooms.filter((r) => r.housekeepingStatus === 'IN_PROGRESS').length,
        INSPECTED: allRooms.filter((r) => r.housekeepingStatus === 'INSPECTED').length,
    };

    return (
        <>
            <Header title="Housekeeping" />
            <div className="p-6 lg:p-8">
                {/* Summary bar */}
                <div className="flex items-center gap-3 mb-6">
                    {Object.entries(hkConfig).map(([status, config]) => (
                        <div key={status} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${config.bg} ${config.border}`}>
                            <config.icon className={`w-3.5 h-3.5 ${config.text}`} />
                            <span className={`text-lg font-bold ${config.text}`}>{hkCounts[status as keyof typeof hkCounts] || 0}</span>
                            <span className="text-[10px] text-pms-text-faint uppercase tracking-wider">{config.label}</span>
                        </div>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5 text-[10px] text-white/25">
                        <AlertCircle className="w-3 h-3" />
                        Click action buttons to update status
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {boardData && Object.entries(boardData.floors)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([floor, rooms]) => (
                                <div key={floor}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="text-xs font-semibold text-white/25 uppercase tracking-widest">Floor {floor}</div>
                                        <div className="flex-1 h-px bg-pms-surface-hover" />
                                        <span className="text-[10px] text-white/20">
                                            {(rooms as Room[]).filter((r) => r.housekeepingStatus === 'DIRTY').length} dirty
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                        {(rooms as Room[]).map((room, i) => {
                                            const hk = hkConfig[room.housekeepingStatus] || hkConfig.DIRTY;
                                            const isOccupied = room.status === 'OCCUPIED';
                                            return (
                                                <motion.div
                                                    key={room.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.015 }}
                                                    className={`relative p-4 rounded-2xl border transition-all ${hk.bg} ${hk.border}`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span className="text-base font-bold text-pms-text">{room.roomNumber}</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${hk.text}`}>{hk.label}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <span className="text-[10px] text-pms-text-faint">{room.roomType}</span>
                                                        {isOccupied && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">OCC</span>}
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div className="flex gap-1.5">
                                                        {room.housekeepingStatus === 'DIRTY' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateMutation.mutate({ id: room.id, housekeepingStatus: 'IN_PROGRESS' })}
                                                                    className="flex-1 py-1.5 text-[9px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg border border-blue-500/20 transition-all"
                                                                >
                                                                    Start
                                                                </button>
                                                                <button
                                                                    onClick={() => updateMutation.mutate({ id: room.id, housekeepingStatus: 'CLEAN' })}
                                                                    className="flex-1 py-1.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-all"
                                                                >
                                                                    Clean
                                                                </button>
                                                            </>
                                                        )}
                                                        {room.housekeepingStatus === 'IN_PROGRESS' && (
                                                            <button
                                                                onClick={() => updateMutation.mutate({ id: room.id, housekeepingStatus: 'CLEAN' })}
                                                                className="flex-1 py-1.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <Sparkles className="w-3 h-3" /> Done
                                                            </button>
                                                        )}
                                                        {room.housekeepingStatus === 'CLEAN' && (
                                                            <button
                                                                onClick={() => updateMutation.mutate({ id: room.id, housekeepingStatus: 'INSPECTED' })}
                                                                className="flex-1 py-1.5 text-[9px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 rounded-lg border border-violet-500/20 transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <Eye className="w-3 h-3" /> Inspect
                                                            </button>
                                                        )}
                                                        {room.housekeepingStatus === 'INSPECTED' && (
                                                            <span className="flex-1 py-1.5 text-[9px] font-semibold text-violet-600 dark:text-violet-400/50 text-center">
                                                                ✓ Ready
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </>
    );
}
