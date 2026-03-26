import { RoomsService } from './rooms.service';
export declare class RoomsController {
    private roomsService;
    constructor(roomsService: RoomsService);
    findAll(floor?: string, status?: string, type?: string): Promise<({
        currentOccupant: {
            id: string;
            firstName: string;
            lastName: string;
            vipStatus: boolean;
        } | null;
        assignedReservations: ({
            guest: {
                id: string;
                firstName: string;
                lastName: string;
                vipStatus: boolean;
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
        })[];
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
    })[]>;
    getBoard(): Promise<{
        floors: Record<number, ({
            currentOccupant: {
                id: string;
                firstName: string;
                lastName: string;
                vipStatus: boolean;
            } | null;
            assignedReservations: ({
                guest: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    vipStatus: boolean;
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
            })[];
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
        })[]>;
        totalRooms: number;
        summary: {
            total: number;
            vacantClean: number;
            vacantDirty: number;
            occupied: number;
            outOfOrder: number;
            conflict: number;
        };
    }>;
    getAvailable(arrivalDate: string, departureDate: string, roomType?: string): Promise<{
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
    }[]>;
    findById(id: string): Promise<{
        currentOccupant: {
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
        assignedReservations: ({
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
        })[];
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
        keys: {
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
        }[];
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
    }>;
    updateStatus(id: string, body: {
        status: string;
        reason?: string;
    }, user: any): Promise<{
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
    }>;
    updateHousekeeping(id: string, body: {
        status: string;
    }, user: any): Promise<{
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
    }>;
}
