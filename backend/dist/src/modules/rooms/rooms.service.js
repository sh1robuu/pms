"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const enums_1 = require("../../shared/enums");
let RoomsService = class RoomsService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(query) {
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
    async findById(id) {
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
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return room;
    }
    async findByRoomNumber(roomNumber) {
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
        const floors = {};
        rooms.forEach((room) => {
            if (!floors[room.floor])
                floors[room.floor] = [];
            floors[room.floor].push(room);
        });
        return { floors, totalRooms: rooms.length, summary: this.getRoomSummary(rooms) };
    }
    getRoomSummary(rooms) {
        return {
            total: rooms.length,
            vacantClean: rooms.filter((r) => r.status === enums_1.RoomStatus.VACANT_CLEAN).length,
            vacantDirty: rooms.filter((r) => r.status === enums_1.RoomStatus.VACANT_DIRTY).length,
            occupied: rooms.filter((r) => r.status === enums_1.RoomStatus.OCCUPIED).length,
            outOfOrder: rooms.filter((r) => r.status === enums_1.RoomStatus.OUT_OF_ORDER).length,
            conflict: rooms.filter((r) => r.status === enums_1.RoomStatus.CONFLICT).length,
        };
    }
    async updateStatus(id, newStatus, userId, reason) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const updated = await this.prisma.room.update({
            where: { id },
            data: {
                status: newStatus,
                ...(newStatus === enums_1.RoomStatus.OUT_OF_ORDER && { outOfOrderReason: reason }),
                ...(newStatus === enums_1.RoomStatus.VACANT_CLEAN && { outOfOrderReason: null }),
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
    async updateHousekeeping(id, newStatus, userId) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const data = { housekeepingStatus: newStatus };
        if (newStatus === enums_1.HousekeepingStatus.INSPECTED) {
            data.inspectedAt = new Date();
        }
        if (newStatus === enums_1.HousekeepingStatus.CLEAN && room.status === enums_1.RoomStatus.VACANT_DIRTY) {
            data.status = enums_1.RoomStatus.VACANT_CLEAN;
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
    async getAvailableRooms(arrivalDate, departureDate, roomType) {
        return this.prisma.room.findMany({
            where: {
                status: { in: [enums_1.RoomStatus.VACANT_CLEAN] },
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
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map