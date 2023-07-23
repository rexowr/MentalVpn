import { db } from "./database/db";

async function addServer(server: string): Promise<boolean> {
  const exists = await db.sismember('servers', server)
  return exists ? false : true
}

export default addServer