// import { createClient, type RedisClientType } from "redis"
import { Redis } from "ioredis"
import { log } from "../logger"

// const db: RedisClientType = createClient()
export const db = new Redis({
	password: "8edjEEMd690ARr4lpUBUCku644OJIClu",
	host: "redis-15051.c11.us-east-1-2.ec2.cloud.redislabs.com",
  port: 15051
})
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
