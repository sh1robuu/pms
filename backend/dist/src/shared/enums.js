"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.IncidentStatus = exports.Severity = exports.IncidentType = exports.KeyStatus = exports.HousekeepingStatus = exports.RoomType = exports.RoomStatus = exports.ReservationStatus = exports.UserRole = void 0;
exports.UserRole = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    FRONT_DESK: 'FRONT_DESK',
    HOUSEKEEPING: 'HOUSEKEEPING',
    SECURITY: 'SECURITY',
};
exports.ReservationStatus = {
    RESERVED: 'RESERVED',
    CHECKED_IN: 'CHECKED_IN',
    CHECKED_OUT: 'CHECKED_OUT',
    CANCELLED: 'CANCELLED',
};
exports.RoomStatus = {
    VACANT_CLEAN: 'VACANT_CLEAN',
    VACANT_DIRTY: 'VACANT_DIRTY',
    OCCUPIED: 'OCCUPIED',
    OUT_OF_ORDER: 'OUT_OF_ORDER',
    CONFLICT: 'CONFLICT',
};
exports.RoomType = {
    STANDARD: 'STANDARD',
    DELUXE: 'DELUXE',
    SUITE: 'SUITE',
    CONNECTING: 'CONNECTING',
    PRESIDENTIAL: 'PRESIDENTIAL',
};
exports.HousekeepingStatus = {
    CLEAN: 'CLEAN',
    DIRTY: 'DIRTY',
    INSPECTED: 'INSPECTED',
    IN_PROGRESS: 'IN_PROGRESS',
};
exports.KeyStatus = {
    ACTIVE: 'ACTIVE',
    REVOKED: 'REVOKED',
    EXPIRED: 'EXPIRED',
};
exports.IncidentType = {
    ROOM_CONFLICT: 'ROOM_CONFLICT',
    KEY_MISMATCH: 'KEY_MISMATCH',
    INVALID_OVERRIDE: 'INVALID_OVERRIDE',
    VIP_RISK: 'VIP_RISK',
    UNSAFE_ASSIGNMENT: 'UNSAFE_ASSIGNMENT',
    UNREADY_ROOM: 'UNREADY_ROOM',
};
exports.Severity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
};
exports.IncidentStatus = {
    OPEN: 'OPEN',
    INVESTIGATING: 'INVESTIGATING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
};
exports.AuditAction = {
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
};
//# sourceMappingURL=enums.js.map