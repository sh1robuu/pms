import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/ws',
})
@Injectable()
export class AlertsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    afterInit() {
        console.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    emitAlert(alert: any) {
        this.server.emit('alert', alert);
    }

    emitRoomUpdate(room: any) {
        this.server.emit('room-update', room);
    }

    emitIncident(incident: any) {
        this.server.emit('incident', incident);
    }

    emitKeyEvent(keyEvent: any) {
        this.server.emit('key-event', keyEvent);
    }

    emitReservationUpdate(reservation: any) {
        this.server.emit('reservation-update', reservation);
    }

    emitDashboardUpdate(data: any) {
        this.server.emit('dashboard-update', data);
    }
}
