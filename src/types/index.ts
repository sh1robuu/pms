// Shared types matching backend models

export type UserRole = 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'HOUSEKEEPING' | 'SECURITY';
export type ReservationStatus = 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type RoomStatus = 'VACANT_CLEAN' | 'VACANT_DIRTY' | 'OCCUPIED' | 'OUT_OF_ORDER' | 'CONFLICT';
export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'CONNECTING' | 'PRESIDENTIAL';
export type HousekeepingStatus = 'CLEAN' | 'DIRTY' | 'INSPECTED' | 'IN_PROGRESS';
export type KeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type IncidentType = 'ROOM_CONFLICT' | 'KEY_MISMATCH' | 'INVALID_OVERRIDE' | 'VIP_RISK' | 'UNSAFE_ASSIGNMENT' | 'UNREADY_ROOM';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
}

export interface Guest {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    idNumber?: string;
    vipStatus: boolean;
    notes?: string;
    createdAt: string;
    reservations?: Reservation[];
}

export interface Room {
    id: string;
    roomNumber: string;
    roomType: RoomType;
    floor: number;
    status: RoomStatus;
    currentOccupantId?: string;
    currentOccupant?: Guest;
    housekeepingStatus: HousekeepingStatus;
    inspectedAt?: string;
    outOfOrderReason?: string;
    isConnecting: boolean;
    connectingRoomId?: string;
    connectingRoom?: Room;
    assignedReservations?: Reservation[];
}

export interface Reservation {
    id: string;
    confirmationNumber: string;
    guestId: string;
    guest?: Guest;
    assignedRoomId?: string;
    assignedRoom?: Room;
    arrivalDate: string;
    departureDate: string;
    status: ReservationStatus;
    isVip: boolean;
    isConnecting: boolean;
    connectingGroupId?: string;
    notes?: string;
    checkedInAt?: string;
    checkedOutAt?: string;
    keys?: Key[];
    incidents?: Incident[];
    alerts?: Alert[];
    createdAt: string;
}

export interface Key {
    id: string;
    reservationId: string;
    reservation?: { id: string; confirmationNumber: string };
    roomId: string;
    room?: { id: string; roomNumber: string };
    guestId: string;
    guest?: { id: string; firstName: string; lastName: string };
    issuedById: string;
    issuedBy?: { id: string; name: string };
    issuedAt: string;
    revokedAt?: string;
    revokedById?: string;
    revokedBy?: { id: string; name: string };
    status: KeyStatus;
    keyCode: string;
}

export interface Incident {
    id: string;
    type: IncidentType;
    severity: Severity;
    roomId?: string;
    room?: { id: string; roomNumber: string };
    reservationId?: string;
    reservation?: { id: string; confirmationNumber: string };
    guestId?: string;
    guest?: { id: string; firstName: string; lastName: string };
    rootCause: string;
    description: string;
    status: IncidentStatus;
    ownerId?: string;
    owner?: { id: string; name: string };
    resolvedAt?: string;
    createdAt: string;
}

export interface Alert {
    id: string;
    type: string;
    severity: Severity;
    message: string;
    roomId?: string;
    room?: { id: string; roomNumber: string };
    reservationId?: string;
    reservation?: { id: string; confirmationNumber: string };
    isRead: boolean;
    createdAt: string;
}

export interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    user?: { name: string };
    details?: string;
    createdAt: string;
}

export interface DashboardStats {
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
}

export interface ValidationError {
    code: string;
    message: string;
    severity: Severity;
    context?: Record<string, unknown>;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: { code: string; message: string; context?: Record<string, unknown> }[];
}

export interface RoomBoardData {
    floors: Record<number, Room[]>;
    totalRooms: number;
    summary: {
        total: number;
        vacantClean: number;
        vacantDirty: number;
        occupied: number;
        outOfOrder: number;
        conflict: number;
    };
}
