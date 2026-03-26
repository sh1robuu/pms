import { IncidentsService } from './incidents.service';
export declare class IncidentsController {
    private incidentsService;
    constructor(incidentsService: IncidentsService);
    findAll(status?: string, severity?: string, type?: string, limit?: string): Promise<({
        room: {
            id: string;
            roomNumber: string;
        } | null;
        guest: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        reservation: {
            id: string;
            confirmationNumber: string;
        } | null;
        owner: {
            id: string;
            name: string;
        } | null;
    } & {
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
    })[]>;
    getStats(): Promise<{
        open: number;
        investigating: number;
        total: number;
        resolved: number;
    }>;
    findById(id: string): Promise<({
        room: {
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
        } | null;
        reservation: ({
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
        }) | null;
        owner: {
            id: string;
            email: string;
            name: string;
        } | null;
    } & {
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
    }) | null>;
    updateStatus(id: string, body: {
        status: string;
        ownerId?: string;
    }): Promise<{
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
    }>;
    assignOwner(id: string, body: {
        ownerId: string;
    }): Promise<{
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
    }>;
}
