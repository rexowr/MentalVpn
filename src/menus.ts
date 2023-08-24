import qrcode from "qrcode"
import { Menu, MenuRange } from "@grammyjs/menu"
import { Context, InputFile } from "grammy"
import { readFile, writeFile } from "fs/promises"
import { isEmpty, sample } from "lodash"
import { db } from "./database/db"
import getUser from "./getUser"
import remove from "./remove"
import { error } from "console"

const BOT_DEVELOPER = 1913245253 // sudo id
const channelId: number = -1001561327673
const oneMonth = 30 * 24 * 60 * 60
const threeMonth = 60 * 24 * 60 * 60
const twoHours = (60 * 60) * 2

const indexMenu: Menu<Context> = new Menu("index-menu", {
	onMenuOutdated: "retry!",
})
	.text("تمدید", async (ctx) => {
		const id = ctx.from?.id
		const v2ray = await db.smembers(`${id}:services:v2ray`)
		const openconnect = await db.smembers(`${id}:services:openconnect`)
		if (isEmpty(v2ray) && isEmpty(openconnect)) {
			return await ctx.editMessageText("شما هیچ سرویس فعالی ندارید", {
				reply_markup: backMenu,
			})
		}
		await ctx.editMessageText("لطفا سرویس موردنظر را انتخاب کنید", {
			reply_markup: extentionServices,
		})
	})
	.text("خرید کانفیگ", (ctx) => {
		ctx.editMessageText("لطفا انتخاب کنید", {
			reply_markup: services,
		})
	})
	.row()
	.text("شارژ حساب", async (ctx) => {
		const id = ctx.from?.id
		await db.hset("steps", id, "send_receipt")
		await ctx.editMessageText(
			"برای شارژ حساب مبلغ مورد نظر را به شماره حساب\n6037991940453214\nبنام محمدرضا نورحسینی واریز کرده و عکس رسید را ارسال کنید\nدقت کنید که فقط عکس رسید رو ارسال کنین متن و ... قابل قبول نیست\nاز ارسال رسید فیک خودداری کنید",
			{
				reply_markup: backMenu,
			}
		)
	})
	.text("کیف پول", async (ctx) => {
		try {
			// const data = await db.hgetall(ctx.from?.id)
			const user = await getUser(ctx.from?.id)
			ctx.editMessageText(
				`جزئیات حساب شما
**ID:** \`${user.id}\`
**NAME:** \`${user.name}\`
**USERNAME:** \`${user.username}\`
**BALANCE:** \`$${parseInt(user.balance).toLocaleString()}\``,
				{
					reply_markup: backMenu,
					parse_mode: "Markdown",
				}
			)
		} catch (e) {
			await ctx.reply("مشکل فنی پیش اومده")
			console.error(e)
		}
	})
	.row()
	.text("سرویس های من", async (ctx) => {
		const id = ctx.from?.id
		const v2ray = await db.smembers(`${id}:services:v2ray`)
		const openconnect = await db.smembers(`${id}:services:openconnect`)
		// console.log(v2ray, openconnect)
		if (isEmpty(v2ray) && isEmpty(openconnect)) {
			return await ctx.editMessageText("شما هیچ سرویس فعالی ندارید", {
				reply_markup: backMenu,
			})
		}
		await ctx.editMessageText(
			`V2RAY:\n${v2ray.join(
				"\n"
			)}\n------------\nOPEN-CONNECT:\n${openconnect.join("\n")}`,
			{
				reply_markup: backMenu,
			}
		)
	})
	.row()
	.text("آموزش سرویس", async (ctx) => {
		await ctx.editMessageText("لطفا انتخاب کنید", {
			reply_markup: servicesLearn,
		})
	})
	.text("پشتیبانی", async (ctx) => {
		await ctx.editMessageText("@mrezadonjane | @ilz5753", {
			reply_markup: backMenu,
		})
	})

const extentionServices = new Menu("dynamic")
	.dynamic(async (ctx) => {
		const id = ctx.from?.id
		const v2ray = await db.smembers(`${id}:services:v2ray`)
		const openconnect = await db.smembers(`${id}:services:openconnect`)
		const servers = [...v2ray, ...openconnect]
		const range = new MenuRange()
		for (let server of servers) {
			range
				.text(server, async (ct) => {
					await ct.editMessageText(`شما درخواست تمدید سرور\n${server}\nرا دارید`, {
						reply_markup: confirmExtendService,
					})
					await db.hset(id!.toString(), {
						extendedService: server,
					})
				})
				.row()
		}
		return range
	})
	.back("بازگشت")

const confirmExtendService = new Menu("confirm-extend")
	.text("تایید", async (ctx) => {
		try {
			const id = ctx.from?.id
			const server = await db.hget(id!.toString(), "extendedService")
			if (server) {
				//TODO send request to extend service and wait for response from admin
				await db.del(id!.toString()) //delete data in redis after sending the message successfully
				await ctx.editMessageText(
					"درخواست تمدید شما با موفقیت برای پشتیبانی ارسال شد\nپس از بررسی های لازم و پرداخت هزینه سرور شما تمدید میشود",
					{
						reply_markup: backMenu,
					}
				)
				// console.log(id)
				await ctx.api.sendMessage(
					BOT_DEVELOPER,
					`کاربر ${id} قصد تمدید کردن سرور زیر را دارد:\n${server}\n[بازکردن صفحه چت کاربر](tg://user?id=${id})`,
					{
						parse_mode: "Markdown",
					}
				)
			}
		} catch (e) {
			console.error(e)
		}
	})
	.row()
	.back("بازگشت", async (ctx) => {
		await ctx.editMessageText("شما به منوی اصلی بازگشتید")
	})

const servicesLearn = new Menu("learn-menu")
	.text("اندروید", async (ctx) => {
		const msgs: number[] = [5, 6, 8, 9, 10, 11]
		for (let msg of msgs) {
			setTimeout(async () => {
				await ctx.api.copyMessage(ctx.from.id, channelId, msg)
			}, 500)
		}
	})
	.text("ایفون", async (ctx) => {
		const msgs: number[] = [12, 13]
		for (let msg of msgs) {
			setTimeout(async () => {
				await ctx.api.copyMessage(ctx.from.id, channelId, msg)
			}, 500)
		}
	})
	.row()
	.text("ویندوز", async (ctx) => {
		const msgs: number[] = [14, 15]
		for (let msg of msgs) {
			setTimeout(async () => {
				await ctx.api.copyMessage(ctx.from.id, channelId, msg)
			}, 500)
		}
	})
	.text(
		"مک",
		async (ctx) =>
			await ctx.editMessageText("فعلا اموزشی برای مک موجود نیست", {
				reply_markup: backToLearns,
			})
	)
	.row()
	.back("بازگشت")

const backToLearns = new Menu("back-to-learn").back("بازگشت", async (ctx) => {
	await ctx.editMessageText("لطفا انتخاب کنید")
	const id = ctx.from?.id
	await db.hset("steps", id, "")
})

const services: Menu<Context> = new Menu("services-menu", {
	onMenuOutdated: "retry!",
})
	.text("V2RAY IP SABET", async (ctx) => {
		try {
			await ctx.editMessageText("لطفا با ادمین از قسمت پشتیبانی در تماس باشید", {
				reply_markup: backMenu
			})
			// await ctx.editMessageText("لطفا انتخاب کنید", {
			// 	reply_markup: selectOperators,
			// })
		} catch (e) {
			console.error(e)
		}
	})
	.text(
		"V2RAY",
		async (ctx) =>
			await ctx.editMessageText("لطفا با ادمین از قسمت پشتیبانی در تماس باشید", {
				reply_markup: backMenu
			})
			// await ctx.editMessageText(
			// 	"در گیلان و مازندران فقط برای اندروید و ویندوز مناسب است",
			// 	{
			// 		reply_markup: selectVless,
			// 	}
			// )
	)
	.row()
	.text(
		"OPEN CONNECT",
		async (ctx) =>
			await ctx.editMessageText("به بعضی وایفای ها ممکن است وصل نشود", {
				reply_markup: selectOpenConnect,
			})
	)
	.row()
	.back(
		"بازگشت",
		async (ctx) => await ctx.editMessageText("شما به منوی اصلی بازگشتید")
	)

const selectOperators = new Menu("select-operators")
	.text("ایرانسل و رایتل", async (ctx) => {
		try {
			await ctx.editMessageText("لطفا انتخاب کنید", {
				reply_markup: wifiBtn,
			})
		} catch (e) {
			console.error(e)
		}
	})
	.row()
	.text("همراه اول", async (ctx) => {
		try {
			await ctx.editMessageText("فقط با برنامه NapsternetV سازگار است", {
				reply_markup: wifiBtn,
			})
		} catch (e) {
			console.error(e)
		}
	})
	.row()
	.back("بازگشت", async (ctx) => {
		await ctx.editMessageText("لطفا انتخاب کنید")
	})

const wifiBtn = new Menu("wifi-btn")
	.text("50 گیگ 30 روزه 2 کاربره 90تومن", async (ctx) => {
		try {
			const id: string = ctx.from?.id.toString()
			const file = await readFile("./src/v2ray.txt", {
				encoding: "utf-8",
			})
			const rawBalance = await db.hget(id, "balance")
			const balance = parseInt(rawBalance ?? "0")
			const rawDiscount = await db.hget(id, "discount")
			const discount = parseInt(rawDiscount ?? "0")
			let price = discount ? 90000 - discount : 90000
			if (isEmpty(file)) {
				return await ctx.editMessageText(
					"هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید",
					{
						reply_markup: backMenu,
					}
				)
			}
			if (balance >= price && file) {
				await ctx.reply(
					"شما سرویس 50 گیگ دوکاربره 1 ماهه 90تومن را انتخاب کرده اید"
				)
				const content = file.split("\n").map((item) => item.replace("\r", ""))
				const server = sample(content)!
				const qr = await qrcode.toDataURL(server)
				let base64Image = qr.split(";base64,").pop()
				await writeFile("./imagev2.png", base64Image!, {
					encoding: "base64",
				})
				await ctx.replyWithPhoto(new InputFile("./imagev2.png"), {
					caption: `LINK: ${server}`,
				})
				let s = remove(content, server)
				await writeFile("./v2ray.txt", s.join("\n"))
				await db.hmset(id, {
					balance: balance - price,
				})
				// console.log(await db.hgetall(id))
				await db.sadd(`${id}:services:v2ray`, server)
				await db.hset(`${id}:v2ray:${server}`, {
					hasSent: false,
				})
				await db.expire(`${id}:v2ray:${server}`, 30)
			} else {
				await ctx.editMessageText("موجودی شما کافی نیست", {
					reply_markup: backMenu,
				})
			}
		} catch (e) {
			await ctx.reply("مشکل فنی پیش اومده")
			console.error(e)
		}
	})
	.row()
	.back("بازگشت", async (ctx) => {
		await ctx.editMessageText("لطفا انتخاب کنید")
	})

const backMenu: Menu<Context> = new Menu("back-menu", {
	onMenuOutdated: "retry!",
}).back("بازگشت", async (ctx) => {
	try {
		const id = ctx.from?.id
		await db.hset("steps", id, "")
		await ctx.editMessageText("به منوی اصلی بازگشتید")
	} catch (e) {
		console.error(e)
	}
})

const selectOpenConnect: Menu<Context> = new Menu("select-openconnect")
	.text("50 گیگ دوکاربره 1 ماهه 90تومن", async (ctx) => {
		try {
			const id: string = ctx.from?.id.toString()
			const file = await readFile("./src/passwords.txt", {
				encoding: "utf-8",
			})
			const rawBalance = await db.hget(id, "balance")
			const balance = parseInt(rawBalance ?? "0")
			const rawDiscount = await db.hget(id, "discount")
			const discount = parseInt(rawDiscount ?? "0")
			let price = discount ? 90000 - discount : 90000
			if (isEmpty(file)) {
				return await ctx.editMessageText(
					"هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید",
					{
						reply_markup: backMenu,
					}
				)
			}
			if (balance >= price && file) {
				await ctx.reply(
					"شما سرویس 50 گیگ دوکاربره 1 ماهه 90تومن را انتخاب کرده اید"
				)
				const content = file.split("\n").map((item) => item.replace("\r", ""))
				const server = sample(content)!
				const qr = await qrcode.toDataURL(server)
				let base64Image = qr.split(";base64,").pop()
				await writeFile("./image.png", base64Image!, {
					encoding: "base64",
				})
				await ctx.replyWithPhoto(new InputFile("./image.png"), {
					caption: `PASSWORD: ${server}`,
				})
				let s = remove(content, server)
				await writeFile("./passwords.txt", s.join("\n"))
				await db.hmset(id, {
					balance: balance - price,
				})
				await db.sadd(`${id}:services:openconnect`, server)
				await db.hset(`${id}:openconnect:${server}`, {
					hasSent: false,
				})
				await db.expire(`${id}:openconnect:${server}`, twoHours)
			} else {
				await ctx.editMessageText("موجودی شما کافی نیست", {
					reply_markup: backMenu,
				})
			}
		} catch (e) {
			await ctx.reply("مشکل فنی پیش اومده")
			console.error(error)
		}
	})
	.row()
	.text("150 گیگ دوکاربره 3 ماهه 360تومن", async (ctx) => {
		try {
			const id: string = ctx.from?.id.toString()
			const file = await readFile("./src/passwords.txt", {
				encoding: "utf-8",
			})
			const rawBalance = await db.hget(id, "balance")
			const balance = parseInt(rawBalance ?? "0")
			const rawDiscount = await db.hget(id, "discount")
			const discount = parseInt(rawDiscount ?? "0")
			let price = discount ? 360000 - discount : 360000
			if (isEmpty(file)) {
				return await ctx.editMessageText(
					"هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید",
					{
						reply_markup: backMenu,
					}
				)
			}
			if (balance >= price && file) {
				await ctx.reply(
					"شما سرویس 150 گیگ دوکاربره 3 ماهه 360تومن را انتخاب کرده اید"
				)
				const content = file.split("\n").map((item) => item.replace("\r", ""))
				const server = sample(content)!
				const qr = await qrcode.toDataURL(server)
				let base64Image = qr.split(";base64,").pop()
				await writeFile("./image.png", base64Image!, {
					encoding: "base64",
				})
				await ctx.replyWithPhoto(new InputFile("./image.png"), {
					caption: `PASSWORD: ${server}`,
				})
				let s = remove(content, server)
				await writeFile("./passwords.txt", s.join("\n"))
				await db.hset(id, {
					balance: balance - price,
				})
				await db.sadd(`${id}:services:openconnect`, server)
				await db.hset(`${id}:openconnect:${server}`, {
					hasSent: false,
				})
				await db.expire(`${id}:openconnect:${server}`, twoHours)
			} else {
				await ctx.editMessageText("موجودی شما کافی نیست", {
					reply_markup: backMenu,
				})
			}
		} catch (error) {
			await ctx.reply("مشکل فنی پیش اومده")
			console.error(error)
		}
	})
	.row()
	.back("بازگشت", (ctx) => ctx.editMessageText("لطفا انتخاب کنید"))

const selectVless: Menu<Context> = new Menu("select-vless", {
	onMenuOutdated: "retry!",
})
	.text(" 50 گیگ دوکاربره 1 ماهه 80تومن ", async (ctx) => {
		try {
			const id: string = ctx.from?.id.toString()
			const file = await readFile("./src/v2ray.txt", {
				encoding: "utf-8",
			})
			const rawBalance = await db.hget(id, "balance")
			const balance = parseInt(rawBalance ?? "0")
			const rawDiscount = await db.hget(id, "discount")
			const discount = parseInt(rawDiscount ?? "0")
			let price = discount ? 80000 - discount : 80000
			if (isEmpty(file)) {
				return await ctx.editMessageText(
					"هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید",
					{
						reply_markup: backMenu,
					}
				)
			}
			if (balance >= price && file) {
				await ctx.reply(
					"شما سرویس 50 گیگ دوکاربره 1 ماهه 80تومن را انتخاب کرده اید"
				)
				const content = file.split("\n").map((item) => item.replace("\r", ""))
				const server = sample(content)!
				const qr = await qrcode.toDataURL(server)
				let base64Image = qr.split(";base64,").pop()
				await writeFile("./imagev2.png", base64Image!, {
					encoding: "base64",
				})
				await ctx.replyWithPhoto(new InputFile("./imagev2.png"), {
					caption: `LINK: ${server}`,
				})
				let s = remove(content, server)
				await writeFile("./v2ray.txt", s.join("\n"))
				await db.hset(id, {
					balance: balance - price,
				})
				await db.sadd(`${id}:services:v2ray`, server)
				await db.hset(`${id}:v2ray:${server}`, {
					hasSent: false,
				})
				await db.expire(`${id}:v2ray:${server}`, twoHours)
			} else {
				await ctx.editMessageText("موجودی شما کافی نیست", {
					reply_markup: backMenu,
				})
			}
		} catch (error) {
			console.error(error)
		}
	})
	.row()
	.text(" 150 گیگ دوکاربره 3 ماهه 230تومن ", async (ctx) => {
		try {
			const id: string = ctx.from?.id.toString()
			const file = await readFile("./src/v2ray.txt", {
				encoding: "utf-8",
			})
			const rawBalance = await db.hget(id, "balance")
			const balance = parseInt(rawBalance ?? "0")
			const rawDiscount = await db.hget(id, "discount")
			const discount = parseInt(rawDiscount ?? "0")
			let price = discount ? 230000 - discount : 230000
			if (isEmpty(file)) {
				return await ctx.editMessageText(
					"هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید",
					{
						reply_markup: backMenu,
					}
				)
			}
			if (balance >= price && file) {
				await ctx.reply(
					"شما سرویس 150 گیگ دوکاربره 3 ماهه 230تومن را انتخاب کرده اید"
				)
				const content = file.split("\n").map((item) => item.replace("\r", ""))
				const server = sample(content)!
				const qr = await qrcode.toDataURL(server)
				let base64Image = qr.split(";base64,").pop()
				await writeFile("./imagev2.png", base64Image!, {
					encoding: "base64",
				})
				await ctx.replyWithPhoto(new InputFile("./imagev2.png"), {
					caption: `LINK: ${server}`,
				})
				let s = remove(content, server)
				await writeFile("./v2ray.txt", s.join("\n"))
				await db.hset(id, {
					balance: balance - price,
				})
				await db.sadd(`${id}:services:v2ray`, server)
				await db.hset(`${id}:v2ray:${server}`, {
					hasSent: false,
				})
				await db.expire(`${id}:v2ray:${server}`, twoHours)
			} else {
				await ctx.editMessageText("موجودی شما کافی نیست", {
					reply_markup: backMenu,
				})
			}
		} catch (error) {
			console.error(error)
		}
	})
	.row()
	.back("بازگشت", (ctx) => ctx.editMessageText("لطفا انتخاب کنید"))

const confirmPurchase = new Menu("confirm-purchase", {
	onMenuOutdated: "retry!",
})
	.text("تایید رسید", async (ctx) => {
		try {
			if (ctx.from.id === BOT_DEVELOPER) {
				const caption = ctx.msg?.caption
				const pattern = /\b\d{7,10}\b/
				const id = caption?.match(pattern)
				if (id) {
					await ctx.deleteMessage()
					await ctx.reply("انجام شد")
					await ctx.api.sendMessage(
						id![0],
						"رسید شما تایید شد لطفا به قسمت خرید کانفیگ برگردید و خرید خودتون رو انجام بدید"
					)
				}
			}
		} catch (e) {
			console.error(e)
		}
	})
	.row()
	.text("عدم تایید", async (ctx) => {
		try {
			if (ctx.from.id === BOT_DEVELOPER) {
				const caption = ctx.msg?.caption
				const pattern = /\b\d{7,10}\b/
				const id = caption?.match(pattern)
				if (id) {
					await ctx.deleteMessage()
					await ctx.reply("انجام شد")
					await ctx.api.sendMessage(
						id![0],
						"رسید شما تایید نشد لطفا با پشتیبانی در تماس باشید"
					)
				}
			}
		} catch (e) {
			console.error(e)
		}
	})

export {
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
}
