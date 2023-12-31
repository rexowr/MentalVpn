import { Bot, Context, Api, RawApi, InlineQueryResultBuilder } from "grammy"
import { isEmpty } from "lodash"
import { CronJob } from "cron"
import {
	indexMenu,
	backMenu,
	services,
	selectVless,
	selectOpenConnect,
	confirmPurchase,
	servicesLearn,
	backToLearns,
	selectOperators,
	wifiBtn,
	extentionServices,
	confirmExtendService,
	confirmExtendServer,
} from "./src/menus"
import { log } from "./src/logger"
import { db } from "./src/database/db"
import getUser from "./src/getUser"
import { addV2ray, addOpenConnect } from "./src/server"
import {
	refreshServices,
	getV2ray,
	getV2rayExpire,
	getOpenExpire,
} from "./src/expireServices"

const token: string = "5413815988:AAHUA0pP-EcpPA2K5sct6qSH_D21Qio8CcU" // set token
type cfg = {
	botDeveloper: number
	isDeveloper: boolean
}
type config = {
	config: cfg
}

const BOT_DEVELOPER = 1913245253 // sudo id
const bot: Bot<Context & config, Api<RawApi>> = new Bot(token)
const expireTime: number = 24 * 60 * 60

// handle menus
indexMenu.register(backMenu)
indexMenu.register(extentionServices)
indexMenu.register(confirmExtendService)
indexMenu.register(confirmExtendServer)
indexMenu.register(services)
indexMenu.register(servicesLearn)
services.register(selectOperators)
services.register(wifiBtn)
servicesLearn.register(backToLearns)
services.register(selectVless)
services.register(selectOpenConnect)
bot.use(indexMenu)
bot.use(confirmPurchase)
// db.flushdb()
interface service_data {
	server: string
	expire: number
}
const cj = new CronJob("50 * * * *", async () => {
	try {
		const users = await db.smembers("users")
		for (let user of users) {
			const [v2ray, openconnect] = await Promise.all([
				db.smembers(`${user}:services:v2ray`),
				db.smembers(`${user}:services:openconnect`),
			])
			const s = await getV2rayExpire(user, v2ray)
			const t = await getOpenExpire(user, openconnect)
			s.forEach(async (item) => {
				const hasSent = await db.hget(`${user}:v2ray:${item.server}`, "hasSent")
				if (hasSent) {
					if (item.expire <= 1800) {
						await bot.api.sendMessage(
							user,
							`سرور ${item.server} در کمتر از 30 دقیقه منقضی خواهد شد\nدرصورتی که قصد تمدید کردن دارید لطفا در منوی اصلی و در قسمت تمدید اقدام کنید`
						)
						db.hdel(`${user}:v2ray:${item.server}`, "hasSent")
						return
					}
				}
			})
			t.forEach(async (item) => {
				const hasSent = await db.hget(
					`${user}:openconnect:${item.server}`,
					"hasSent"
				)
				// console.log(hasSent, item.expire)
				if (hasSent) {
					if (item.expire <= 1800) {
						bot.api.sendMessage(
							user,
							`کاربر عزیز 30 دقیقه تا منقضی شدن سرور ${item.server} وقت دارید`
						)
						db.hdel(`${user}:openconnect:${item.server}`, "hasSent")
						return;
					}
				}
			})
		}
	} catch (e) {
		console.error(e)
	}
})
cj.start()

bot.use(async (ctx, next) => {
	// TODO Modify context object here by setting the config.
	ctx.config = {
		botDeveloper: BOT_DEVELOPER,
		isDeveloper: ctx.from?.id === BOT_DEVELOPER,
	}
	// Run remaining handlers.
	await next()
})

bot.command("start", async (ctx) => {
	const { id, first_name, username } = ctx.msg.from!
	const userId = id.toString()
	const exists = await db.hgetall(id.toString())
	const services = await db.smembers(`${id}:services:v2ray`)
	// console.log(services)
	if (isEmpty(exists)) {
		await db.hmset(userId, {
			id: id,
			name: first_name,
			username: `@${username}` ?? null,
			balance: 0,
		})
		await db.sadd("users", userId)
	}
	await ctx.reply("سلام به ربات فروش v2ray خوش اومدین", {
		reply_markup: indexMenu,
	})
})

bot.hears(/\/discount \d+ \d{7,10}/, async (ctx) => {
	try {
		if (ctx.config.isDeveloper) {
			const [_, value, id] = ctx.match[0].split(" ")
			await db.hset(id, {
				discount: value,
			})
			await ctx.reply(`مقدار ${value} تخفیف برای کاربر ${id} ثبت شد`)
			await ctx.api.sendMessage(
				id,
				`کاربر عزیز مقدار ${value} تومان تخفیف برای تمام سرور ها برای شما درنظر گرفته شده و میتوانید هنگام خرید از ان استفاده کنید`
			)
		}
	} catch (e) {
		console.error(e)
	}
})

bot.hears(/\/v2ray (.*)/, async (ctx) => {
	try {
		if (ctx.config.isDeveloper) {
			const [_, server] = ctx.match[0].split(" ")
			await addV2ray(server)
			await ctx.reply("سرور اضافه شد")
		}
	} catch (e) {
		log.error(e)
	}
})
bot.hears(/\/open (.*)/, async (ctx) => {
	try {
		if (ctx.config.isDeveloper) {
			const [_, server] = ctx.match[0].split(" ")
			await addOpenConnect(server)
			await ctx.reply("سرور اضافه شد")
		}
	} catch (e) {
		log.error(e)
	}
})

bot.hears(/\/amount \d+ \d{7,10}/, async (ctx) => {
	try {
		if (ctx.config.isDeveloper) {
			const [_, amount, id] = ctx.match[0].split(" ")
			const user = await getUser(parseInt(id))
			// console.log(user)
			if (isEmpty(user))
				return await ctx.reply("این کاربر در سیستم موجود نمیباشد!")
			user.balance = parseInt(user.balance)
			user.balance += parseInt(amount)
			await db.hmset(id, user)
			// await db.srem('users', user)
			// await db.sadd("users", JSON.stringify(user))
			await ctx.reply(
				`حساب کاربری ${id} به مقدار ${parseInt(amount).toLocaleString()} شارژ شد`
			)
			await ctx.api.sendMessage(
				id,
				`کاربر عزیز حساب شما توسط ادمین به مقدار ${parseInt(
					amount
				).toLocaleString()} تومان شارژ شد`
			)
		}
	} catch (e) {
		log.error(e)
	}
})

bot.on(":photo", async (ctx) => {
	try {
		const user = ctx.from!
		const step = await db.hget("steps", user.id.toString())
		if (step === "send_receipt") {
			await ctx.reply(
				"رسید شما دریافت شد و برای پشتیبانی ارسال شد\nحساب شما در اسرع وقت شارژ میشود"
			)
			await db.hset("steps", user.id, "")
			await ctx.api.copyMessage(BOT_DEVELOPER, user.id, ctx.msg.message_id, {
				caption: `**FROM:** \`${user.id}\`
**NAME:** {${user.first_name}}
**USERNAME:** ${"@" + user.username ?? null}
[OPEN CHAT](tg://user?id=${user.id})`,
				parse_mode: "Markdown",
				reply_markup: confirmPurchase,
			})
		}
	} catch (e) {
		log.error(e)
	}
})

bot.catch((e) => console.error(e))
bot.start()
