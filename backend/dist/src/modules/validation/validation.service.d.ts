import { PrismaService } from '../../prisma/prisma.service';
import { ValidationResult } from '../../shared/enums';
export declare class ValidationService {
    private prisma;
    constructor(prisma: PrismaService);
    validateRoomAssignment(reservationId: string, roomId: string): Promise<ValidationResult>;
    validateCheckIn(reservationId: string): Promise<ValidationResult>;
    validateKeyIssuance(reservationId: string, roomId: string, guestId: string): Promise<ValidationResult>;
    validateRoomStatusTransition(currentStatus: string, newStatus: string): ValidationResult;
}
