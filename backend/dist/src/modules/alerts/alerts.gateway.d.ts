import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class AlertsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitAlert(alert: any): void;
    emitRoomUpdate(room: any): void;
    emitIncident(incident: any): void;
    emitKeyEvent(keyEvent: any): void;
    emitReservationUpdate(reservation: any): void;
    emitDashboardUpdate(data: any): void;
}
