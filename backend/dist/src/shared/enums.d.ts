export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly FRONT_DESK: "FRONT_DESK";
    readonly HOUSEKEEPING: "HOUSEKEEPING";
    readonly SECURITY: "SECURITY";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const ReservationStatus: {
    readonly RESERVED: "RESERVED";
    readonly CHECKED_IN: "CHECKED_IN";
    readonly CHECKED_OUT: "CHECKED_OUT";
    readonly CANCELLED: "CANCELLED";
};
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];
export declare const RoomStatus: {
    readonly VACANT_CLEAN: "VACANT_CLEAN";
    readonly VACANT_DIRTY: "VACANT_DIRTY";
    readonly OCCUPIED: "OCCUPIED";
    readonly OUT_OF_ORDER: "OUT_OF_ORDER";
    readonly CONFLICT: "CONFLICT";
};
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];
export declare const RoomType: {
    readonly STANDARD: "STANDARD";
    readonly DELUXE: "DELUXE";
    readonly SUITE: "SUITE";
    readonly CONNECTING: "CONNECTING";
    readonly PRESIDENTIAL: "PRESIDENTIAL";
};
export type RoomType = (typeof RoomType)[keyof typeof RoomType];
export declare const HousekeepingStatus: {
    readonly CLEAN: "CLEAN";
    readonly DIRTY: "DIRTY";
    readonly INSPECTED: "INSPECTED";
    readonly IN_PROGRESS: "IN_PROGRESS";
};
export type HousekeepingStatus = (typeof HousekeepingStatus)[keyof typeof HousekeepingStatus];
export declare const KeyStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly REVOKED: "REVOKED";
    readonly EXPIRED: "EXPIRED";
};
export type KeyStatus = (typeof KeyStatus)[keyof typeof KeyStatus];
export declare const IncidentType: {
    readonly ROOM_CONFLICT: "ROOM_CONFLICT";
    readonly KEY_MISMATCH: "KEY_MISMATCH";
    readonly INVALID_OVERRIDE: "INVALID_OVERRIDE";
    readonly VIP_RISK: "VIP_RISK";
    readonly UNSAFE_ASSIGNMENT: "UNSAFE_ASSIGNMENT";
    readonly UNREADY_ROOM: "UNREADY_ROOM";
};
export type IncidentType = (typeof IncidentType)[keyof typeof IncidentType];
export declare const Severity: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
};
export type Severity = (typeof Severity)[keyof typeof Severity];
export declare const IncidentStatus: {
    readonly OPEN: "OPEN";
    readonly INVESTIGATING: "INVESTIGATING";
    readonly RESOLVED: "RESOLVED";
    readonly CLOSED: "CLOSED";
};
export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];
export declare const AuditAction: {
    readonly ROOM_ASSIGNED: "ROOM_ASSIGNED";
    readonly KEY_ISSUED: "KEY_ISSUED";
    readonly KEY_REVOKED: "KEY_REVOKED";
    readonly CHECK_IN: "CHECK_IN";
    readonly CHECK_OUT: "CHECK_OUT";
    readonly RESERVATION_CREATED: "RESERVATION_CREATED";
    readonly RESERVATION_UPDATED: "RESERVATION_UPDATED";
    readonly RESERVATION_CANCELLED: "RESERVATION_CANCELLED";
    readonly OVERRIDE_PERFORMED: "OVERRIDE_PERFORMED";
    readonly INCIDENT_CREATED: "INCIDENT_CREATED";
    readonly INCIDENT_RESOLVED: "INCIDENT_RESOLVED";
    readonly ROOM_STATUS_CHANGED: "ROOM_STATUS_CHANGED";
};
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
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
