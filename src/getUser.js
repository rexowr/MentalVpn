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
const db_1 = require("./database/db");
function getUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db_1.db.hgetall(id.toString());
        return data !== null && data !== void 0 ? data : null;
    });
}
// async function getUser(id: number): Promise<userData> {
// 	const data = await db.smembers("users")
// 	const user = data
// 		.map((item) => JSON.parse(item))
// 		.find((item) => item.id === id)
// 		return user ?? null
// }
exports.default = getUser;
