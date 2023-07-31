import { isEmpty } from "lodash"
import { CronJob } from "cron"
import { db } from "./database/db"

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

export async function getV2rayExpire(user: string, server: string[]) {
	// const expireTime = await db.ttl(`${user}:v2ray:${server}`)
	// const expire = await Promise.all(
	// 	server.map(async (s) => await db.ttl(`${user}:v2ray:${s}`))
	// )
	const expire = await Promise.all(
		server.map(async (s) => {
			return {
				server: s,
				expire: await db.ttl(`${user}:v2ray:${s}`),
			}
		})
	)
	return expire
}
export async function getOpenExpire(user: string, server: string[]) {
	// const expireTime = await db.ttl(`${user}:openconnect:${server}`)
	const expire = await Promise.all(
		server.map(async (s) => {
			return {
				server: s,
				expire: await db.ttl(`${user}:openconnect:${s}`)
			}
		})
	)
	return expire
}

async function getV2ray(id: number) {
	const result = []
	const servers = await db.smembers(`${id}:services:v2ray`)
	if (!isEmpty(servers)) {
		for (const server of servers) {
			// const expire = await db.ttl(`${id}:v2ray:${server}`)
			const expire = await db.ttl(
				`1913245253:v2ray:vless://7cc3dff1-288a-44a4-bfe0-ec0864bed265@rosetea3.nightmareofthedead.top:12300?security=none&path=%2F&encryption=none&host=divarcdn.com&headerType=http&type=tcp#7F9Faj6plcccde5r7t6y7u8i`
			)
			console.log(expire)
			result.push({
				server,
				expire,
			})
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
	}
}

async function refreshServices(id: number) {
	const TF = 5
	const v2ray = await db.smembers(`${id}:services:v2ray`)
	const openconnect = await db.smembers(`${id}:services:openconnect`)
	const result = []
	if (v2ray) {
		for (let server of v2ray) {
			const expire = await db.hget(`${id}:v2ray:${server}`, "expire")
			if (expire! >= TF.toString()) {
				result.push({
					id,
					server,
					expire,
				})
			}
		}
	}
	if (openconnect) {
		for (let server of openconnect) {
			const expire = await db.hget(`${id}:openconnect:${server}`, "expire")
			if (expire! >= TF.toString()) {
				result.push({
					id,
					server,
					expire,
				})
			}
		}
	}
	return result
}

export { refreshServices, getV2ray }
