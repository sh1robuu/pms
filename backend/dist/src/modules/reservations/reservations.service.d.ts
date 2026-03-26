import { PrismaService } from '../../prisma/prisma.service';
import { ValidationService } from '../validation/validation.service';
import { IncidentsService } from '../incidents/incidents.service';
import { AlertsService } from '../alerts/alerts.service';
import { AlertsGateway } from '../alerts/alerts.gateway';
import { AuditService } from '../audit/audit.service';
export declare class ReservationsService {
    private prisma;
    private validationService;
    private incidentsService;
    private alertsService;
    private alertsGateway;
    private auditService;
    constructor(prisma: PrismaService, validationService: ValidationService, incidentsService: IncidentsService, alertsService: AlertsService, alertsGateway: AlertsGateway, auditService: AuditService);
    findAll(query?: {
        status?: string;
        guestId?: string;
        date?: string;
    }): Promise<({
        guest: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            vipStatus: boolean;
        };
        assignedRoom: {
            id: string;
            roomNumber: string;
            roomType: string;
            floor: number;
            status: string;
            housekeepingStatus: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isConnecting: boolean;
        notes: string | null;
        confirmationNumber: string;
        arrivalDate: Date;
        departureDate: Date;
        isVip: boolean;
        connectingGroupId: string | null;
        checkedInAt: Date | null;
        checkedOutAt: Date | null;
        guestId: string;
        assignedRoomId: string | null;
    })[]>;
    findById(id: string): Promise<{
        keys: ({
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
        })[];
        incidents: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            guestId: string | null;
            type: string;
            severity: string;
            rootCause: string;
            description: string;
            resolvedAt: Date | null;
            roomId: string | null;
            reservationId: string | null;
            ownerId: string | null;
        }[];
        alerts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            severity: string;
            roomId: string | null;
            reservationId: string | null;
            message: string;
            isRead: boolean;
        }[];
        guest: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            idNumber: string | null;
            vipStatus: boolean;
            notes: string | null;
        };
        assignedRoom: ({
            connectingRoom: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                roomNumber: string;
                roomType: string;
                floor: number;
                status: string;
                housekeepingStatus: string;
                inspectedAt: Date | null;
                outOfOrderReason: string | null;
                isConnecting: boolean;
                currentOccupantId: string | null;
                connectingRoomId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomNumber: string;
            roomType: string;
            floor: number;
            status: string;
            housekeepingStatus: string;
            inspectedAt: Date | null;
            outOfOrderReason: string | null;
            isConnecting: boolean;
            currentOccupantId: string | null;
            connectingRoomId: string | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isConnecting: boolean;
        notes: string | null;
        confirmationNumber: string;
        arrivalDate: Date;
        departureDate: Date;
        isVip: boolean;
        connectingGroupId: string | null;
        checkedInAt: Date | null;
        checkedOutAt: Date | null;
        guestId: string;
        assignedRoomId: string | null;
    }>;
    getArrivals(date?: string): Promise<({
        guest: {
            id: string;
            firstName: string;
            lastName: string;
            vipStatus: boolean;
        };
        assignedRoom: {
            id: string;
            roomNumber: string;
            roomType: string;
            status: string;
            housekeepingStatus: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isConnecting: boolean;
        notes: string | null;
        confirmationNumber: string;
        arrivalDate: Date;
        departureDate: Date;
        isVip: boolean;
        connectingGroupId: string | null;
        checkedInAt: Date | null;
        checkedOutAt: Date | null;
        guestId: string;
        assignedRoomId: string | null;
    })[]>;
    getDepartures(date?: string): Promise<({
        guest: {
            id: string;
            firstName: string;
            lastName: string;
            vipStatus: boolean;
        };
        assignedRoom: {
            id: string;
            roomNumber: string;
            roomType: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isConnecting: boolean;
        notes: string | null;
        confirmationNumber: string;
        arrivalDate: Date;
        departureDate: Date;
        isVip: boolean;
        connectingGroupId: string | null;
        checkedInAt: Date | null;
        checkedOutAt: Date | null;
        guestId: string;
        assignedRoomId: string | null;
    })[]>;
    create(data: {
        guestId: string;
        arrivalDate: string;
        departureDate: string;
        roomType?: string;
        isVip?: boolean;
        isConnecting?: boolean;
        connectingGroupId?: string;
        notes?: string;
    }, userId: string): Promise<{
        guest: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            idNumber: string | null;
            vipStatus: boolean;
            notes: string | null;
        };
        assignedRoom: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomNumber: string;
            roomType: string;
            floor: number;
            status: string;
            housekeepingStatus: string;
            inspectedAt: Date | null;
            outOfOrderReason: string | null;
            isConnecting: boolean;
            currentOccupantId: string | null;
            connectingRoomId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isConnecting: boolean;
        notes: string | null;
        confirmationNumber: string;
        arrivalDate: Date;
        departureDate: Date;
        isVip: boolean;
        connectingGroupId: string | null;
        checkedInAt: Date | null;
        checkedOutAt: Date | null;
        guestId: string;
        assignedRoomId: string | null;
    }>;
    assignRoom(reservationId: string, roomId: string, userId: string): Promise<{
        reservation: {
            guest: {
                id: string;
                email: string | null;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string | null;
                idNumber: string | null;
                vipStatus: boolean;
                notes: string | null;
            };
            assignedRoom: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                roomNumber: string;
                roomType: string;
                floor: number;
                status: string;
                housekeepingStatus: string;
                inspectedAt: Date | null;
                outOfOrderReason: string | null;
                isConnecting: boolean;
                currentOccupantId: string | null;
                connectingRoomId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            isConnecting: boolean;
            notes: string | null;
            confirmationNumber: string;
            arrivalDate: Date;
            departureDate: Date;
            isVip: boolean;
            connectingGroupId: string | null;
            checkedInAt: Date | null;
            checkedOutAt: Date | null;
            guestId: string;
            assignedRoomId: string | null;
        };
        validation: import("../../shared/enums").ValidationResult;
    }>;
    checkIn(reservationId: string, userId: string): Promise<{
        reservation: {
            guest: {
                id: string;
                email: string | null;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string | null;
                idNumber: string | null;
                vipStatus: boolean;
                notes: string | null;
            };
            assignedRoom: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                roomNumber: string;
                roomType: string;
                floor: number;
                status: string;
                housekeepingStatus: string;
                inspectedAt: Date | null;
                outOfOrderReason: string | null;
                isConnecting: boolean;
                currentOccupantId: string | null;
                connectingRoomId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            isConnecting: boolean;
            notes: string | null;
            confirmationNumber: string;
            arrivalDate: Date;
            departureDate: Date;
            isVip: boolean;
            connectingGroupId: string | null;
            checkedInAt: Date | null;
            checkedOutAt: Date | null;
            guestId: string;
            assignedRoomId: string | null;
        };
        validation: import("../../shared/enums").ValidationResult;
    }>;
    checkOut(reservationId: string, userId: string): Promise<{
        guest: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            idNumber: string | null;
            vipStatus: boolean;
            notes: string | null;
        };
        assignedRoom: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomNumber: string;
            roomType: string;
            floor: number;
            status: string;
            housekeepingStatus: string;
            inspectedAt: Date | null;
            outOfOrderReason: string | null;
            isConnecting: boolean;
            currentOccupantId: string | null;
            connectingRoomId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isConnecting: boolean;
        notes: string | null;
        confirmationNumber: string;
        arrivalDate: Date;
        departureDate: Date;
        isVip: boolean;
        connectingGroupId: string | null;
        checkedInAt: Date | null;
        checkedOutAt: Date | null;
        guestId: string;
        assignedRoomId: string | null;
    }>;
    cancel(reservationId: string, userId: string): Promise<{
        guest: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string | null;
            idNumber: string | null;
            vipStatus: boolean;
            notes: string | null;
        };
        assignedRoom: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            roomNumber: string;
            roomType: string;
            floor: number;
            status: string;
            housekeepingStatus: string;
            inspectedAt: Date | null;
            outOfOrderReason: string | null;
            isConnecting: boolean;
            currentOccupantId: string | null;
            connectingRoomId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isConnecting: boolean;
        notes: string | null;
        confirmationNumber: string;
        arrivalDate: Date;
        departureDate: Date;
        isVip: boolean;
        connectingGroupId: string | null;
        checkedInAt: Date | null;
        checkedOutAt: Date | null;
        guestId: string;
        assignedRoomId: string | null;
    }>;
}
