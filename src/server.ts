import { appendFile } from "fs/promises";
import { db } from "./database/db";

async function addServer(server: string): Promise<boolean> {
  const exists = await db.sismember('servers', server)
  return exists ? false : true
}

async function addV2ray(server: string): Promise<void> {
  await appendFile('./v2ray.txt', `${server}\n`)
}

async function addOpenConnect(server: string): Promise<void> {
  await appendFile('./passwords.txt', `${server}\n`)
}

export {
  addServer,
  addV2ray,
  addOpenConnect
}