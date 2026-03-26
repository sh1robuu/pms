// Shared enums as string constants (SQLite compatible)
export const UserRole = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    FRONT_DESK: 'FRONT_DESK',
    HOUSEKEEPING: 'HOUSEKEEPING',
    SECURITY: 'SECURITY',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ReservationStatus = {
    RESERVED: 'RESERVED',
    CHECKED_IN: 'CHECKED_IN',
    CHECKED_OUT: 'CHECKED_OUT',
    CANCELLED: 'CANCELLED',
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const RoomStatus = {
    VACANT_CLEAN: 'VACANT_CLEAN',
    VACANT_DIRTY: 'VACANT_DIRTY',
    OCCUPIED: 'OCCUPIED',
    OUT_OF_ORDER: 'OUT_OF_ORDER',
    CONFLICT: 'CONFLICT',
} as const;
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export const RoomType = {
    STANDARD: 'STANDARD',
    DELUXE: 'DELUXE',
    SUITE: 'SUITE',
    CONNECTING: 'CONNECTING',
    PRESIDENTIAL: 'PRESIDENTIAL',
} as const;
export type RoomType = (typeof RoomType)[keyof typeof RoomType];

export const HousekeepingStatus = {
    CLEAN: 'CLEAN',
    DIRTY: 'DIRTY',
    INSPECTED: 'INSPECTED',
    IN_PROGRESS: 'IN_PROGRESS',
} as const;
export type HousekeepingStatus = (typeof HousekeepingStatus)[keyof typeof HousekeepingStatus];

export const KeyStatus = {
    ACTIVE: 'ACTIVE',
    REVOKED: 'REVOKED',
    EXPIRED: 'EXPIRED',
} as const;
export type KeyStatus = (typeof KeyStatus)[keyof typeof KeyStatus];

export const IncidentType = {
    ROOM_CONFLICT: 'ROOM_CONFLICT',
    KEY_MISMATCH: 'KEY_MISMATCH',
    INVALID_OVERRIDE: 'INVALID_OVERRIDE',
    VIP_RISK: 'VIP_RISK',
    UNSAFE_ASSIGNMENT: 'UNSAFE_ASSIGNMENT',
    UNREADY_ROOM: 'UNREADY_ROOM',
} as const;
export type IncidentType = (typeof IncidentType)[keyof typeof IncidentType];

export const Severity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

export const IncidentStatus = {
    OPEN: 'OPEN',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
} as const;
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];

export const AuditAction = {
    ROOM_ASSIGNED: 'ROOM_ASSIGNED',
    KEY_ISSUED: 'KEY_ISSUED',
    KEY_REVOKED: 'KEY_REVOKED',
    CHECK_IN: 'CHECK_IN',
    CHECK_OUT: 'CHECK_OUT',
    RESERVATION_CREATED: 'RESERVATION_CREATED',
    RESERVATION_UPDATED: 'RESERVATION_UPDATED',
    RESERVATION_CANCELLED: 'RESERVATION_CANCELLED',
    OVERRIDE_PERFORMED: 'OVERRIDE_PERFORMED',
    INCIDENT_CREATED: 'INCIDENT_CREATED',
    INCIDENT_RESOLVED: 'INCIDENT_RESOLVED',
    ROOM_STATUS_CHANGED: 'ROOM_STATUS_CHANGED',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// Validation result types
export interface ValidationError {
    code: string;
    message: string;
    severity: Severity;
    context?: Record<string, any>;
}

export interface ValidationWarning {
    code: string;
    message: string;
    context?: Record<string, any>;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
