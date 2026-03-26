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
exports.KeysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const validation_service_1 = require("../validation/validation.service");
const incidents_service_1 = require("../incidents/incidents.service");
const alerts_service_1 = require("../alerts/alerts.service");
const alerts_gateway_1 = require("../alerts/alerts.gateway");
const audit_service_1 = require("../audit/audit.service");
const enums_1 = require("../../shared/enums");
const uuid_1 = require("uuid");
let KeysService = class KeysService {
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
    async issue(data, userId) {
        const validation = await this.validationService.validateKeyIssuance(data.reservationId, data.roomId, data.guestId);
        if (!validation.valid) {
            for (const error of validation.errors) {
                const incident = await this.incidentsService.create({
                    type: enums_1.IncidentType.KEY_MISMATCH,
                    severity: error.severity,
                    reservationId: data.reservationId,
                    roomId: data.roomId,
                    guestId: data.guestId,
                    rootCause: error.code,
                    description: `Key issuance blocked: ${error.message}`,
                });
                this.alertsGateway.emitIncident(incident);
                const alert = await this.alertsService.create({
                    type: 'KEY_MISMATCH_BLOCKED',
                    severity: error.severity,
                    message: `Key issuance blocked: ${error.message}`,
                    roomId: data.roomId,
                    reservationId: data.reservationId,
                });
                this.alertsGateway.emitAlert(alert);
            }
            throw new common_1.BadRequestException({
                message: 'Key issuance validation failed',
                validation,
            });
        }
        const keyCode = `KEY-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
        const key = await this.prisma.key.create({
            data: {
                reservationId: data.reservationId,
                roomId: data.roomId,
                guestId: data.guestId,
                issuedById: userId,
                keyCode,
                status: enums_1.KeyStatus.ACTIVE,
            },
            include: {
                reservation: { select: { id: true, confirmationNumber: true } },
                room: { select: { id: true, roomNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
                issuedBy: { select: { id: true, name: true } },
            },
        });
        await this.auditService.log({
            action: 'KEY_ISSUED',
            entityType: 'Key',
            entityId: key.id,
            userId,
            details: {
                keyCode,
                reservationId: data.reservationId,
                roomId: data.roomId,
                guestId: data.guestId,
            },
        });
        this.alertsGateway.emitKeyEvent({ type: 'ISSUED', key });
        return { key, validation };
    }
    async revoke(keyId, userId) {
        const key = await this.prisma.key.findUnique({ where: { id: keyId } });
        if (!key)
            throw new common_1.NotFoundException('Key not found');
        if (key.status !== enums_1.KeyStatus.ACTIVE) {
            throw new common_1.BadRequestException('Key is not active');
        }
        const revoked = await this.prisma.key.update({
            where: { id: keyId },
            data: {
                status: enums_1.KeyStatus.REVOKED,
                revokedAt: new Date(),
                revokedById: userId,
            },
            include: {
                reservation: { select: { id: true, confirmationNumber: true } },
                room: { select: { id: true, roomNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
                revokedBy: { select: { id: true, name: true } },
            },
        });
        await this.auditService.log({
            action: 'KEY_REVOKED',
            entityType: 'Key',
            entityId: keyId,
            userId,
            details: { keyCode: key.keyCode, reservationId: key.reservationId, roomId: key.roomId },
        });
        this.alertsGateway.emitKeyEvent({ type: 'REVOKED', key: revoked });
        return revoked;
    }
    async findByReservation(reservationId) {
        return this.prisma.key.findMany({
            where: { reservationId },
            include: {
                room: { select: { id: true, roomNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
                issuedBy: { select: { id: true, name: true } },
                revokedBy: { select: { id: true, name: true } },
            },
            orderBy: { issuedAt: 'desc' },
        });
    }
    async findAll(query) {
        return this.prisma.key.findMany({
            where: {
                ...(query?.status && { status: query.status }),
            },
            include: {
                reservation: { select: { id: true, confirmationNumber: true } },
                room: { select: { id: true, roomNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
                issuedBy: { select: { id: true, name: true } },
            },
            orderBy: { issuedAt: 'desc' },
            take: query?.limit || 50,
        });
    }
};
exports.KeysService = KeysService;
exports.KeysService = KeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        validation_service_1.ValidationService,
        incidents_service_1.IncidentsService,
        alerts_service_1.AlertsService,
        alerts_gateway_1.AlertsGateway,
        audit_service_1.AuditService])
], KeysService);
//# sourceMappingURL=keys.service.js.map