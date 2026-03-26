import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    ValidationResult,
    ValidationError,
    ValidationWarning,
    RoomStatus,
    HousekeepingStatus,
    Severity,
    ReservationStatus,
} from '../../shared/enums';

@Injectable()
export class ValidationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Validate room assignment: checks room mismatch, occupancy conflict,
     * room readiness, and connecting room completeness.
     */
    async validateRoomAssignment(
        reservationId: string,
        roomId: string,
    ): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { guest: true },
        });
        if (!reservation) {
            errors.push({
                code: 'RESERVATION_NOT_FOUND',
                message: 'Reservation does not exist',
                severity: Severity.CRITICAL,
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
                severity: Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }

        // Rule 1: Room mismatch - if reservation already has an assigned room and it's different
        if (reservation.assignedRoomId && reservation.assignedRoomId !== roomId) {
            errors.push({
                code: 'ROOM_MISMATCH',
                message: `Room mismatch: reservation is assigned to a different room. Expected room ID: ${reservation.assignedRoomId}, got: ${roomId}`,
                severity: Severity.HIGH,
                context: { expectedRoomId: reservation.assignedRoomId, actualRoomId: roomId },
            });
        }

        // Rule 2: Block occupied room assignment
        if (room.status === RoomStatus.OCCUPIED) {
            if (room.currentOccupantId && room.currentOccupantId !== reservation.guestId) {
                errors.push({
                    code: 'ROOM_OCCUPANCY_CONFLICT',
                    message: `Room ${room.roomNumber} is currently occupied by another guest`,
                    severity: Severity.CRITICAL,
                    context: { roomNumber: room.roomNumber, currentOccupantId: room.currentOccupantId },
                });
            }
        }

        // Rule 4: Block unsafe room assignment
        if (room.status === RoomStatus.OUT_OF_ORDER) {
            errors.push({
                code: 'ROOM_OUT_OF_ORDER',
                message: `Room ${room.roomNumber} is out of order: ${room.outOfOrderReason || 'unknown reason'}`,
                severity: Severity.HIGH,
                context: { roomNumber: room.roomNumber, reason: room.outOfOrderReason },
            });
        }

        if (room.status === RoomStatus.VACANT_DIRTY) {
            errors.push({
                code: 'ROOM_NOT_READY',
                message: `Room ${room.roomNumber} is vacant but not clean. Housekeeping status: ${room.housekeepingStatus}`,
                severity: Severity.MEDIUM,
                context: { roomNumber: room.roomNumber, housekeepingStatus: room.housekeepingStatus },
            });
        }

        if (room.status === RoomStatus.CONFLICT) {
            errors.push({
                code: 'ROOM_IN_CONFLICT',
                message: `Room ${room.roomNumber} is in conflict state and must be resolved first`,
                severity: Severity.CRITICAL,
                context: { roomNumber: room.roomNumber },
            });
        }

        // Rule 3: Connecting rooms readiness
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
                } else if (cr.assignedRoom && cr.assignedRoom.status !== RoomStatus.VACANT_CLEAN) {
                    errors.push({
                        code: 'CONNECTING_ROOM_NOT_READY',
                        message: `Connecting room ${cr.assignedRoom.roomNumber} is not ready (status: ${cr.assignedRoom.status})`,
                        severity: Severity.HIGH,
                        context: { connectingRoomNumber: cr.assignedRoom.roomNumber, status: cr.assignedRoom.status },
                    });
                }
            }
        }

        // Rule 7: VIP protection
        if (reservation.isVip || reservation.guest?.vipStatus) {
            if (room.housekeepingStatus !== HousekeepingStatus.INSPECTED && room.housekeepingStatus !== HousekeepingStatus.CLEAN) {
                warnings.push({
                    code: 'VIP_ROOM_NOT_INSPECTED',
                    message: `VIP guest: Room ${room.roomNumber} has not been inspected (status: ${room.housekeepingStatus})`,
                    context: { roomNumber: room.roomNumber, housekeepingStatus: room.housekeepingStatus },
                });
            }
        }

        return { valid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate check-in: ensures reservation status, room assignment, room readiness, VIP risks.
     */
    async validateCheckIn(reservationId: string): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { guest: true, assignedRoom: true },
        });

        if (!reservation) {
            errors.push({
                code: 'RESERVATION_NOT_FOUND',
                message: 'Reservation does not exist',
                severity: Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }

        if (reservation.status !== ReservationStatus.RESERVED) {
            errors.push({
                code: 'INVALID_RESERVATION_STATUS',
                message: `Cannot check in: reservation status is ${reservation.status}, expected RESERVED`,
                severity: Severity.HIGH,
                context: { currentStatus: reservation.status },
            });
        }

        if (!reservation.assignedRoomId || !reservation.assignedRoom) {
            errors.push({
                code: 'NO_ROOM_ASSIGNED',
                message: 'Cannot check in: no room assigned to reservation',
                severity: Severity.HIGH,
            });
            return { valid: errors.length === 0, errors, warnings };
        }

        const room = reservation.assignedRoom;

        if (room.status === RoomStatus.OCCUPIED && room.currentOccupantId !== reservation.guestId) {
            errors.push({
                code: 'ROOM_OCCUPANCY_CONFLICT',
                message: `Room ${room.roomNumber} is occupied by another guest`,
                severity: Severity.CRITICAL,
                context: { roomNumber: room.roomNumber },
            });
        }

        if (room.status === RoomStatus.OUT_OF_ORDER) {
            errors.push({
                code: 'ROOM_OUT_OF_ORDER',
                message: `Room ${room.roomNumber} is out of order`,
                severity: Severity.HIGH,
                context: { roomNumber: room.roomNumber, reason: room.outOfOrderReason },
            });
        }

        if (room.status === RoomStatus.VACANT_DIRTY) {
            errors.push({
                code: 'ROOM_NOT_READY',
                message: `Room ${room.roomNumber} is not ready (dirty)`,
                severity: Severity.MEDIUM,
                context: { roomNumber: room.roomNumber },
            });
        }

        // VIP checks
        if (reservation.isVip || reservation.guest?.vipStatus) {
            if (room.housekeepingStatus !== HousekeepingStatus.INSPECTED) {
                warnings.push({
                    code: 'VIP_ROOM_NOT_INSPECTED',
                    message: `VIP guest: Room ${room.roomNumber} has not been inspected`,
                    context: { roomNumber: room.roomNumber },
                });
            }
        }

        // Connecting rooms check
        if (reservation.isConnecting && reservation.connectingGroupId) {
            const connectingReservations = await this.prisma.reservation.findMany({
                where: {
                    connectingGroupId: reservation.connectingGroupId,
                    id: { not: reservationId },
                },
                include: { assignedRoom: true },
            });

            for (const cr of connectingReservations) {
                if (!cr.assignedRoom || cr.assignedRoom.status !== RoomStatus.VACANT_CLEAN) {
                    errors.push({
                        code: 'CONNECTING_ROOM_NOT_READY',
                        message: `Connecting room for reservation ${cr.confirmationNumber} is not ready`,
                        severity: Severity.HIGH,
                    });
                }
            }
        }

        return { valid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate key issuance: most comprehensive validation.
     * Checks reservation, guest, room consistency, all readiness rules.
     */
    async validateKeyIssuance(
        reservationId: string,
        roomId: string,
        guestId: string,
    ): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { guest: true, assignedRoom: true },
        });

        if (!reservation) {
            errors.push({
                code: 'RESERVATION_NOT_FOUND',
                message: 'Reservation does not exist',
                severity: Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }

        // Verify guest-reservation consistency
        if (reservation.guestId !== guestId) {
            errors.push({
                code: 'GUEST_MISMATCH',
                message: 'Guest ID does not match the reservation guest',
                severity: Severity.CRITICAL,
                context: { expectedGuestId: reservation.guestId, providedGuestId: guestId },
            });
        }

        // Verify room-reservation consistency
        if (reservation.assignedRoomId !== roomId) {
            errors.push({
                code: 'ROOM_MISMATCH',
                message: 'Room does not match the reservation assigned room',
                severity: Severity.CRITICAL,
                context: { expectedRoomId: reservation.assignedRoomId, providedRoomId: roomId },
            });
        }

        // Verify reservation is checked in
        if (reservation.status !== ReservationStatus.CHECKED_IN) {
            errors.push({
                code: 'INVALID_RESERVATION_STATUS',
                message: `Cannot issue key: reservation status is ${reservation.status}, must be CHECKED_IN`,
                severity: Severity.HIGH,
                context: { currentStatus: reservation.status },
            });
        }

        // Verify room
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { currentOccupant: true },
        });

        if (!room) {
            errors.push({
                code: 'ROOM_NOT_FOUND',
                message: 'Room does not exist',
                severity: Severity.CRITICAL,
            });
            return { valid: false, errors, warnings };
        }

        if (room.status === RoomStatus.OUT_OF_ORDER) {
            errors.push({
                code: 'ROOM_OUT_OF_ORDER',
                message: `Room ${room.roomNumber} is out of order`,
                severity: Severity.HIGH,
            });
        }

        if (room.status === RoomStatus.CONFLICT) {
            errors.push({
                code: 'ROOM_IN_CONFLICT',
                message: `Room ${room.roomNumber} is in conflict state`,
                severity: Severity.CRITICAL,
            });
        }

        // Check for existing active keys that might indicate a problem
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
                severity: Severity.CRITICAL,
                context: { activeKeyCount: activeKeys.length },
            });
        }

        // VIP warnings
        if (reservation.isVip || reservation.guest?.vipStatus) {
            if (room.housekeepingStatus !== HousekeepingStatus.INSPECTED) {
                warnings.push({
                    code: 'VIP_ROOM_NOT_INSPECTED',
                    message: `VIP guest: Room ${room.roomNumber} has not been inspected`,
                });
            }
        }

        return { valid: errors.length === 0, errors, warnings };
    }

    /**
     * Validate room status transition
     */
    validateRoomStatusTransition(
        currentStatus: string,
        newStatus: string,
    ): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const validTransitions: Record<string, string[]> = {
            [RoomStatus.VACANT_CLEAN]: [RoomStatus.OCCUPIED, RoomStatus.VACANT_DIRTY, RoomStatus.OUT_OF_ORDER],
            [RoomStatus.VACANT_DIRTY]: [RoomStatus.VACANT_CLEAN, RoomStatus.OUT_OF_ORDER],
            [RoomStatus.OCCUPIED]: [RoomStatus.VACANT_DIRTY, RoomStatus.OUT_OF_ORDER, RoomStatus.CONFLICT],
            [RoomStatus.OUT_OF_ORDER]: [RoomStatus.VACANT_DIRTY, RoomStatus.VACANT_CLEAN],
            [RoomStatus.CONFLICT]: [RoomStatus.VACANT_DIRTY, RoomStatus.VACANT_CLEAN, RoomStatus.OUT_OF_ORDER, RoomStatus.OCCUPIED],
        };

        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            errors.push({
                code: 'INVALID_STATUS_TRANSITION',
                message: `Cannot transition room from ${currentStatus} to ${newStatus}`,
                severity: Severity.HIGH,
                context: { currentStatus, newStatus, allowedTransitions: allowed },
            });
        }

        return { valid: errors.length === 0, errors, warnings };
    }
}
