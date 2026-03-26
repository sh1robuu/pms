import { GuestsService } from './guests.service';
export declare class GuestsController {
    private guestsService;
    constructor(guestsService: GuestsService);
    findAll(search?: string, vipOnly?: string): Promise<({
        reservations: {
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
        }[];
    } & {
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
    })[]>;
    findById(id: string): Promise<({
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
        reservations: ({
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
        })[];
    } & {
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
    }) | null>;
    create(body: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        idNumber?: string;
        vipStatus?: boolean;
        notes?: string;
    }): Promise<{
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
    }>;
    update(id: string, body: any): Promise<{
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
    }>;
}
