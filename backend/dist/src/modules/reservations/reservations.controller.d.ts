import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    findAll(status?: string, guestId?: string): Promise<({
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
    create(body: any, user: any): Promise<{
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
    assignRoom(id: string, body: {
        roomId: string;
    }, user: any): Promise<{
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
    checkIn(id: string, user: any): Promise<{
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
    checkOut(id: string, user: any): Promise<{
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
    cancel(id: string, user: any): Promise<{
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
