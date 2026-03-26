import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RoomStatus, HousekeepingStatus } from '../../shared/enums';

@Injectable()
export class RoomsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
    ) { }

    async findAll(query?: { floor?: number; status?: string; type?: string }) {
        return this.prisma.room.findMany({
            where: {
                ...(query?.floor && { floor: query.floor }),
                ...(query?.status && { status: query.status }),
                ...(query?.type && { roomType: query.type }),
            },
            include: {
                currentOccupant: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedReservations: {
                    where: { status: { in: ['RESERVED', 'CHECKED_IN'] } },
                    include: { guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } } },
                },
            },
            orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        });
    }

    async findById(id: string) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                currentOccupant: true,
                assignedReservations: {
                    include: { guest: true },
                    orderBy: { arrivalDate: 'desc' },
                },
                keys: { orderBy: { issuedAt: 'desc' }, take: 10 },
                incidents: { orderBy: { createdAt: 'desc' }, take: 10 },
                connectingRoom: true,
            },
        });
        if (!room) throw new NotFoundException('Room not found');
        return room;
    }

    async findByRoomNumber(roomNumber: string) {
        return this.prisma.room.findUnique({
            where: { roomNumber },
            include: {
                currentOccupant: true,
                assignedReservations: {
                    where: { status: { in: ['RESERVED', 'CHECKED_IN'] } },
                    include: { guest: true },
                },
            },
        });
    }

    async getBoardData() {
        const rooms = await this.prisma.room.findMany({
            include: {
                currentOccupant: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedReservations: {
                    where: { status: { in: ['RESERVED', 'CHECKED_IN'] } },
                    include: { guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } } },
                    take: 1,
                },
            },
            orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        });

        // Group by floor
        const floors: Record<number, typeof rooms> = {};
        rooms.forEach((room) => {
            if (!floors[room.floor]) floors[room.floor] = [];
            floors[room.floor].push(room);
        });

        return { floors, totalRooms: rooms.length, summary: this.getRoomSummary(rooms) };
    }

    private getRoomSummary(rooms: any[]) {
        return {
            total: rooms.length,
            vacantClean: rooms.filter((r) => r.status === RoomStatus.VACANT_CLEAN).length,
            vacantDirty: rooms.filter((r) => r.status === RoomStatus.VACANT_DIRTY).length,
            occupied: rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length,
            outOfOrder: rooms.filter((r) => r.status === RoomStatus.OUT_OF_ORDER).length,
            conflict: rooms.filter((r) => r.status === RoomStatus.CONFLICT).length,
        };
    }

    async updateStatus(id: string, newStatus: string, userId: string, reason?: string) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room) throw new NotFoundException('Room not found');

        const updated = await this.prisma.room.update({
            where: { id },
            data: {
                status: newStatus,
                ...(newStatus === RoomStatus.OUT_OF_ORDER && { outOfOrderReason: reason }),
                ...(newStatus === RoomStatus.VACANT_CLEAN && { outOfOrderReason: null }),
            },
        });

        await this.auditService.log({
            action: 'ROOM_STATUS_CHANGED',
            entityType: 'Room',
            entityId: id,
            userId,
            details: { previousStatus: room.status, newStatus, reason },
        });

        return updated;
    }

    async updateHousekeeping(id: string, newStatus: string, userId: string) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room) throw new NotFoundException('Room not found');

        const data: any = { housekeepingStatus: newStatus };

        if (newStatus === HousekeepingStatus.INSPECTED) {
            data.inspectedAt = new Date();
        }

        // Auto-update room status if housekeeping is done
        if (newStatus === HousekeepingStatus.CLEAN && room.status === RoomStatus.VACANT_DIRTY) {
            data.status = RoomStatus.VACANT_CLEAN;
        }

        const updated = await this.prisma.room.update({ where: { id }, data });

        await this.auditService.log({
            action: 'ROOM_STATUS_CHANGED',
            entityType: 'Room',
            entityId: id,
            userId,
            details: { housekeepingStatus: newStatus },
        });

        return updated;
    }

    async getAvailableRooms(arrivalDate: Date, departureDate: Date, roomType?: string) {
        return this.prisma.room.findMany({
            where: {
                status: { in: [RoomStatus.VACANT_CLEAN] },
                ...(roomType && { roomType }),
                assignedReservations: {
                    none: {
                        status: { in: ['RESERVED', 'CHECKED_IN'] },
                        arrivalDate: { lt: departureDate },
                        departureDate: { gt: arrivalDate },
                    },
                },
            },
            orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        });
    }
}
