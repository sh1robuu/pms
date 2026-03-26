import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { IncidentsService } from '../incidents/incidents.service';
import { AlertsService } from '../alerts/alerts.service';
import { AlertsGateway } from '../alerts/alerts.gateway';
import { AuditService } from '../audit/audit.service';
import { ReservationStatus, RoomStatus, IncidentType, Severity } from '../../shared/enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationsService {
    constructor(
        private prisma: PrismaService,
        private validationService: ValidationService,
        private incidentsService: IncidentsService,
        private alertsService: AlertsService,
        private alertsGateway: AlertsGateway,
        private auditService: AuditService,
    ) { }

    async findAll(query?: { status?: string; guestId?: string; date?: string }) {
        const today = query?.date ? new Date(query.date) : new Date();
        return this.prisma.reservation.findMany({
            where: {
                ...(query?.status && { status: query.status }),
                ...(query?.guestId && { guestId: query.guestId }),
            },
            include: {
                guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true, email: true, phone: true } },
                assignedRoom: { select: { id: true, roomNumber: true, roomType: true, floor: true, status: true, housekeepingStatus: true } },
            },
            orderBy: { arrivalDate: 'asc' },
        });
    }

    async findById(id: string) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: {
                guest: true,
                assignedRoom: {
                    include: { connectingRoom: true },
                },
                keys: {
                    include: {
                        issuedBy: { select: { id: true, name: true } },
                        revokedBy: { select: { id: true, name: true } },
                    },
                    orderBy: { issuedAt: 'desc' },
                },
                incidents: { orderBy: { createdAt: 'desc' } },
                alerts: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!reservation) throw new NotFoundException('Reservation not found');
        return reservation;
    }

    async getArrivals(date?: string) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        return this.prisma.reservation.findMany({
            where: {
                arrivalDate: { gte: startOfDay, lte: endOfDay },
                status: { in: [ReservationStatus.RESERVED, ReservationStatus.CHECKED_IN] },
            },
            include: {
                guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedRoom: { select: { id: true, roomNumber: true, roomType: true, status: true, housekeepingStatus: true } },
            },
            orderBy: { arrivalDate: 'asc' },
        });
    }

    async getDepartures(date?: string) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        return this.prisma.reservation.findMany({
            where: {
                departureDate: { gte: startOfDay, lte: endOfDay },
                status: ReservationStatus.CHECKED_IN,
            },
            include: {
                guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedRoom: { select: { id: true, roomNumber: true, roomType: true } },
            },
            orderBy: { departureDate: 'asc' },
        });
    }

    async create(data: {
        guestId: string;
        arrivalDate: string;
        departureDate: string;
        roomType?: string;
        isVip?: boolean;
        isConnecting?: boolean;
        connectingGroupId?: string;
        notes?: string;
    }, userId: string) {
        const confirmationNumber = `RES-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

        const reservation = await this.prisma.reservation.create({
            data: {
                confirmationNumber,
                guestId: data.guestId,
                arrivalDate: new Date(data.arrivalDate),
                departureDate: new Date(data.departureDate),
                isVip: data.isVip || false,
                isConnecting: data.isConnecting || false,
                connectingGroupId: data.connectingGroupId,
                notes: data.notes,
            },
            include: {
                guest: true,
                assignedRoom: true,
            },
        });

        await this.auditService.log({
            action: 'RESERVATION_CREATED',
            entityType: 'Reservation',
            entityId: reservation.id,
            userId,
            details: { confirmationNumber, guestId: data.guestId },
        });

        return reservation;
    }

    async assignRoom(reservationId: string, roomId: string, userId: string) {
        // Run full validation
        const validation = await this.validationService.validateRoomAssignment(reservationId, roomId);

        if (!validation.valid) {
            // Create incidents for critical errors
            for (const error of validation.errors) {
                if (error.severity === Severity.CRITICAL || error.severity === Severity.HIGH) {
                    const incident = await this.incidentsService.create({
                        type: error.code as any,
                        severity: error.severity,
                        reservationId,
                        roomId,
                        rootCause: error.code,
                        description: error.message,
                    });
                    this.alertsGateway.emitIncident(incident);
                }

                // Create alert
                const alert = await this.alertsService.create({
                    type: error.code,
                    severity: error.severity,
                    message: error.message,
                    roomId,
                    reservationId,
                });
                this.alertsGateway.emitAlert(alert);
            }

            throw new BadRequestException({
                message: 'Room assignment validation failed',
                validation,
            });
        }

        // Perform assignment
        const reservation = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: { assignedRoomId: roomId },
            include: { guest: true, assignedRoom: true },
        });

        await this.auditService.log({
            action: 'ROOM_ASSIGNED',
            entityType: 'Reservation',
            entityId: reservationId,
            userId,
            details: { roomId, roomNumber: reservation.assignedRoom?.roomNumber },
        });

        this.alertsGateway.emitReservationUpdate(reservation);

        // Emit VIP warnings if any
        for (const warning of validation.warnings) {
            const alert = await this.alertsService.create({
                type: warning.code,
                severity: 'MEDIUM',
                message: warning.message,
                roomId,
                reservationId,
            });
            this.alertsGateway.emitAlert(alert);
        }

        return { reservation, validation };
    }

    async checkIn(reservationId: string, userId: string) {
        // Run full validation
        const validation = await this.validationService.validateCheckIn(reservationId);

        if (!validation.valid) {
            for (const error of validation.errors) {
                if (error.severity === Severity.CRITICAL || error.severity === Severity.HIGH) {
                    const incident = await this.incidentsService.create({
                        type: error.code as any,
                        severity: error.severity,
                        reservationId,
                        rootCause: error.code,
                        description: error.message,
                    });
                    this.alertsGateway.emitIncident(incident);
                }

                const alert = await this.alertsService.create({
                    type: error.code,
                    severity: error.severity,
                    message: error.message,
                    reservationId,
                });
                this.alertsGateway.emitAlert(alert);
            }

            throw new BadRequestException({
                message: 'Check-in validation failed',
                validation,
            });
        }

        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { assignedRoom: true },
        });

        // Update reservation status
        const updated = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: ReservationStatus.CHECKED_IN,
                checkedInAt: new Date(),
            },
            include: { guest: true, assignedRoom: true },
        });

        // Update room status to OCCUPIED
        if (reservation?.assignedRoomId) {
            await this.prisma.room.update({
                where: { id: reservation.assignedRoomId },
                data: {
                    status: RoomStatus.OCCUPIED,
                    currentOccupantId: reservation.guestId,
                },
            });
            this.alertsGateway.emitRoomUpdate({ id: reservation.assignedRoomId, status: RoomStatus.OCCUPIED });
        }

        await this.auditService.log({
            action: 'CHECK_IN',
            entityType: 'Reservation',
            entityId: reservationId,
            userId,
            details: { roomId: reservation?.assignedRoomId, guestId: reservation?.guestId },
        });

        this.alertsGateway.emitReservationUpdate(updated);
        return { reservation: updated, validation };
    }

    async checkOut(reservationId: string, userId: string) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { assignedRoom: true, keys: { where: { status: 'ACTIVE' } } },
        });

        if (!reservation) throw new NotFoundException('Reservation not found');
        if (reservation.status !== ReservationStatus.CHECKED_IN) {
            throw new BadRequestException('Reservation is not checked in');
        }

        // Revoke all active keys
        await this.prisma.key.updateMany({
            where: { reservationId, status: 'ACTIVE' },
            data: { status: 'REVOKED', revokedAt: new Date(), revokedById: userId },
        });

        // Update reservation
        const updated = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: ReservationStatus.CHECKED_OUT,
                checkedOutAt: new Date(),
            },
            include: { guest: true, assignedRoom: true },
        });

        // Update room
        if (reservation.assignedRoomId) {
            await this.prisma.room.update({
                where: { id: reservation.assignedRoomId },
                data: {
                    status: RoomStatus.VACANT_DIRTY,
                    currentOccupantId: null,
                    housekeepingStatus: 'DIRTY',
                },
            });
            this.alertsGateway.emitRoomUpdate({ id: reservation.assignedRoomId, status: RoomStatus.VACANT_DIRTY });
        }

        await this.auditService.log({
            action: 'CHECK_OUT',
            entityType: 'Reservation',
            entityId: reservationId,
            userId,
            details: { roomId: reservation.assignedRoomId },
        });

        this.alertsGateway.emitReservationUpdate(updated);
        return updated;
    }

    async cancel(reservationId: string, userId: string) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
        });
        if (!reservation) throw new NotFoundException('Reservation not found');
        if (reservation.status === ReservationStatus.CHECKED_IN) {
            throw new BadRequestException('Cannot cancel a checked-in reservation. Check out first.');
        }

        const updated = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: { status: ReservationStatus.CANCELLED },
            include: { guest: true, assignedRoom: true },
        });

        await this.auditService.log({
            action: 'RESERVATION_CANCELLED',
            entityType: 'Reservation',
            entityId: reservationId,
            userId,
        });

        return updated;
    }
}
