"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AlertsService = class AlertsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.alert.create({
            data,
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
            },
        });
    }
    async findAll(query) {
        return this.prisma.alert.findMany({
            where: {
                ...(query?.isRead !== undefined && { isRead: query.isRead }),
                ...(query?.severity && { severity: query.severity }),
            },
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: query?.limit || 50,
        });
    }
    async markAsRead(id) {
        return this.prisma.alert.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async markAllAsRead() {
        return this.prisma.alert.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });
    }
    async getUnreadCount() {
        return this.prisma.alert.count({ where: { isRead: false } });
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map