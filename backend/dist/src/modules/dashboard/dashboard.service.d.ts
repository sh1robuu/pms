import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        arrivalsToday: number;
        departuresToday: number;
        inHouseGuests: number;
        vipArrivals: number;
        roomConflicts: number;
        openIncidents: number;
        recentKeys: number;
        unreadAlerts: number;
        unreadyArrivals: number;
        outOfOrderRooms: number;
        totalReservations: number;
        roomSummary: Record<string, number>;
    }>;
    getRecentActivity(limit?: number): Promise<{
        recentAudit: ({
            user: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            details: string | null;
            ipAddress: string | null;
            userId: string;
        })[];
        recentAlerts: ({
            room: {
                roomNumber: string;
            } | null;
            reservation: {
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
        })[];
    }>;
}
