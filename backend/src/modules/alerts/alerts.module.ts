import { Global, Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertsGateway } from './alerts.gateway';

@Global()
@Module({
    controllers: [AlertsController],
    providers: [AlertsService, AlertsGateway],
    exports: [AlertsService, AlertsGateway],
})
export class AlertsModule { }
