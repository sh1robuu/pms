import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private alertsService;
    constructor(alertsService: AlertsService);
    findAll(isRead?: string, severity?: string, limit?: string): Promise<({
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
    getUnreadCount(): Promise<number>;
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
}
