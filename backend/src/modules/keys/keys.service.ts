import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { IncidentsService } from '../incidents/incidents.service';
import { AlertsService } from '../alerts/alerts.service';
import { AlertsGateway } from '../alerts/alerts.gateway';
import { AuditService } from '../audit/audit.service';
import { KeyStatus, Severity, IncidentType } from '../../shared/enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KeysService {
    constructor(
        private prisma: PrismaService,
        private validationService: ValidationService,
        private incidentsService: IncidentsService,
        private alertsService: AlertsService,
        private alertsGateway: AlertsGateway,
        private auditService: AuditService,
    ) { }

    async issue(data: {
        reservationId: string;
        roomId: string;
        guestId: string;
    }, userId: string) {
        // Run comprehensive validation - Rule 6: block on any failure
        const validation = await this.validationService.validateKeyIssuance(
            data.reservationId,
            data.roomId,
            data.guestId,
        );

        if (!validation.valid) {
            // Create incidents for key mismatch attempts
            for (const error of validation.errors) {
                const incident = await this.incidentsService.create({
                    type: IncidentType.KEY_MISMATCH,
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

            throw new BadRequestException({
                message: 'Key issuance validation failed',
                validation,
            });
        }

        // Issue key
        const keyCode = `KEY-${uuidv4().slice(0, 8).toUpperCase()}`;
        const key = await this.prisma.key.create({
            data: {
                reservationId: data.reservationId,
                roomId: data.roomId,
                guestId: data.guestId,
                issuedById: userId,
                keyCode,
                status: KeyStatus.ACTIVE,
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

    async revoke(keyId: string, userId: string) {
        const key = await this.prisma.key.findUnique({ where: { id: keyId } });
        if (!key) throw new NotFoundException('Key not found');
        if (key.status !== KeyStatus.ACTIVE) {
            throw new BadRequestException('Key is not active');
        }

        const revoked = await this.prisma.key.update({
            where: { id: keyId },
            data: {
                status: KeyStatus.REVOKED,
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

    async findByReservation(reservationId: string) {
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

    async findAll(query?: { status?: string; limit?: number }) {
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
}
