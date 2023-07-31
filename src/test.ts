// import { createClient } from "redis";
import { promisify } from "util";
import { db } from "./database/db";
import { CronJob } from "cron";
const cj = new CronJob('*/5 * * * * *', () => {
})
cj.start()
// const client = createClient({
//   database: 2
// })

// client.connect().then(async () => {
//   const name = await client.set("name","Alireza")
//   const expire = await client.expire('name', 10050)
//   console.log(expire)
//   setInterval(async () => {
//     const ex = await client.ttl('name')
//     console.log(ex)
//   }, 5000);
// })
;(async() => {
  await db.set("name", "Alireza")
  const expire = await db.expire('name', 10)
  console.log(expire)
  setTimeout(async () => {
    const ex = await db.ttl('name')
    const name = await db.get('name')
    console.log(ex, name)
  }, 2000)
})()