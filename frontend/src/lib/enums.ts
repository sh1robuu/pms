// Shared enums matching Prisma schema
export const ReservationStatus = {
    RESERVED: 'RESERVED',
    CHECKED_IN: 'CHECKED_IN',
    CHECKED_OUT: 'CHECKED_OUT',
    CANCELLED: 'CANCELLED',
} as const;

export const RoomStatus = {
    VACANT_CLEAN: 'VACANT_CLEAN',
    VACANT_DIRTY: 'VACANT_DIRTY',
    OCCUPIED: 'OCCUPIED',
    OUT_OF_ORDER: 'OUT_OF_ORDER',
    CONFLICT: 'CONFLICT',
} as const;

export const KeyStatus = {
    ACTIVE: 'ACTIVE',
    REVOKED: 'REVOKED',
    EXPIRED: 'EXPIRED',
} as const;

export const IncidentStatus = {
    OPEN: 'OPEN',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
} as const;

export const Severity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;
