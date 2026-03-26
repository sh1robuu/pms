'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { Crown, LogOut, BedDouble, Clock, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Reservation } from '@/types';

export default function DeparturesPage() {
    const queryClient = useQueryClient();
    const [confirmDialog, setConfirmDialog] = useState<Reservation | null>(null);

    const { data: departures, isLoading } = useQuery({
        queryKey: ['departures'],
        queryFn: () => reservationsApi.getDepartures(),
        refetchInterval: 15000,
    });

    const checkOutMutation = useMutation({
        mutationFn: (id: string) => reservationsApi.checkOut(id),
        onSuccess: () => {
            toast.success('Guest checked out — keys revoked, room set to dirty');
            queryClient.invalidateQueries({ queryKey: ['departures'] });
            setConfirmDialog(null);
        },
        onError: (err: any) => toast.error(err?.message || 'Check-out failed'),
    });

    // Check for late departures (past 11 AM)
    const isLateCheckout = (departureDate: string) => {
        const dep = new Date(departureDate);
        const now = new Date();
        return dep.toDateString() === now.toDateString() && now.getHours() >= 11;
    };

    return (
        <>
            <Header title="Departures" />
            <div className="p-6 lg:p-8">
                {/* Summary bar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-pms-surface rounded-xl border border-pms-border">
                        <span className="text-lg font-bold text-violet-600 dark:text-violet-400">{departures?.length || 0}</span>
                        <span className="text-[10px] text-pms-text-faint uppercase tracking-wider">Due Today</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/[0.05] rounded-xl border border-orange-500/10">
                        <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <span className="text-[10px] text-orange-600 dark:text-orange-400/80 uppercase tracking-wider">
                            {departures?.filter((d) => isLateCheckout(d.departureDate)).length || 0} Late
                        </span>
                    </div>
                </div>

                <div className="bg-pms-surface border border-pms-border rounded-2xl overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-pms-border bg-pms-surface">
                        {['Guest', 'Confirmation', 'Room', 'Departure', 'Stay Duration', 'Status', 'Actions'].map((h) => (
                            <div key={h} className="text-[10px] font-semibold text-pms-text-faint uppercase tracking-wider">{h}</div>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : departures?.length === 0 ? (
                        <div className="text-center py-20 text-pms-text-faint text-sm">No departures today</div>
                    ) : (
                        departures?.map((res, i) => {
                            const late = isLateCheckout(res.departureDate);
                            const nights = Math.ceil((new Date(res.departureDate).getTime() - new Date(res.arrivalDate).getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <motion.div
                                    key={res.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={`grid grid-cols-7 gap-4 px-6 py-4 border-b border-pms-border/60 hover:bg-pms-surface transition-all items-center ${late ? 'bg-orange-500/[0.02]' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-pms-text">
                                            {res.guest?.firstName} {res.guest?.lastName}
                                        </span>
                                        {res.isVip && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                    </div>
                                    <span className="text-xs text-pms-text-muted font-mono">{res.confirmationNumber}</span>
                                    <div className="flex items-center gap-1.5">
                                        <BedDouble className="w-3.5 h-3.5 text-pms-text-faint" />
                                        <span className="text-sm font-medium text-pms-text">{res.assignedRoom?.roomNumber || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-pms-text-muted">
                                            {new Date(res.departureDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                        {late && (
                                            <span className="flex items-center gap-1 text-[9px] text-orange-600 dark:text-orange-400 font-semibold">
                                                <AlertTriangle className="w-3 h-3" /> LATE
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-pms-text-muted">{nights} night{nights !== 1 ? 's' : ''}</span>
                                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        CHECKED IN
                                    </span>
                                    <button
                                        onClick={() => setConfirmDialog(res)}
                                        className="px-3 py-1.5 text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 rounded-lg border border-violet-500/20 transition-all flex items-center gap-1.5 w-fit"
                                    >
                                        <LogOut className="w-3 h-3" /> Check Out
                                    </button>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Checkout Confirmation Dialog */}
            <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
                <DialogContent className="bg-pms-dialog border-pms-border text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Check-Out</DialogTitle>
                        <DialogDescription className="text-pms-text-muted">
                            This will check out the guest, revoke all active keys, and set the room to dirty.
                        </DialogDescription>
                    </DialogHeader>
                    {confirmDialog && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                    <p className="text-[10px] text-pms-text-faint uppercase mb-1">Guest</p>
                                    <p className="text-sm font-medium text-pms-text">{confirmDialog.guest?.firstName} {confirmDialog.guest?.lastName}</p>
                                </div>
                                <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                    <p className="text-[10px] text-pms-text-faint uppercase mb-1">Room</p>
                                    <p className="text-sm font-medium text-pms-text">{confirmDialog.assignedRoom?.roomNumber || '—'}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-500/[0.05] rounded-xl border border-yellow-500/10">
                                <p className="text-[10px] text-yellow-600 dark:text-yellow-400/80">⚠ All active keys for this reservation will be automatically revoked.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDialog(null)}
                                    className="flex-1 h-10 bg-pms-surface-hover hover:bg-pms-surface-hover text-pms-text-secondary text-sm font-medium rounded-xl border border-pms-border transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => checkOutMutation.mutate(confirmDialog.id)}
                                    disabled={checkOutMutation.isPending}
                                    className="flex-1 h-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 transition-all"
                                >
                                    {checkOutMutation.isPending ? 'Processing...' : 'Confirm Check-Out'}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
