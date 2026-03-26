'use client';

import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';
import { BedDouble, Crown, User, Wrench } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import type { Room, RoomStatus } from '@/types';

const roomStatusConfig: Record<RoomStatus, { bg: string; border: string; text: string; label: string }> = {
    VACANT_CLEAN: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Clean' },
    VACANT_DIRTY: { bg: 'bg-yellow-500/8', border: 'border-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', label: 'Dirty' },
    OCCUPIED: { bg: 'bg-blue-500/8', border: 'border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', label: 'Occupied' },
    OUT_OF_ORDER: { bg: 'bg-red-500/8', border: 'border-red-500/20', text: 'text-red-600 dark:text-red-400', label: 'OOO' },
    CONFLICT: { bg: 'bg-orange-500/10', border: 'border-orange-500/30 animate-pulse', text: 'text-orange-600 dark:text-orange-400', label: 'Conflict' },
};

export default function RoomsPage() {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data: boardData, isLoading } = useQuery({
        queryKey: ['room-board'],
        queryFn: roomsApi.getBoard,
        refetchInterval: 10000,
    });

    const openDetail = (room: Room) => {
        setSelectedRoom(room);
        setSheetOpen(true);
    };

    return (
        <>
            <Header title="Room Board" />
            <div className="p-8">
                {/* Summary bar */}
                {boardData && (
                    <div className="flex items-center gap-4 mb-6">
                        {Object.entries(roomStatusConfig).map(([status, config]) => {
                            const count = status === 'VACANT_CLEAN' ? boardData.summary.vacantClean
                                : status === 'VACANT_DIRTY' ? boardData.summary.vacantDirty
                                    : status === 'OCCUPIED' ? boardData.summary.occupied
                                        : status === 'OUT_OF_ORDER' ? boardData.summary.outOfOrder
                                            : boardData.summary.conflict;
                            return (
                                <div key={status} className="flex items-center gap-2 px-3 py-1.5 bg-pms-surface rounded-lg border border-pms-border">
                                    <div className={`w-2 h-2 rounded-full ${config.bg.replace('/8', '').replace('/10', '')}`} />
                                    <span className="text-[10px] text-pms-text-muted uppercase tracking-wider">{config.label}</span>
                                    <span className="text-xs font-bold text-pms-text">{count}</span>
                                </div>
                            );
                        })}
                        <div className="ml-auto text-xs text-pms-text-faint">{boardData.totalRooms} rooms total</div>
                    </div>
                )}

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
                                        <div className="text-xs font-semibold text-pms-text-faint uppercase tracking-widest">Floor {floor}</div>
                                        <div className="flex-1 h-px bg-white/[0.06]" />
                                    </div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {(rooms as Room[]).map((room, i) => {
                                            const config = roomStatusConfig[room.status as RoomStatus];
                                            const reservation = room.assignedReservations?.[0];
                                            const guest = reservation?.guest || room.currentOccupant;
                                            return (
                                                <motion.div
                                                    key={room.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    onClick={() => openDetail(room)}
                                                    className={`relative p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all duration-200 ${config.bg} ${config.border}`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <span className="text-lg font-bold text-pms-text">{room.roomNumber}</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${config.text}`}>{config.label}</span>
                                                    </div>
                                                    <div className="text-[10px] text-pms-text-faint mb-2">{room.roomType}</div>
                                                    {guest && (
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="w-3 h-3 text-pms-text-faint" />
                                                            <span className="text-[11px] text-pms-text-muted truncate">
                                                                {guest.firstName} {guest.lastName}
                                                            </span>
                                                            {guest.vipStatus && <Crown className="w-3 h-3 text-amber-500" />}
                                                        </div>
                                                    )}
                                                    {room.outOfOrderReason && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Wrench className="w-3 h-3 text-red-600 dark:text-red-400/60" />
                                                            <span className="text-[10px] text-red-600 dark:text-red-400/60 truncate">{room.outOfOrderReason}</span>
                                                        </div>
                                                    )}
                                                    {room.isConnecting && (
                                                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                            <span className="text-[8px] text-purple-400 font-bold">C</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Room Detail Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="bg-pms-dialog border-pms-border text-white w-[400px]">
                    <SheetHeader>
                        <SheetTitle className="text-white flex items-center gap-2">
                            <BedDouble className="w-5 h-5" />
                            Room {selectedRoom?.roomNumber}
                        </SheetTitle>
                    </SheetHeader>
                    {selectedRoom && (
                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                    <p className="text-[10px] text-pms-text-faint uppercase mb-1">Type</p>
                                    <p className="text-sm font-medium text-pms-text">{selectedRoom.roomType}</p>
                                </div>
                                <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                    <p className="text-[10px] text-pms-text-faint uppercase mb-1">Floor</p>
                                    <p className="text-sm font-medium text-pms-text">{selectedRoom.floor}</p>
                                </div>
                                <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                    <p className="text-[10px] text-pms-text-faint uppercase mb-1">Status</p>
                                    <p className={`text-sm font-medium ${roomStatusConfig[selectedRoom.status as RoomStatus]?.text || 'text-pms-text'}`}>
                                        {selectedRoom.status.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                <div className="p-3 bg-pms-surface rounded-xl border border-pms-border">
                                    <p className="text-[10px] text-pms-text-faint uppercase mb-1">Housekeeping</p>
                                    <p className="text-sm font-medium text-pms-text">{selectedRoom.housekeepingStatus}</p>
                                </div>
                            </div>

                            {selectedRoom.currentOccupant && (
                                <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400/60 uppercase mb-1">Current Occupant</p>
                                    <p className="text-sm font-medium text-white flex items-center gap-2">
                                        {selectedRoom.currentOccupant.firstName} {selectedRoom.currentOccupant.lastName}
                                        {selectedRoom.currentOccupant.vipStatus && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                    </p>
                                </div>
                            )}

                            {selectedRoom.outOfOrderReason && (
                                <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                                    <p className="text-[10px] text-red-600 dark:text-red-400/60 uppercase mb-1">Out of Order Reason</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">{selectedRoom.outOfOrderReason}</p>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
