import { PrismaService } from '../../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { IncidentsService } from '../incidents/incidents.service';
import { AlertsService } from '../alerts/alerts.service';
import { AlertsGateway } from '../alerts/alerts.gateway';
import { AuditService } from '../audit/audit.service';
export declare class KeysService {
    private prisma;
    private validationService;
    private incidentsService;
    private alertsService;
    private alertsGateway;
    private auditService;
    constructor(prisma: PrismaService, validationService: ValidationService, incidentsService: IncidentsService, alertsService: AlertsService, alertsGateway: AlertsGateway, auditService: AuditService);
    issue(data: {
        reservationId: string;
        roomId: string;
        guestId: string;
    }, userId: string): Promise<{
        key: {
            room: {
                id: string;
                roomNumber: string;
            };
            guest: {
                id: string;
                firstName: string;
                lastName: string;
            };
            reservation: {
                id: string;
                confirmationNumber: string;
            };
            issuedBy: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            guestId: string;
            roomId: string;
            reservationId: string;
            issuedAt: Date;
            revokedAt: Date | null;
            keyCode: string;
            issuedById: string;
            revokedById: string | null;
        };
        validation: import("../../shared/enums").ValidationResult;
    }>;
    revoke(keyId: string, userId: string): Promise<{
        room: {
            id: string;
            roomNumber: string;
        };
        guest: {
            id: string;
            firstName: string;
            lastName: string;
        };
        reservation: {
            id: string;
            confirmationNumber: string;
        };
        revokedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        guestId: string;
        roomId: string;
        reservationId: string;
        issuedAt: Date;
        revokedAt: Date | null;
        keyCode: string;
        issuedById: string;
        revokedById: string | null;
    }>;
    findByReservation(reservationId: string): Promise<({
        room: {
            id: string;
            roomNumber: string;
        };
        guest: {
            id: string;
            firstName: string;
            lastName: string;
        };
        issuedBy: {
            id: string;
            name: string;
        };
        revokedBy: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        guestId: string;
        roomId: string;
        reservationId: string;
        issuedAt: Date;
        revokedAt: Date | null;
        keyCode: string;
        issuedById: string;
        revokedById: string | null;
    })[]>;
    findAll(query?: {
        status?: string;
        limit?: number;
    }): Promise<({
        room: {
            id: string;
            roomNumber: string;
        };
        guest: {
            id: string;
            firstName: string;
            lastName: string;
        };
        reservation: {
            id: string;
            confirmationNumber: string;
        };
        issuedBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        guestId: string;
        roomId: string;
        reservationId: string;
        issuedAt: Date;
        revokedAt: Date | null;
        keyCode: string;
        issuedById: string;
        revokedById: string | null;
    })[]>;
}
