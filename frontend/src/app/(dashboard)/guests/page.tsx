'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { Users, Crown, Search, Plus, Calendar, Mail, Phone, Hash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import { api } from '@/lib/api';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';

interface GuestWithCount {
    id: string; firstName: string; lastName: string; email?: string; phone?: string;
    idNumber?: string; vipStatus: boolean; notes?: string; createdAt: string;
    _count: { reservations: number };
    reservations: { id: string; confirmationNumber: string; status: string; arrivalDate: string; departureDate: string }[];
}

export default function GuestsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [vipOnly, setVipOnly] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [detailGuest, setDetailGuest] = useState<GuestWithCount | null>(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', idNumber: '', vipStatus: false, notes: '' });

    const { data: guests, isLoading } = useQuery({
        queryKey: ['guests', search, vipOnly],
        queryFn: () => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (vipOnly) params.vip = 'true';
            const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
            return api.get<GuestWithCount[]>(`/guests${qs}`);
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof formData) => api.post<GuestWithCount>('/guests', data),
        onSuccess: () => {
            toast.success('Guest profile created');
            queryClient.invalidateQueries({ queryKey: ['guests'] });
            setAddDialogOpen(false);
            setFormData({ firstName: '', lastName: '', email: '', phone: '', idNumber: '', vipStatus: false, notes: '' });
        },
        onError: () => toast.error('Failed to create guest'),
    });

    return (
        <>
            <Header title="Guest Profiles" />
            <div className="p-6 lg:p-8">
                {/* Action bar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                            type="text"
                            placeholder="Search guests by name, email or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-pms-surface border border-pms-border rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setVipOnly(!vipOnly)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${vipOnly ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-pms-surface border-pms-border text-pms-text-muted hover:text-pms-text-secondary'
                            }`}
                    >
                        <Crown className="w-3.5 h-3.5" /> VIP Only
                    </button>
                    <button
                        onClick={() => setAddDialogOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Guest
                    </button>
                </div>

                {/* Guest list */}
                <div className="bg-pms-surface border border-pms-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-7 gap-4 px-6 py-3 border-b border-pms-border bg-pms-surface">
                        {['Name', 'Email', 'Phone', 'ID Number', 'Stays', 'VIP', 'Actions'].map((h) => (
                            <div key={h} className="text-[10px] font-semibold text-pms-text-faint uppercase tracking-wider">{h}</div>
                        ))}
                    </div>

                    {isLoading ? (
                        <TableSkeleton rows={6} />
                    ) : guests?.length === 0 ? (
                        <p className="text-center py-16 text-white/25 text-sm">No guests found</p>
                    ) : (
                        guests?.map((guest, i) => (
                            <motion.div
                                key={guest.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className="grid grid-cols-7 gap-4 px-6 py-3.5 border-b border-pms-border/60 hover:bg-pms-surface transition-all items-center cursor-pointer"
                                onClick={() => setDetailGuest(guest)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${guest.vipStatus ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30' : 'bg-white/[0.06]'}`}>
                                        {guest.firstName.charAt(0)}{guest.lastName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-pms-text">{guest.firstName} {guest.lastName}</span>
                                </div>
                                <span className="text-xs text-pms-text-muted truncate">{guest.email || '—'}</span>
                                <span className="text-xs text-pms-text-muted">{guest.phone || '—'}</span>
                                <span className="text-xs text-pms-text-faint font-mono">{guest.idNumber || '—'}</span>
                                <span className="text-xs text-pms-text-muted">{guest._count.reservations} reservation{guest._count.reservations !== 1 ? 's' : ''}</span>
                                <div>{guest.vipStatus && <Crown className="w-4 h-4 text-amber-500" />}</div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDetailGuest(guest); }}
                                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-300 font-semibold"
                                >
                                    View Profile
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Guest Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="bg-pms-dialog border-pms-border text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> New Guest Profile
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] text-pms-text-muted uppercase mb-1.5">First Name *</label>
                                <input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full h-9 px-3 bg-pms-surface-hover border border-pms-border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-pms-text-muted uppercase mb-1.5">Last Name *</label>
                                <input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full h-9 px-3 bg-pms-surface-hover border border-pms-border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-pms-text-muted uppercase mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-9 pl-9 pr-3 bg-pms-surface-hover border border-pms-border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] text-pms-text-muted uppercase mb-1.5">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full h-9 pl-9 pr-3 bg-pms-surface-hover border border-pms-border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-pms-text-muted uppercase mb-1.5">ID Number</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} className="w-full h-9 pl-9 pr-3 bg-pms-surface-hover border border-pms-border rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30" />
                                </div>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 py-2 cursor-pointer">
                            <input type="checkbox" checked={formData.vipStatus} onChange={(e) => setFormData({ ...formData, vipStatus: e.target.checked })} className="rounded border-white/20 bg-pms-surface-hover" />
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs text-pms-text-secondary">VIP Guest</span>
                        </label>
                        <button
                            onClick={() => createMutation.mutate(formData)}
                            disabled={!formData.firstName || !formData.lastName || createMutation.isPending}
                            className="w-full h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40 transition-all"
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Guest Profile'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Guest Detail Dialog */}
            <Dialog open={!!detailGuest} onOpenChange={() => setDetailGuest(null)}>
                <DialogContent className="bg-pms-dialog border-pms-border text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${detailGuest?.vipStatus ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                                {detailGuest?.firstName.charAt(0)}{detailGuest?.lastName.charAt(0)}
                            </div>
                            {detailGuest?.firstName} {detailGuest?.lastName}
                            {detailGuest?.vipStatus && <Crown className="w-4 h-4 text-amber-500" />}
                        </DialogTitle>
                    </DialogHeader>
                    {detailGuest && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                {detailGuest.email && (
                                    <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                        <p className="text-[10px] text-pms-text-faint uppercase mb-1">Email</p>
                                        <p className="text-xs text-pms-text-secondary">{detailGuest.email}</p>
                                    </div>
                                )}
                                {detailGuest.phone && (
                                    <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                        <p className="text-[10px] text-pms-text-faint uppercase mb-1">Phone</p>
                                        <p className="text-xs text-pms-text-secondary">{detailGuest.phone}</p>
                                    </div>
                                )}
                                {detailGuest.idNumber && (
                                    <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                        <p className="text-[10px] text-pms-text-faint uppercase mb-1">ID Number</p>
                                        <p className="text-xs text-pms-text-secondary font-mono">{detailGuest.idNumber}</p>
                                    </div>
                                )}
                                <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                    <p className="text-[10px] text-pms-text-faint uppercase mb-1">Total Stays</p>
                                    <p className="text-xs text-pms-text-secondary">{detailGuest._count.reservations}</p>
                                </div>
                            </div>

                            {/* Stay History */}
                            <div>
                                <p className="text-[10px] text-pms-text-faint uppercase font-semibold mb-3 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> Stay History
                                </p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {detailGuest.reservations.map((res) => (
                                        <div key={res.id} className="flex items-center gap-3 px-3 py-2 bg-pms-surface rounded-lg">
                                            <span className="text-[10px] font-mono text-pms-text-muted">{res.confirmationNumber}</span>
                                            <span className="text-[10px] text-pms-text-muted">
                                                {new Date(res.arrivalDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                {' → '}
                                                {new Date(res.departureDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-semibold ${res.status === 'CHECKED_IN' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : res.status === 'CHECKED_OUT' ? 'bg-white/5 text-pms-text-faint'
                                                        : res.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                }`}>{res.status.replace('_', ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
