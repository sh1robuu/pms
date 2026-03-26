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
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const enums_1 = require("../../shared/enums");
let IncidentsService = class IncidentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.incident.create({
            data,
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async findAll(query) {
        return this.prisma.incident.findMany({
            where: {
                ...(query?.status && { status: query.status }),
                ...(query?.severity && { severity: query.severity }),
                ...(query?.type && { type: query.type }),
            },
            include: {
                room: { select: { id: true, roomNumber: true } },
                reservation: { select: { id: true, confirmationNumber: true } },
                guest: { select: { id: true, firstName: true, lastName: true } },
                owner: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: query?.limit || 50,
        });
    }
    async findById(id) {
        return this.prisma.incident.findUnique({
            where: { id },
            include: {
                room: true,
                reservation: { include: { guest: true } },
                guest: true,
                owner: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async updateStatus(id, status, ownerId) {
        return this.prisma.incident.update({
            where: { id },
            data: {
                status,
                ...(ownerId && { ownerId }),
                ...(status === enums_1.IncidentStatus.RESOLVED && { resolvedAt: new Date() }),
            },
        });
    }
    async assignOwner(id, ownerId) {
        return this.prisma.incident.update({
            where: { id },
            data: { ownerId, status: enums_1.IncidentStatus.INVESTIGATING },
        });
    }
    async getStats() {
        const [open, investigating, total] = await Promise.all([
            this.prisma.incident.count({ where: { status: enums_1.IncidentStatus.OPEN } }),
            this.prisma.incident.count({ where: { status: enums_1.IncidentStatus.INVESTIGATING } }),
            this.prisma.incident.count(),
        ]);
        return { open, investigating, total, resolved: total - open - investigating };
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map