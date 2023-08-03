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
exports.getV2ray = exports.refreshServices = exports.getOpenExpire = exports.getV2rayExpire = void 0;
const lodash_1 = require("lodash");
const db_1 = require("./database/db");
// const cj = new CronJob("*/5 * * * * *", async () => {
// 	// db.smembers('users').then(user => {
// 	// 	user.map(item => {
// 	// 		console.log(item)
// 	// 		db.smembers(`${item}:services:v2ray`).then(res => console.log(res))
// 	// 	})
// 	// })
//   const users = await db.smembers('users')
// 	// console.log(users)
//   const v2rays = Promise.all(users.map(async user => await db.smembers(`${user}:services:v2ray`)))
//   const openconnects = Promise.all(users.map(async user => await db.smembers(`${user}:services:openconnect`)))
// 	console.log(await v2rays)
// })
// cj.start()
function getV2rayExpire(user, server) {
    return __awaiter(this, void 0, void 0, function* () {
        // const expireTime = await db.ttl(`${user}:v2ray:${server}`)
        // const expire = await Promise.all(
        // 	server.map(async (s) => await db.ttl(`${user}:v2ray:${s}`))
        // )
        const expire = yield Promise.all(server.map((s) => __awaiter(this, void 0, void 0, function* () {
            return {
                server: s,
                expire: yield db_1.db.ttl(`${user}:v2ray:${s}`),
            };
        })));
        return expire;
    });
}
exports.getV2rayExpire = getV2rayExpire;
function getOpenExpire(user, server) {
    return __awaiter(this, void 0, void 0, function* () {
        // const expireTime = await db.ttl(`${user}:openconnect:${server}`)
        const expire = yield Promise.all(server.map((s) => __awaiter(this, void 0, void 0, function* () {
            return {
                server: s,
                expire: yield db_1.db.ttl(`${user}:openconnect:${s}`)
            };
        })));
        return expire;
    });
}
exports.getOpenExpire = getOpenExpire;
function getV2ray(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        const servers = yield db_1.db.smembers(`${id}:services:v2ray`);
        if (!(0, lodash_1.isEmpty)(servers)) {
            for (const server of servers) {
                // const expire = await db.ttl(`${id}:v2ray:${server}`)
                const expire = yield db_1.db.ttl(`1913245253:v2ray:vless://7cc3dff1-288a-44a4-bfe0-ec0864bed265@rosetea3.nightmareofthedead.top:12300?security=none&path=%2F&encryption=none&host=divarcdn.com&headerType=http&type=tcp#7F9Faj6plcccde5r7t6y7u8i`);
                console.log(expire);
                result.push({
                    server,
                    expire,
                });
                // result.push({
                // 	[`user:${id}`]: {
                // 		servers: [{ server, expire }],
                // 	},
                // })
            }
        }
        return {
            // [id]: {
            servers: result,
            // }
        };
    });
}
exports.getV2ray = getV2ray;
function refreshServices(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const TF = 5;
        const v2ray = yield db_1.db.smembers(`${id}:services:v2ray`);
        const openconnect = yield db_1.db.smembers(`${id}:services:openconnect`);
        const result = [];
        if (v2ray) {
            for (let server of v2ray) {
                const expire = yield db_1.db.hget(`${id}:v2ray:${server}`, "expire");
                if (expire >= TF.toString()) {
                    result.push({
                        id,
                        server,
                        expire,
                    });
                }
            }
        }
        if (openconnect) {
            for (let server of openconnect) {
                const expire = yield db_1.db.hget(`${id}:openconnect:${server}`, "expire");
                if (expire >= TF.toString()) {
                    result.push({
                        id,
                        server,
                        expire,
                    });
                }
            }
        }
        return result;
    });
}
exports.refreshServices = refreshServices;
