import { KeysService } from './keys.service';
export declare class KeysController {
    private keysService;
    constructor(keysService: KeysService);
    findAll(status?: string, limit?: string): Promise<({
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
    issue(body: {
        reservationId: string;
        roomId: string;
        guestId: string;
    }, user: any): Promise<{
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
    revoke(id: string, user: any): Promise<{
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
}
