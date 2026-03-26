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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const validation_service_1 = require("../validation/validation.service");
const incidents_service_1 = require("../incidents/incidents.service");
const alerts_service_1 = require("../alerts/alerts.service");
const alerts_gateway_1 = require("../alerts/alerts.gateway");
const audit_service_1 = require("../audit/audit.service");
const enums_1 = require("../../shared/enums");
const uuid_1 = require("uuid");
let ReservationsService = class ReservationsService {
    prisma;
    validationService;
    incidentsService;
    alertsService;
    alertsGateway;
    auditService;
    constructor(prisma, validationService, incidentsService, alertsService, alertsGateway, auditService) {
        this.prisma = prisma;
        this.validationService = validationService;
        this.incidentsService = incidentsService;
        this.alertsService = alertsService;
        this.alertsGateway = alertsGateway;
        this.auditService = auditService;
    }
    async findAll(query) {
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
    async findById(id) {
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
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        return reservation;
    }
    async getArrivals(date) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        return this.prisma.reservation.findMany({
            where: {
                arrivalDate: { gte: startOfDay, lte: endOfDay },
                status: { in: [enums_1.ReservationStatus.RESERVED, enums_1.ReservationStatus.CHECKED_IN] },
            },
            include: {
                guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedRoom: { select: { id: true, roomNumber: true, roomType: true, status: true, housekeepingStatus: true } },
            },
            orderBy: { arrivalDate: 'asc' },
        });
    }
    async getDepartures(date) {
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        return this.prisma.reservation.findMany({
            where: {
                departureDate: { gte: startOfDay, lte: endOfDay },
                status: enums_1.ReservationStatus.CHECKED_IN,
            },
            include: {
                guest: { select: { id: true, firstName: true, lastName: true, vipStatus: true } },
                assignedRoom: { select: { id: true, roomNumber: true, roomType: true } },
            },
            orderBy: { departureDate: 'asc' },
        });
    }
    async create(data, userId) {
        const confirmationNumber = `RES-${Date.now().toString(36).toUpperCase()}-${(0, uuid_1.v4)().slice(0, 4).toUpperCase()}`;
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
    async assignRoom(reservationId, roomId, userId) {
        const validation = await this.validationService.validateRoomAssignment(reservationId, roomId);
        if (!validation.valid) {
            for (const error of validation.errors) {
                if (error.severity === enums_1.Severity.CRITICAL || error.severity === enums_1.Severity.HIGH) {
                    const incident = await this.incidentsService.create({
                        type: error.code,
                        severity: error.severity,
                        reservationId,
                        roomId,
                        rootCause: error.code,
                        description: error.message,
                    });
                    this.alertsGateway.emitIncident(incident);
                }
                const alert = await this.alertsService.create({
                    type: error.code,
                    severity: error.severity,
                    message: error.message,
                    roomId,
                    reservationId,
                });
                this.alertsGateway.emitAlert(alert);
            }
            throw new common_1.BadRequestException({
                message: 'Room assignment validation failed',
                validation,
            });
        }
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
    async checkIn(reservationId, userId) {
        const validation = await this.validationService.validateCheckIn(reservationId);
        if (!validation.valid) {
            for (const error of validation.errors) {
                if (error.severity === enums_1.Severity.CRITICAL || error.severity === enums_1.Severity.HIGH) {
                    const incident = await this.incidentsService.create({
                        type: error.code,
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
            throw new common_1.BadRequestException({
                message: 'Check-in validation failed',
                validation,
            });
        }
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { assignedRoom: true },
        });
        const updated = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: enums_1.ReservationStatus.CHECKED_IN,
                checkedInAt: new Date(),
            },
            include: { guest: true, assignedRoom: true },
        });
        if (reservation?.assignedRoomId) {
            await this.prisma.room.update({
                where: { id: reservation.assignedRoomId },
                data: {
                    status: enums_1.RoomStatus.OCCUPIED,
                    currentOccupantId: reservation.guestId,
                },
            });
            this.alertsGateway.emitRoomUpdate({ id: reservation.assignedRoomId, status: enums_1.RoomStatus.OCCUPIED });
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
    async checkOut(reservationId, userId) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { assignedRoom: true, keys: { where: { status: 'ACTIVE' } } },
        });
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        if (reservation.status !== enums_1.ReservationStatus.CHECKED_IN) {
            throw new common_1.BadRequestException('Reservation is not checked in');
        }
        await this.prisma.key.updateMany({
            where: { reservationId, status: 'ACTIVE' },
            data: { status: 'REVOKED', revokedAt: new Date(), revokedById: userId },
        });
        const updated = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: enums_1.ReservationStatus.CHECKED_OUT,
                checkedOutAt: new Date(),
            },
            include: { guest: true, assignedRoom: true },
        });
        if (reservation.assignedRoomId) {
            await this.prisma.room.update({
                where: { id: reservation.assignedRoomId },
                data: {
                    status: enums_1.RoomStatus.VACANT_DIRTY,
                    currentOccupantId: null,
                    housekeepingStatus: 'DIRTY',
                },
            });
            this.alertsGateway.emitRoomUpdate({ id: reservation.assignedRoomId, status: enums_1.RoomStatus.VACANT_DIRTY });
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
    async cancel(reservationId, userId) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
        });
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        if (reservation.status === enums_1.ReservationStatus.CHECKED_IN) {
            throw new common_1.BadRequestException('Cannot cancel a checked-in reservation. Check out first.');
        }
        const updated = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: { status: enums_1.ReservationStatus.CANCELLED },
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        validation_service_1.ValidationService,
        incidents_service_1.IncidentsService,
        alerts_service_1.AlertsService,
        alerts_gateway_1.AlertsGateway,
        audit_service_1.AuditService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map