"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// import { createClient, type RedisClientType } from "redis"
const ioredis_1 = require("ioredis");
// const db: RedisClientType = createClient()
exports.db = new ioredis_1.Redis({
    password: "8edjEEMd690ARr4lpUBUCku644OJIClu",
    host: "redis-15051.c11.us-east-1-2.ec2.cloud.redislabs.com",
    port: 15051
});
// import { createClient } from "redis"
// const client = createClient({
// 	password: "8edjEEMd690ARr4lpUBUCku644OJIClu",
// 	socket: {
// 		host: "redis-15051.c11.us-east-1-2.ec2.cloud.redislabs.com",
// 		port: 15051,
// 	},
// })
// class RedisClient {
// 	private database: RedisClientType = createClient()
// 	constructor() {
// 		this._connect()
// 	}
// 	_connect() {
// 		db
// 			.connect()
// 			.then(() => {
// 				log.info("- CONNECTED TO REDIS!")
// 			})
// 			.catch((err) => log.fatal(err))
// 	}
// 	sadd(key: string, value: string | number) {
// 		this.database
// 			.SADD(key, value)
// 			.then((response) => log.info(response))
// 			.catch((e) => log.fatal(e))
// 	}
// 	checkUser(id: string | number): boolean {
// 		return true
// 	}
// }
// export default RedisClient
