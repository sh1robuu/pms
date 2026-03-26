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
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const enums_1 = require("../../shared/enums");
let ValidationService = class ValidationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateRoomAssignment(reservationId, roomId) {
        const errors = [];
        const warnings = [];
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { guest: true },
        });
        if (!reservation) {
            errors.push({
                code: 'RESERVATION_NOT_FOUND',
                message: 'Reservation does not exist',
                severity: enums_1.Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { currentOccupant: true, connectingRoom: true },
        });
        if (!room) {
            errors.push({
                code: 'ROOM_NOT_FOUND',
                message: 'Room does not exist',
                severity: enums_1.Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }
        if (reservation.assignedRoomId && reservation.assignedRoomId !== roomId) {
            errors.push({
                code: 'ROOM_MISMATCH',
                message: `Room mismatch: reservation is assigned to a different room. Expected room ID: ${reservation.assignedRoomId}, got: ${roomId}`,
                severity: enums_1.Severity.HIGH,
                context: { expectedRoomId: reservation.assignedRoomId, actualRoomId: roomId },
            });
        }
        if (room.status === enums_1.RoomStatus.OCCUPIED) {
            if (room.currentOccupantId && room.currentOccupantId !== reservation.guestId) {
                errors.push({
                    code: 'ROOM_OCCUPANCY_CONFLICT',
                    message: `Room ${room.roomNumber} is currently occupied by another guest`,
                    severity: enums_1.Severity.CRITICAL,
                    context: { roomNumber: room.roomNumber, currentOccupantId: room.currentOccupantId },
                });
            }
        }
        if (room.status === enums_1.RoomStatus.OUT_OF_ORDER) {
            errors.push({
                code: 'ROOM_OUT_OF_ORDER',
                message: `Room ${room.roomNumber} is out of order: ${room.outOfOrderReason || 'unknown reason'}`,
                severity: enums_1.Severity.HIGH,
                context: { roomNumber: room.roomNumber, reason: room.outOfOrderReason },
            });
        }
        if (room.status === enums_1.RoomStatus.VACANT_DIRTY) {
            errors.push({
                code: 'ROOM_NOT_READY',
                message: `Room ${room.roomNumber} is vacant but not clean. Housekeeping status: ${room.housekeepingStatus}`,
                severity: enums_1.Severity.MEDIUM,
                context: { roomNumber: room.roomNumber, housekeepingStatus: room.housekeepingStatus },
            });
        }
        if (room.status === enums_1.RoomStatus.CONFLICT) {
            errors.push({
                code: 'ROOM_IN_CONFLICT',
                message: `Room ${room.roomNumber} is in conflict state and must be resolved first`,
                severity: enums_1.Severity.CRITICAL,
                context: { roomNumber: room.roomNumber },
            });
        }
        if (reservation.isConnecting && reservation.connectingGroupId) {
            const connectingReservations = await this.prisma.reservation.findMany({
                where: {
                    connectingGroupId: reservation.connectingGroupId,
                    id: { not: reservationId },
                },
                include: { assignedRoom: true },
            });
            for (const cr of connectingReservations) {
                if (!cr.assignedRoomId) {
                    warnings.push({
                        code: 'CONNECTING_ROOM_NOT_ASSIGNED',
                        message: `Connecting reservation ${cr.confirmationNumber} does not have a room assigned yet`,
                        context: { connectingReservationId: cr.id },
                    });
                }
                else if (cr.assignedRoom && cr.assignedRoom.status !== enums_1.RoomStatus.VACANT_CLEAN) {
                    errors.push({
                        code: 'CONNECTING_ROOM_NOT_READY',
                        message: `Connecting room ${cr.assignedRoom.roomNumber} is not ready (status: ${cr.assignedRoom.status})`,
                        severity: enums_1.Severity.HIGH,
                        context: { connectingRoomNumber: cr.assignedRoom.roomNumber, status: cr.assignedRoom.status },
                    });
                }
            }
        }
        if (reservation.isVip || reservation.guest?.vipStatus) {
            if (room.housekeepingStatus !== enums_1.HousekeepingStatus.INSPECTED && room.housekeepingStatus !== enums_1.HousekeepingStatus.CLEAN) {
                warnings.push({
                    code: 'VIP_ROOM_NOT_INSPECTED',
                    message: `VIP guest: Room ${room.roomNumber} has not been inspected (status: ${room.housekeepingStatus})`,
                    context: { roomNumber: room.roomNumber, housekeepingStatus: room.housekeepingStatus },
                });
            }
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    async validateCheckIn(reservationId) {
        const errors = [];
        const warnings = [];
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { guest: true, assignedRoom: true },
        });
        if (!reservation) {
            errors.push({
                code: 'RESERVATION_NOT_FOUND',
                message: 'Reservation does not exist',
                severity: enums_1.Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }
        if (reservation.status !== enums_1.ReservationStatus.RESERVED) {
            errors.push({
                code: 'INVALID_RESERVATION_STATUS',
                message: `Cannot check in: reservation status is ${reservation.status}, expected RESERVED`,
                severity: enums_1.Severity.HIGH,
                context: { currentStatus: reservation.status },
            });
        }
        if (!reservation.assignedRoomId || !reservation.assignedRoom) {
            errors.push({
                code: 'NO_ROOM_ASSIGNED',
                message: 'Cannot check in: no room assigned to reservation',
                severity: enums_1.Severity.HIGH,
            });
            return { valid: errors.length === 0, errors, warnings };
        }
        const room = reservation.assignedRoom;
        if (room.status === enums_1.RoomStatus.OCCUPIED && room.currentOccupantId !== reservation.guestId) {
            errors.push({
                code: 'ROOM_OCCUPANCY_CONFLICT',
                message: `Room ${room.roomNumber} is occupied by another guest`,
                severity: enums_1.Severity.CRITICAL,
                context: { roomNumber: room.roomNumber },
            });
        }
        if (room.status === enums_1.RoomStatus.OUT_OF_ORDER) {
            errors.push({
                code: 'ROOM_OUT_OF_ORDER',
                message: `Room ${room.roomNumber} is out of order`,
                severity: enums_1.Severity.HIGH,
                context: { roomNumber: room.roomNumber, reason: room.outOfOrderReason },
            });
        }
        if (room.status === enums_1.RoomStatus.VACANT_DIRTY) {
            errors.push({
                code: 'ROOM_NOT_READY',
                message: `Room ${room.roomNumber} is not ready (dirty)`,
                severity: enums_1.Severity.MEDIUM,
                context: { roomNumber: room.roomNumber },
            });
        }
        if (reservation.isVip || reservation.guest?.vipStatus) {
            if (room.housekeepingStatus !== enums_1.HousekeepingStatus.INSPECTED) {
                warnings.push({
                    code: 'VIP_ROOM_NOT_INSPECTED',
                    message: `VIP guest: Room ${room.roomNumber} has not been inspected`,
                    context: { roomNumber: room.roomNumber },
                });
            }
        }
        if (reservation.isConnecting && reservation.connectingGroupId) {
            const connectingReservations = await this.prisma.reservation.findMany({
                where: {
                    connectingGroupId: reservation.connectingGroupId,
                    id: { not: reservationId },
                },
                include: { assignedRoom: true },
            });
            for (const cr of connectingReservations) {
                if (!cr.assignedRoom || cr.assignedRoom.status !== enums_1.RoomStatus.VACANT_CLEAN) {
                    errors.push({
                        code: 'CONNECTING_ROOM_NOT_READY',
                        message: `Connecting room for reservation ${cr.confirmationNumber} is not ready`,
                        severity: enums_1.Severity.HIGH,
                    });
                }
            }
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    async validateKeyIssuance(reservationId, roomId, guestId) {
        const errors = [];
        const warnings = [];
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { guest: true, assignedRoom: true },
        });
        if (!reservation) {
            errors.push({
                code: 'RESERVATION_NOT_FOUND',
                message: 'Reservation does not exist',
                severity: enums_1.Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }
        if (reservation.guestId !== guestId) {
            errors.push({
                code: 'GUEST_MISMATCH',
                message: 'Guest ID does not match the reservation guest',
                severity: enums_1.Severity.CRITICAL,
                context: { expectedGuestId: reservation.guestId, providedGuestId: guestId },
            });
        }
        if (reservation.assignedRoomId !== roomId) {
            errors.push({
                code: 'ROOM_MISMATCH',
                message: 'Room does not match the reservation assigned room',
                severity: enums_1.Severity.CRITICAL,
                context: { expectedRoomId: reservation.assignedRoomId, providedRoomId: roomId },
            });
        }
        if (reservation.status !== enums_1.ReservationStatus.CHECKED_IN) {
            errors.push({
                code: 'INVALID_RESERVATION_STATUS',
                message: `Cannot issue key: reservation status is ${reservation.status}, must be CHECKED_IN`,
                severity: enums_1.Severity.HIGH,
                context: { currentStatus: reservation.status },
            });
        }
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { currentOccupant: true },
        });
        if (!room) {
            errors.push({
                code: 'ROOM_NOT_FOUND',
                message: 'Room does not exist',
                severity: enums_1.Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }
        if (room.status === enums_1.RoomStatus.OUT_OF_ORDER) {
            errors.push({
                code: 'ROOM_OUT_OF_ORDER',
                message: `Room ${room.roomNumber} is out of order`,
                severity: enums_1.Severity.HIGH,
            });
        }
        if (room.status === enums_1.RoomStatus.CONFLICT) {
            errors.push({
                code: 'ROOM_IN_CONFLICT',
                message: `Room ${room.roomNumber} is in conflict state`,
                severity: enums_1.Severity.CRITICAL,
            });
        }
        const activeKeys = await this.prisma.key.findMany({
            where: {
                roomId,
                status: 'ACTIVE',
                reservationId: { not: reservationId },
            },
        });
        if (activeKeys.length > 0) {
            errors.push({
                code: 'KEY_CONFLICT',
                message: `Room ${room.roomNumber} has ${activeKeys.length} active key(s) from other reservations`,
                severity: enums_1.Severity.CRITICAL,
                context: { activeKeyCount: activeKeys.length },
            });
        }
        if (reservation.isVip || reservation.guest?.vipStatus) {
            if (room.housekeepingStatus !== enums_1.HousekeepingStatus.INSPECTED) {
                warnings.push({
                    code: 'VIP_ROOM_NOT_INSPECTED',
                    message: `VIP guest: Room ${room.roomNumber} has not been inspected`,
                });
            }
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    validateRoomStatusTransition(currentStatus, newStatus) {
        const errors = [];
        const warnings = [];
        const validTransitions = {
            [enums_1.RoomStatus.VACANT_CLEAN]: [enums_1.RoomStatus.OCCUPIED, enums_1.RoomStatus.VACANT_DIRTY, enums_1.RoomStatus.OUT_OF_ORDER],
            [enums_1.RoomStatus.VACANT_DIRTY]: [enums_1.RoomStatus.VACANT_CLEAN, enums_1.RoomStatus.OUT_OF_ORDER],
            [enums_1.RoomStatus.OCCUPIED]: [enums_1.RoomStatus.VACANT_DIRTY, enums_1.RoomStatus.OUT_OF_ORDER, enums_1.RoomStatus.CONFLICT],
            [enums_1.RoomStatus.OUT_OF_ORDER]: [enums_1.RoomStatus.VACANT_DIRTY, enums_1.RoomStatus.VACANT_CLEAN],
            [enums_1.RoomStatus.CONFLICT]: [enums_1.RoomStatus.VACANT_DIRTY, enums_1.RoomStatus.VACANT_CLEAN, enums_1.RoomStatus.OUT_OF_ORDER, enums_1.RoomStatus.OCCUPIED],
        };
        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            errors.push({
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot transition room from ${currentStatus} to ${newStatus}`,
                severity: enums_1.Severity.HIGH,
                context: { currentStatus, newStatus, allowedTransitions: allowed },
            });
        }
        return { valid: errors.length === 0, errors, warnings };
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ValidationService);
//# sourceMappingURL=validation.service.js.map