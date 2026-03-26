import { PrismaService } from '../../prisma/prisma.service';
export declare class AlertsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        type: string;
        severity: string;
        message: string;
        roomId?: string;
        reservationId?: string;
    }): Promise<{
        room: {
            id: string;
            roomNumber: string;
        } | null;
        reservation: {
            id: string;
            confirmationNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        severity: string;
        roomId: string | null;
        reservationId: string | null;
        message: string;
        isRead: boolean;
    }>;
    findAll(query?: {
        isRead?: boolean;
        severity?: string;
        limit?: number;
    }): Promise<({
        room: {
            id: string;
            roomNumber: string;
        } | null;
        reservation: {
            id: string;
            confirmationNumber: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        severity: string;
        roomId: string | null;
        reservationId: string | null;
        message: string;
        isRead: boolean;
    })[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        severity: string;
        roomId: string | null;
        reservationId: string | null;
        message: string;
        isRead: boolean;
    }>;
    markAllAsRead(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getUnreadCount(): Promise<number>;
}
