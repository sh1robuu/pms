'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi, roomsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { Crown, Check, BedDouble, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Reservation, Room } from '@/types';

export default function ArrivalsPage() {
    const queryClient = useQueryClient();
    const [assignDialog, setAssignDialog] = useState<Reservation | null>(null);
    const [selectedRoom, setSelectedRoom] = useState('');

    const { data: arrivals, isLoading } = useQuery({
        queryKey: ['arrivals'],
        queryFn: () => reservationsApi.getArrivals(),
        refetchInterval: 15000,
    });

    const { data: rooms } = useQuery({
        queryKey: ['available-rooms'],
        queryFn: () => roomsApi.getAll({ status: 'VACANT_CLEAN' }),
    });

    const assignMutation = useMutation({
        mutationFn: ({ id, roomId }: { id: string; roomId: string }) => reservationsApi.assignRoom(id, roomId),
        onSuccess: () => {
            toast.success('Room assigned successfully');
            queryClient.invalidateQueries({ queryKey: ['arrivals'] });
            setAssignDialog(null);
            setSelectedRoom('');
        },
        onError: (err: any) => toast.error(err?.validation?.errors?.[0]?.message || err?.message || 'Assignment failed'),
    });

    const checkInMutation = useMutation({
        mutationFn: (id: string) => reservationsApi.checkIn(id),
        onSuccess: () => {
            toast.success('Guest checked in');
            queryClient.invalidateQueries({ queryKey: ['arrivals'] });
        },
        onError: (err: any) => toast.error(err?.validation?.errors?.[0]?.message || err?.message || 'Check-in failed'),
    });

    return (
        <>
            <Header title="Arrivals" />
            <div className="p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-pms-surface rounded-xl border border-pms-border">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{arrivals?.length || 0}</span>
                        <span className="text-[10px] text-pms-text-faint uppercase tracking-wider">Today</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/[0.06] rounded-xl border border-amber-500/10">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            {arrivals?.filter((a) => a.isVip).length || 0} VIP
                        </span>
                    </div>
                </div>

                <div className="bg-pms-surface border border-pms-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-pms-border bg-pms-inset">
                        {['Guest', 'Confirmation', 'Room', 'Arrival', 'Nights', 'Status', 'Actions'].map((h) => (
                            <div key={h} className="text-[10px] font-semibold text-pms-text-faint uppercase tracking-wider">{h}</div>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : arrivals?.length === 0 ? (
                        <div className="text-center py-20 text-pms-text-faint text-sm">No arrivals today</div>
                    ) : (
                        arrivals?.map((res, i) => {
                            const nights = Math.ceil((new Date(res.departureDate).getTime() - new Date(res.arrivalDate).getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <motion.div key={res.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-pms-border/60 hover:bg-pms-surface-hover transition-all items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-pms-text">{res.guest?.firstName} {res.guest?.lastName}</span>
                                        {res.isVip && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                    </div>
                                    <span className="text-xs text-pms-text-muted font-mono">{res.confirmationNumber}</span>
                                    <div className="flex items-center gap-1.5">
                                        {res.assignedRoom ? (
                                            <>
                                                <BedDouble className="w-3.5 h-3.5 text-pms-text-faint" />
                                                <span className="text-sm font-medium text-pms-text">{res.assignedRoom.roomNumber}</span>
                                            </>
                                        ) : (
                                            <button onClick={() => { setAssignDialog(res); setSelectedRoom(''); }}
                                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold">+ Assign</button>
                                        )}
                                    </div>
                                    <span className="text-xs text-pms-text-muted">{new Date(res.arrivalDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    <span className="text-xs text-pms-text-muted">{nights}</span>
                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold w-fit ${res.status === 'CHECKED_IN' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                        {res.status === 'CHECKED_IN' ? 'CHECKED IN' : 'RESERVED'}
                                    </span>
                                    <div>
                                        {res.status === 'RESERVED' && res.assignedRoom && (
                                            <button onClick={() => checkInMutation.mutate(res.id)}
                                                disabled={checkInMutation.isPending}
                                                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-all">
                                                <Check className="w-3 h-3" /> Check In
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
                <DialogContent className="bg-pms-dialog border-pms-border text-pms-text max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Room</DialogTitle>
                        <DialogDescription className="text-pms-text-muted">
                            Select a room for {assignDialog?.guest?.firstName} {assignDialog?.guest?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <Select value={selectedRoom} onValueChange={(v: string | null) => { if (v) setSelectedRoom(v); }}>
                            <SelectTrigger className="bg-pms-surface border-pms-border text-pms-text">
                                <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                            <SelectContent className="bg-pms-dialog border-pms-border">
                                {(rooms as Room[])?.map((room) => (
                                    <SelectItem key={room.id} value={room.id} className="text-pms-text">
                                        {room.roomNumber} — {room.roomType} (Floor {room.floor})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-3">
                            <button onClick={() => setAssignDialog(null)}
                                className="flex-1 h-10 bg-pms-surface hover:bg-pms-surface-hover text-pms-text-muted text-sm font-medium rounded-xl border border-pms-border transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={() => assignDialog && selectedRoom && assignMutation.mutate({ id: assignDialog.id, roomId: selectedRoom })}
                                disabled={!selectedRoom || assignMutation.isPending}
                                className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-40 transition-all">
                                {assignMutation.isPending ? 'Assigning...' : 'Assign Room'}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
