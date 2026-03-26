'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keysApi, reservationsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { KeyRound, Shield, AlertTriangle, Check, X, Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Reservation, ValidationResult } from '@/types';

export default function KeysPage() {
    const queryClient = useQueryClient();
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState('');
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

    const { data: keys, isLoading } = useQuery({
        queryKey: ['keys'],
        queryFn: () => keysApi.getAll(),
        refetchInterval: 10000,
    });

    const { data: checkedInReservations } = useQuery({
        queryKey: ['checked-in-reservations'],
        queryFn: () => reservationsApi.getAll({ status: 'CHECKED_IN' }),
        enabled: issueDialogOpen,
    });

    const issueMutation = useMutation({
        mutationFn: (data: { reservationId: string; roomId: string; guestId: string }) =>
            keysApi.issue(data),
        onSuccess: (data) => {
            setValidationResult(data.validation);
            toast.success('Key issued successfully: ' + data.key.keyCode);
            queryClient.invalidateQueries({ queryKey: ['keys'] });
            setIssueDialogOpen(false);
        },
        onError: (err: any) => {
            if (err?.validation) {
                setValidationResult(err.validation);
                toast.error('Key issuance blocked - validation failed');
            } else {
                toast.error(err?.message || 'Failed to issue key');
            }
        },
    });

    const revokeMutation = useMutation({
        mutationFn: (id: string) => keysApi.revoke(id),
        onSuccess: () => {
            toast.success('Key revoked');
            queryClient.invalidateQueries({ queryKey: ['keys'] });
        },
        onError: () => toast.error('Failed to revoke key'),
    });

    const selectedRes = checkedInReservations?.find((r: Reservation) => r.id === selectedReservationId);

    const handleIssueKey = () => {
        if (!selectedRes || !selectedRes.assignedRoomId) return;
        setValidationResult(null);
        issueMutation.mutate({
            reservationId: selectedRes.id,
            roomId: selectedRes.assignedRoomId,
            guestId: selectedRes.guestId,
        });
    };

    return (
        <>
            <Header title="Key Management" />
            <div className="p-8">
                {/* Action bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-pms-text-muted" />
                        <span className="text-sm text-pms-text-secondary">{keys?.filter((k) => k.status === 'ACTIVE').length || 0} active keys</span>
                    </div>
                    <button
                        onClick={() => { setIssueDialogOpen(true); setValidationResult(null); setSelectedReservationId(''); }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                    >
                        Issue New Key
                    </button>
                </div>

                {/* Keys table */}
                <div className="bg-pms-surface border border-pms-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-pms-border bg-pms-surface">
                        {['Key Code', 'Guest', 'Room', 'Reservation', 'Issued By', 'Status', 'Actions'].map((h) => (
                            <div key={h} className="text-[10px] font-semibold text-pms-text-faint uppercase tracking-wider">{h}</div>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        keys?.map((key, i) => (
                            <motion.div
                                key={key.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-7 gap-4 px-6 py-3.5 border-b border-pms-border/60 hover:bg-pms-surface transition-all items-center"
                            >
                                <span className="text-xs font-mono text-pms-text-secondary">{key.keyCode}</span>
                                <span className="text-xs text-pms-text-secondary">{key.guest?.firstName} {key.guest?.lastName}</span>
                                <span className="text-xs text-pms-text-secondary">{key.room?.roomNumber}</span>
                                <span className="text-[10px] font-mono text-pms-text-muted">{key.reservation?.confirmationNumber}</span>
                                <span className="text-xs text-pms-text-muted">{key.issuedBy?.name}</span>
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${key.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-white/5 text-pms-text-faint'
                                    }`}>{key.status}</span>
                                <div>
                                    {key.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => revokeMutation.mutate(key.id)}
                                            className="px-2 py-1 text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Key Issuance Dialog */}
            <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
                <DialogContent className="bg-pms-dialog border-pms-border text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Issue Key
                        </DialogTitle>
                        <DialogDescription className="text-pms-text-muted">
                            Select a checked-in reservation to issue a key. Validation will run automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <Select value={selectedReservationId} onValueChange={(v) => setSelectedReservationId(v ?? '')}>
                            <SelectTrigger className="bg-pms-surface-hover border-pms-border text-pms-text">
                                <SelectValue placeholder="Select reservation..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a24] border-pms-border">
                                {checkedInReservations?.map((res: Reservation) => (
                                    <SelectItem key={res.id} value={res.id} className="text-pms-text">
                                        {res.confirmationNumber} — {res.guest?.firstName} {res.guest?.lastName} — Room {res.assignedRoom?.roomNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Pre-action summary */}
                        {selectedRes && (
                            <div className="p-4 bg-pms-surface rounded-xl border border-pms-border space-y-2">
                                <p className="text-[10px] text-pms-text-faint uppercase font-semibold">Key Issuance Summary</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div><span className="text-pms-text-muted">Guest: </span><span className="text-pms-text">{selectedRes.guest?.firstName} {selectedRes.guest?.lastName}</span></div>
                                    <div><span className="text-pms-text-muted">Room: </span><span className="text-pms-text">{selectedRes.assignedRoom?.roomNumber || 'N/A'}</span></div>
                                    <div><span className="text-pms-text-muted">Confirmation: </span><span className="text-pms-text font-mono">{selectedRes.confirmationNumber}</span></div>
                                    <div><span className="text-pms-text-muted">VIP: </span><span className="text-pms-text">{selectedRes.isVip ? 'Yes' : 'No'}</span></div>
                                </div>
                            </div>
                        )}

                        {/* Validation result */}
                        {validationResult && !validationResult.valid && (
                            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 space-y-2">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <Ban className="w-4 h-4" />
                                    <p className="text-xs font-semibold">Key Issuance BLOCKED</p>
                                </div>
                                {validationResult.errors.map((err, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs">
                                        <X className="w-3 h-3 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                        <span className="text-red-300">{err.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(validationResult?.warnings?.length ?? 0) > 0 && (
                            <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20 space-y-2">
                                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                    <AlertTriangle className="w-4 h-4" />
                                    <p className="text-xs font-semibold">Warnings</p>
                                </div>
                                {validationResult!.warnings.map((w, i) => (
                                    <div key={i} className="text-xs text-yellow-300">{w.message}</div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleIssueKey}
                            disabled={!selectedReservationId || issueMutation.isPending || (validationResult !== null && !validationResult.valid)}
                            className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {issueMutation.isPending ? 'Issuing...' : (
                                <><KeyRound className="w-4 h-4" /> Issue Key</>
                            )}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
