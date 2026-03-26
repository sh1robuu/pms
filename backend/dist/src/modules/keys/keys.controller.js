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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeysController = void 0;
const common_1 = require("@nestjs/common");
const keys_service_1 = require("./keys.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let KeysController = class KeysController {
    keysService;
    constructor(keysService) {
        this.keysService = keysService;
    }
    findAll(status, limit) {
        return this.keysService.findAll({ status, limit: limit ? parseInt(limit, 10) : undefined });
    }
    findByReservation(reservationId) {
        return this.keysService.findByReservation(reservationId);
    }
    issue(body, user) {
        return this.keysService.issue(body, user.id);
    }
    revoke(id, user) {
        return this.keysService.revoke(id, user.id);
    }
};
exports.KeysController = KeysController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KeysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('reservation/:reservationId'),
    __param(0, (0, common_1.Param)('reservationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KeysController.prototype, "findByReservation", null);
__decorate([
    (0, common_1.Post)('issue'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KeysController.prototype, "issue", null);
__decorate([
    (0, common_1.Post)(':id/revoke'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KeysController.prototype, "revoke", null);
exports.KeysController = KeysController = __decorate([
    (0, common_1.Controller)('keys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [keys_service_1.KeysService])
], KeysController);
//# sourceMappingURL=keys.controller.js.map