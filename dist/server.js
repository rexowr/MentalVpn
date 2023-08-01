"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOpenConnect = exports.addV2ray = exports.addServer = void 0;
const promises_1 = require("fs/promises");
const db_1 = require("./database/db");
function addServer(server) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield db_1.db.sismember('servers', server);
        return exists ? false : true;
    });
}
exports.addServer = addServer;
function addV2ray(server) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, promises_1.appendFile)('./v2ray.txt', `${server}\n`);
    });
}
exports.addV2ray = addV2ray;
function addOpenConnect(server) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, promises_1.appendFile)('./passwords.txt', `${server}\n`);
    });
}
exports.addOpenConnect = addOpenConnect;
