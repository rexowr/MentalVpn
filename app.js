"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const lodash_1 = require("lodash");
const cron_1 = require("cron");
const menus_1 = require("./src/menus");
const logger_1 = require("./src/logger");
const db_1 = require("./src/database/db");
const getUser_1 = __importDefault(require("./src/getUser"));
const server_1 = require("./src/server");
const expireServices_1 = require("./src/expireServices");
const token = "5413815988:AAGY1_vZkLmUlcjaUrKTJfxOvXNkS3OqycI"; // set token
const BOT_DEVELOPER = 1913245253; // sudo id
const bot = new grammy_1.Bot(token);
const expireTime = 24 * 60 * 60;
// handle menus
menus_1.indexMenu.register(menus_1.backMenu);
menus_1.indexMenu.register(menus_1.extentionServices);
menus_1.indexMenu.register(menus_1.confirmExtendService);
menus_1.indexMenu.register(menus_1.services);
menus_1.indexMenu.register(menus_1.servicesLearn);
menus_1.services.register(menus_1.selectOperators);
menus_1.services.register(menus_1.wifiBtn);
menus_1.servicesLearn.register(menus_1.backToLearns);
menus_1.services.register(menus_1.selectVless);
menus_1.services.register(menus_1.selectOpenConnect);
bot.use(menus_1.indexMenu);
bot.use(menus_1.confirmPurchase);
db_1.db.flushdb();
const cj = new cron_1.CronJob("50 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield db_1.db.smembers("users");
        for (let user of users) {
            const [v2ray, openconnect] = yield Promise.all([
                db_1.db.smembers(`${user}:services:v2ray`),
                db_1.db.smembers(`${user}:services:openconnect`),
            ]);
            const s = yield (0, expireServices_1.getV2rayExpire)(user, v2ray);
            const t = yield (0, expireServices_1.getOpenExpire)(user, openconnect);
            s.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
                const hasSent = yield db_1.db.hget(`${user}:v2ray:${item.server}`, "hasSent");
                if (hasSent) {
                    if (item.expire <= 1800) {
                        yield bot.api.sendMessage(user, `سرور ${item.server} در کمتر از 30 دقیقه منقضی خواهد شد\nدرصورتی که قصد تمدید کردن دارید لطفا در منوی اصلی و در قسمت تمدید اقدام کنید`);
                        db_1.db.hdel(`${user}:v2ray:${item.server}`, "hasSent");
                        return;
                    }
                }
            }));
            t.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
                const hasSent = yield db_1.db.hget(`${user}:openconnect:${item.server}`, "hasSent");
                // console.log(hasSent, item.expire)
                if (hasSent) {
                    if (item.expire <= 1800) {
                        bot.api.sendMessage(user, `کاربر عزیز 30 دقیقه تا منقضی شدن سرور ${item.server} وقت دارید`);
                        db_1.db.hdel(`${user}:openconnect:${item.server}`, "hasSent");
                        return;
                    }
                }
            }));
        }
    }
    catch (e) {
        console.error(e);
    }
}));
cj.start();
bot.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // TODO Modify context object here by setting the config.
    ctx.config = {
        botDeveloper: BOT_DEVELOPER,
        isDeveloper: ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) === BOT_DEVELOPER,
    };
    // Run remaining handlers.
    yield next();
}));
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { id, first_name, username } = ctx.msg.from;
    const userId = id.toString();
    const exists = yield db_1.db.hgetall(id.toString());
    const services = yield db_1.db.smembers(`${id}:services:v2ray`);
    // console.log(services)
    if ((0, lodash_1.isEmpty)(exists)) {
        yield db_1.db.hmset(userId, {
            id: id,
            name: first_name,
            username: (_b = `@${username}`) !== null && _b !== void 0 ? _b : null,
            balance: 0,
        });
        yield db_1.db.sadd("users", userId);
    }
    yield ctx.reply("سلام به ربات فروش v2ray خوش اومدین", {
        reply_markup: menus_1.indexMenu,
    });
}));
bot.hears(/\/discount \d+ \d{7,10}/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.config.isDeveloper) {
            const [_, value, id] = ctx.match[0].split(" ");
            yield db_1.db.hset(id, {
                discount: value,
            });
            yield ctx.reply(`مقدار ${value} تخفیف برای کاربر ${id} ثبت شد`);
            yield ctx.api.sendMessage(id, `کاربر عزیز مقدار ${value} تومان تخفیف برای تمام سرور ها برای شما درنظر گرفته شده و میتوانید هنگام خرید از ان استفاده کنید`);
        }
    }
    catch (e) {
        console.error(e);
    }
}));
bot.hears(/\/v2ray (.*)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.config.isDeveloper) {
            const [_, server] = ctx.match[0].split(" ");
            yield (0, server_1.addV2ray)(server);
            yield ctx.reply("سرور اضافه شد");
        }
    }
    catch (e) {
        logger_1.log.error(e);
    }
}));
bot.hears(/\/open (.*)/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.config.isDeveloper) {
            const [_, server] = ctx.match[0].split(" ");
            yield (0, server_1.addOpenConnect)(server);
            yield ctx.reply("سرور اضافه شد");
        }
    }
    catch (e) {
        logger_1.log.error(e);
    }
}));
bot.hears(/\/amount \d+ \d{7,10}/, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (ctx.config.isDeveloper) {
            const [_, amount, id] = ctx.match[0].split(" ");
            const user = yield (0, getUser_1.default)(parseInt(id));
            // console.log(user)
            if ((0, lodash_1.isEmpty)(user))
                return yield ctx.reply("این کاربر در سیستم موجود نمیباشد!");
            user.balance = parseInt(user.balance);
            user.balance += parseInt(amount);
            yield db_1.db.hmset(id, user);
            // await db.srem('users', user)
            // await db.sadd("users", JSON.stringify(user))
            yield ctx.reply(`حساب کاربری ${id} به مقدار ${parseInt(amount).toLocaleString()} شارژ شد`);
            yield ctx.api.sendMessage(id, `کاربر عزیز حساب شما توسط ادمین به مقدار ${parseInt(amount).toLocaleString()} تومان شارژ شد`);
        }
    }
    catch (e) {
        logger_1.log.error(e);
    }
}));
bot.on(":photo", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const user = ctx.from;
        const step = yield db_1.db.hget("steps", user.id.toString());
        if (step === "send_receipt") {
            yield ctx.reply("رسید شما دریافت شد و برای پشتیبانی ارسال شد\nحساب شما در اسرع وقت شارژ میشود");
            yield db_1.db.hset("steps", user.id, "");
            yield ctx.api.copyMessage(BOT_DEVELOPER, user.id, ctx.msg.message_id, {
                caption: `**FROM:** \`${user.id}\`
**NAME:** {${user.first_name}}
**USERNAME:** ${(_c = "@" + user.username) !== null && _c !== void 0 ? _c : null}
[OPEN CHAT](tg://user?id=${user.id})`,
                parse_mode: "Markdown",
                reply_markup: menus_1.confirmPurchase,
            });
        }
    }
    catch (e) {
        logger_1.log.error(e);
    }
}));
bot.catch((e) => console.error(e));
bot.start();
