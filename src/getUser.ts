import { db } from "./database/db"

interface userData {
	id: string | number
	first_name: string
	username: string | null
	balance: number
}

async function getUser(id: number): Promise<any> {
	const data = await db.hgetall(id.toString())
	return data ?? null
}
// async function getUser(id: number): Promise<userData> {
// 	const data = await db.smembers("users")
// 	const user = data
// 		.map((item) => JSON.parse(item))
// 		.find((item) => item.id === id)
// 		return user ?? null
// }

export default getUser