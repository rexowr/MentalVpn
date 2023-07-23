import { Bot, Context, Api, RawApi, InlineQueryResultBuilder } from "grammy"
import { isEmpty } from 'lodash'
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
	extentionServices
} from "./menus"
import { log } from "./logger"
import { db } from "./database/db"
import getUser from "./getUser"
import addServer from "./server"

const token: string = "6374881763:AAEAon5Y1Y5datPTlii27obw5JyANNqJtQU" // set token
type cfg = {
	botDeveloper: number,
	isDeveloper : boolean
}
type config = {
	config: cfg
}

const BOT_DEVELOPER = 1913245253 // sudo id
const bot: Bot<Context & config, Api<RawApi>> = new Bot(token)

// handle menus
indexMenu.register(backMenu)
indexMenu.register(extentionServices)
indexMenu.register(services)
indexMenu.register(servicesLearn)
services.register(selectOperators)
services.register(wifiBtn)
servicesLearn.register(backToLearns)
services.register(selectVless)
services.register(selectOpenConnect)
bot.use(indexMenu)
bot.use(confirmPurchase)


bot.use(async (ctx, next) => {
	// Modify context object here by setting the config.
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
	// console.log(exists, isEmpty(exists))
	if (isEmpty(exists)) {
		await db.hmset(
			userId, {
				id: id,
				name: first_name,
				username: `@${username}` ?? null,
				balance: 0,
			}
		)
		// await db.sadd(`${id}:services:v2ray`, '')
		// await db.sadd(`${id}:services:openconnect`, '')
	}
	await ctx.reply("سلام به ربات فروش v2ray خوش اومدین", {
		reply_markup: indexMenu,
	})
})

bot.hears(/id/, async ctx => {
	console.log(ctx.chat)
	// await ctx.reply(ctx.chat)
})

bot.hears(/\/server (.*)/, async (ctx) => {
	try {
		if (ctx.config.isDeveloper) {
			const [_, server] = ctx.match[0].split(" ")
			const success = await addServer(server)
			if (!success) return await ctx.reply("این سرور از قبل در لیست وجود دارد!")
			await db.sadd("servers", server)
			await ctx.reply("سرور جدید ثبت شد")
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
			console.log(user)
			if (isEmpty(user)) return await ctx.reply("این کاربر در سیستم موجود نمیباشد!")
			user.balance = parseInt(user.balance)
			user.balance += parseInt(amount) 
			await db.hmset(id, user)
			// await db.srem('users', user)
			// await db.sadd("users", JSON.stringify(user))
			await ctx.reply(`حساب کاربری ${id} به مقدار ${parseInt(amount).toLocaleString()} شارژ شد`)
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

bot.on(':photo', async ctx => {
	try {
		const user = ctx.from!
		const step = await db.hget('steps', user.id.toString())
		if(step === 'send_receipt'){
			await ctx.reply('رسید شما دریافت شد و برای پشتیبانی ارسال شد\nحساب شما در اسرع وقت شارژ میشود')
			await db.hset("steps", user.id, '')
      await ctx.api.copyMessage(BOT_DEVELOPER, user.id, ctx.msg.message_id, {
				caption: `**FROM:** \`${user.id}\`
**NAME:** {${user.first_name}}
**USERNAME:** ${"@" + user.username ?? null}
[OPEN CHAT](tg://user?id=${user.id})`,
parse_mode: 'Markdown',
reply_markup: confirmPurchase
			})
		}
	} catch (e) {
		log.error(e)
	}
})

bot.inlineQuery(/say (.*)/, async (ctx) => {
	const {
		match,
	} = ctx
	const [ _, text ] = match![0].split(" ")
	const result = InlineQueryResultBuilder.article("id:res", "HAKEM").text(`Hello ${text!}`)
	await ctx.answerInlineQuery([result])
})

bot.catch(e => console.error(e))

bot.start()
