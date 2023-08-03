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
exports.confirmExtendService = exports.extentionServices = exports.wifiBtn = exports.selectOperators = exports.backToLearns = exports.servicesLearn = exports.confirmPurchase = exports.selectOpenConnect = exports.selectVless = exports.services = exports.backMenu = exports.indexMenu = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const menu_1 = require("@grammyjs/menu");
const grammy_1 = require("grammy");
const promises_1 = require("fs/promises");
const lodash_1 = require("lodash");
const db_1 = require("./database/db");
const getUser_1 = __importDefault(require("./getUser"));
const remove_1 = __importDefault(require("./remove"));
const console_1 = require("console");
const BOT_DEVELOPER = 1913245253; // sudo id
const channelId = -1001561327673;
const oneMonth = 30 * 24 * 60 * 60;
const threeMonth = 60 * 24 * 60 * 60;
const indexMenu = new menu_1.Menu("index-menu", {
    onMenuOutdated: "retry!",
})
    .text("تمدید", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    const v2ray = yield db_1.db.smembers(`${id}:services:v2ray`);
    const openconnect = yield db_1.db.smembers(`${id}:services:openconnect`);
    if ((0, lodash_1.isEmpty)(v2ray) && (0, lodash_1.isEmpty)(openconnect)) {
        return yield ctx.editMessageText("شما هیچ سرویس فعالی ندارید", {
            reply_markup: backMenu,
        });
    }
    yield ctx.editMessageText("لطفا سرویس موردنظر را انتخاب کنید", {
        reply_markup: extentionServices,
    });
}))
    .text("خرید کانفیگ", (ctx) => {
    ctx.editMessageText("لطفا انتخاب کنید", {
        reply_markup: services,
    });
})
    .row()
    .text("شارژ حساب", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const id = (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id;
    yield db_1.db.hset("steps", id, "send_receipt");
    yield ctx.editMessageText("برای شارژ حساب مبلغ مورد نظر را به شماره حساب\n6037991940453214\nبنام محمدرضا نورحسینی واریز کرده و عکس رسید را ارسال کنید\nدقت کنید که فقط عکس رسید رو ارسال کنین متن و ... قابل قبول نیست\nاز ارسال رسید فیک خودداری کنید", {
        reply_markup: backMenu,
    });
}))
    .text("کیف پول", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        // const data = await db.hgetall(ctx.from?.id)
        const user = yield (0, getUser_1.default)((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id);
        ctx.editMessageText(`جزئیات حساب شما
**ID:** \`${user.id}\`
**NAME:** \`${user.name}\`
**USERNAME:** \`${user.username}\`
**BALANCE:** \`$${parseInt(user.balance).toLocaleString()}\``, {
            reply_markup: backMenu,
            parse_mode: "Markdown",
        });
    }
    catch (e) {
        yield ctx.reply("مشکل فنی پیش اومده");
        console.error(e);
    }
}))
    .row()
    .text("سرویس های من", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const id = (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id;
    const v2ray = yield db_1.db.smembers(`${id}:services:v2ray`);
    const openconnect = yield db_1.db.smembers(`${id}:services:openconnect`);
    // console.log(v2ray, openconnect)
    if ((0, lodash_1.isEmpty)(v2ray) && (0, lodash_1.isEmpty)(openconnect)) {
        return yield ctx.editMessageText("شما هیچ سرویس فعالی ندارید", {
            reply_markup: backMenu,
        });
    }
    yield ctx.editMessageText(`V2RAY:\n${v2ray.join("\n")}\n------------\nOPEN-CONNECT:\n${openconnect.join("\n")}`, {
        reply_markup: backMenu,
    });
}))
    .row()
    .text("آموزش سرویس", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageText("لطفا انتخاب کنید", {
        reply_markup: servicesLearn,
    });
}))
    .text("پشتیبانی", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageText("@mrezadonjane | @ilz5753", {
        reply_markup: backMenu,
    });
}));
exports.indexMenu = indexMenu;
const extentionServices = new menu_1.Menu("dynamic")
    .dynamic((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const id = (_e = ctx.from) === null || _e === void 0 ? void 0 : _e.id;
    const v2ray = yield db_1.db.smembers(`${id}:services:v2ray`);
    const openconnect = yield db_1.db.smembers(`${id}:services:openconnect`);
    const servers = [...v2ray, ...openconnect];
    const range = new menu_1.MenuRange();
    for (let server of servers) {
        range
            .text(server, (ct) => __awaiter(void 0, void 0, void 0, function* () {
            yield ct.editMessageText(`شما درخواست تمدید سرور\n${server}\nرا دارید`, {
                reply_markup: confirmExtendService,
            });
            yield db_1.db.hset(id.toString(), {
                extendedService: server,
            });
        }))
            .row();
    }
    return range;
}))
    .back("بازگشت");
exports.extentionServices = extentionServices;
const confirmExtendService = new menu_1.Menu("confirm-extend")
    .text("تایید", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        const id = (_f = ctx.from) === null || _f === void 0 ? void 0 : _f.id;
        const server = yield db_1.db.hget(id.toString(), "extendedService");
        if (server) {
            //TODO send request to extend service and wait for response from admin
            yield db_1.db.del(id.toString()); //delete data in redis after sending the message successfully
            yield ctx.editMessageText("درخواست تمدید شما با موفقیت برای پشتیبانی ارسال شد\nپس از بررسی های لازم و پرداخت هزینه سرور شما تمدید میشود", {
                reply_markup: backMenu,
            });
            console.log(id);
            yield ctx.api.sendMessage(BOT_DEVELOPER, `کاربر ${id} قصد تمدید کردن سرور زیر را دارد:\n${server}\n[بازکردن صفحه چت کاربر](tg://user?id=${id})`, {
                parse_mode: "Markdown",
            });
        }
    }
    catch (e) {
        console.error(e);
    }
}))
    .row()
    .back("بازگشت", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageText("شما به منوی اصلی بازگشتید");
}));
exports.confirmExtendService = confirmExtendService;
const servicesLearn = new menu_1.Menu("learn-menu")
    .text("اندروید", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const msgs = [5, 6, 8, 9, 10, 11];
    for (let msg of msgs) {
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.api.copyMessage(ctx.from.id, channelId, msg);
        }), 500);
    }
}))
    .text("ایفون", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const msgs = [12, 13];
    for (let msg of msgs) {
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.api.copyMessage(ctx.from.id, channelId, msg);
        }), 500);
    }
}))
    .row()
    .text("ویندوز", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const msgs = [14, 15];
    for (let msg of msgs) {
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.api.copyMessage(ctx.from.id, channelId, msg);
        }), 500);
    }
}))
    .text("مک", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.editMessageText("فعلا اموزشی برای مک موجود نیست", {
        reply_markup: backToLearns,
    });
}))
    .row()
    .back("بازگشت");
exports.servicesLearn = servicesLearn;
const backToLearns = new menu_1.Menu("back-to-learn").back("بازگشت", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    yield ctx.editMessageText("لطفا انتخاب کنید");
    const id = (_g = ctx.from) === null || _g === void 0 ? void 0 : _g.id;
    yield db_1.db.hset("steps", id, "");
}));
exports.backToLearns = backToLearns;
const services = new menu_1.Menu("services-menu", {
    onMenuOutdated: "retry!",
})
    .text("V2RAY IP SABET", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.editMessageText("لطفا انتخاب کنید", {
            reply_markup: selectOperators,
        });
    }
    catch (e) {
        console.error(e);
    }
}))
    .text("V2RAY", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.editMessageText("در گیلان و مازندران فقط برای اندروید و ویندوز مناسب است", {
        reply_markup: selectVless,
    });
}))
    .row()
    .text("OPEN CONNECT", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.editMessageText("به بعضی وایفای ها ممکن است وصل نشود", {
        reply_markup: selectOpenConnect,
    });
}))
    .row()
    .back("بازگشت", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.editMessageText("شما به منوی اصلی بازگشتید"); }));
exports.services = services;
const selectOperators = new menu_1.Menu("select-operators")
    .text("ایرانسل و رایتل", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.editMessageText("لطفا انتخاب کنید", {
            reply_markup: wifiBtn,
        });
    }
    catch (e) {
        console.error(e);
    }
}))
    .row()
    .text("همراه اول", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ctx.editMessageText("فقط با برنامه NapsternetV سازگار است", {
            reply_markup: wifiBtn,
        });
    }
    catch (e) {
        console.error(e);
    }
}))
    .row()
    .back("بازگشت", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageText("لطفا انتخاب کنید");
}));
exports.selectOperators = selectOperators;
const wifiBtn = new menu_1.Menu("wifi-btn")
    .text("50 گیگ 30 روزه 2 کاربره 90تومن", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const id = (_h = ctx.from) === null || _h === void 0 ? void 0 : _h.id.toString();
        const file = yield (0, promises_1.readFile)("./src/v2ray.txt", {
            encoding: "utf-8",
        });
        const rawBalance = yield db_1.db.hget(id, "balance");
        const balance = parseInt(rawBalance !== null && rawBalance !== void 0 ? rawBalance : "0");
        const rawDiscount = yield db_1.db.hget(id, "discount");
        const discount = parseInt(rawDiscount !== null && rawDiscount !== void 0 ? rawDiscount : "0");
        let price = discount ? 90000 - discount : 90000;
        if ((0, lodash_1.isEmpty)(file)) {
            return yield ctx.editMessageText("هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید", {
                reply_markup: backMenu,
            });
        }
        if (balance >= price && file) {
            yield ctx.reply("شما سرویس 50 گیگ دوکاربره 1 ماهه 90تومن را انتخاب کرده اید");
            const content = file.split("\n").map((item) => item.replace("\r", ""));
            const server = (0, lodash_1.sample)(content);
            const qr = yield qrcode_1.default.toDataURL(server);
            let base64Image = qr.split(";base64,").pop();
            yield (0, promises_1.writeFile)("./imagev2.png", base64Image, {
                encoding: "base64",
            });
            yield ctx.replyWithPhoto(new grammy_1.InputFile("./imagev2.png"), {
                caption: `LINK: ${server}`,
            });
            let s = (0, remove_1.default)(content, server);
            yield (0, promises_1.writeFile)("./v2ray.txt", s.join("\n"));
            yield db_1.db.hmset(id, {
                balance: balance - price,
            });
            // console.log(await db.hgetall(id))
            yield db_1.db.sadd(`${id}:services:v2ray`, server);
            // await db.hset(`${id}:v2ray:${server}`, {
            // 	expire: oneMonth,
            // })
            yield db_1.db.expire(`${id}:v2ray:${server}`, oneMonth);
        }
        else {
            yield ctx.editMessageText("موجودی شما کافی نیست", {
                reply_markup: backMenu,
            });
        }
    }
    catch (e) {
        yield ctx.reply("مشکل فنی پیش اومده");
        console.error(e);
    }
}))
    .row()
    .back("بازگشت", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageText("لطفا انتخاب کنید");
}));
exports.wifiBtn = wifiBtn;
const backMenu = new menu_1.Menu("back-menu", {
    onMenuOutdated: "retry!",
}).back("بازگشت", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        const id = (_j = ctx.from) === null || _j === void 0 ? void 0 : _j.id;
        yield db_1.db.hset("steps", id, "");
        yield ctx.editMessageText("به منوی اصلی بازگشتید");
    }
    catch (e) {
        console.error(e);
    }
}));
exports.backMenu = backMenu;
const selectOpenConnect = new menu_1.Menu("select-openconnect")
    .text("50 گیگ دوکاربره 1 ماهه 90تومن", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    try {
        const id = (_k = ctx.from) === null || _k === void 0 ? void 0 : _k.id.toString();
        const file = yield (0, promises_1.readFile)("./src/passwords.txt", {
            encoding: "utf-8",
        });
        const rawBalance = yield db_1.db.hget(id, "balance");
        const balance = parseInt(rawBalance !== null && rawBalance !== void 0 ? rawBalance : "0");
        const rawDiscount = yield db_1.db.hget(id, "discount");
        const discount = parseInt(rawDiscount !== null && rawDiscount !== void 0 ? rawDiscount : "0");
        let price = discount ? 90000 - discount : 90000;
        if ((0, lodash_1.isEmpty)(file)) {
            return yield ctx.editMessageText("هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید", {
                reply_markup: backMenu,
            });
        }
        if (balance >= discount && file) {
            yield ctx.reply("شما سرویس 50 گیگ دوکاربره 1 ماهه 90تومن را انتخاب کرده اید");
            const content = file.split("\n").map((item) => item.replace("\r", ""));
            const server = (0, lodash_1.sample)(content);
            const qr = yield qrcode_1.default.toDataURL(server);
            let base64Image = qr.split(";base64,").pop();
            yield (0, promises_1.writeFile)("./image.png", base64Image, {
                encoding: "base64",
            });
            yield ctx.replyWithPhoto(new grammy_1.InputFile("./image.png"), {
                caption: `PASSWORD: ${server}`,
            });
            let s = (0, remove_1.default)(content, server);
            yield (0, promises_1.writeFile)("./passwords.txt", s.join("\n"));
            yield db_1.db.hmset(id, {
                balance: balance - price,
            });
            yield db_1.db.sadd(`${id}:services:openconnect`, server);
            yield db_1.db.hset(`${id}:openconnect:${server}`, {
                expire: oneMonth,
            });
            yield db_1.db.expire(`${id}:openconnect:${server}`, oneMonth);
        }
        else {
            yield ctx.editMessageText("موجودی شما کافی نیست", {
                reply_markup: backMenu,
            });
        }
    }
    catch (e) {
        yield ctx.reply("مشکل فنی پیش اومده");
        console.error(console_1.error);
    }
}))
    .row()
    .text("150 گیگ دوکاربره 3 ماهه 360تومن", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    try {
        const id = (_l = ctx.from) === null || _l === void 0 ? void 0 : _l.id.toString();
        const file = yield (0, promises_1.readFile)("./src/passwords.txt", {
            encoding: "utf-8",
        });
        const rawBalance = yield db_1.db.hget(id, "balance");
        const balance = parseInt(rawBalance !== null && rawBalance !== void 0 ? rawBalance : "0");
        const rawDiscount = yield db_1.db.hget(id, "discount");
        const discount = parseInt(rawDiscount !== null && rawDiscount !== void 0 ? rawDiscount : "0");
        let price = discount ? 360000 - discount : 360000;
        if ((0, lodash_1.isEmpty)(file)) {
            return yield ctx.editMessageText("هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید", {
                reply_markup: backMenu,
            });
        }
        if (balance >= price && file) {
            yield ctx.reply("شما سرویس 150 گیگ دوکاربره 3 ماهه 360تومن را انتخاب کرده اید");
            const content = file.split("\n").map((item) => item.replace("\r", ""));
            const server = (0, lodash_1.sample)(content);
            const qr = yield qrcode_1.default.toDataURL(server);
            let base64Image = qr.split(";base64,").pop();
            yield (0, promises_1.writeFile)("./image.png", base64Image, {
                encoding: "base64",
            });
            yield ctx.replyWithPhoto(new grammy_1.InputFile("./image.png"), {
                caption: `PASSWORD: ${server}`,
            });
            let s = (0, remove_1.default)(content, server);
            yield (0, promises_1.writeFile)("./passwords.txt", s.join("\n"));
            yield db_1.db.hset(id, {
                balance: balance - price,
            });
            yield db_1.db.sadd(`${id}:services:openconnect`, server);
            yield db_1.db.hset(`${id}:openconnect:${server}`, {
                expire: threeMonth,
            });
            yield db_1.db.expire(`${id}:openconnect:${server}`, threeMonth);
        }
        else {
            yield ctx.editMessageText("موجودی شما کافی نیست", {
                reply_markup: backMenu,
            });
        }
    }
    catch (error) {
        yield ctx.reply("مشکل فنی پیش اومده");
        console.error(error);
    }
}))
    .row()
    .back("بازگشت", (ctx) => ctx.editMessageText("لطفا انتخاب کنید"));
exports.selectOpenConnect = selectOpenConnect;
const selectVless = new menu_1.Menu("select-vless", {
    onMenuOutdated: "retry!",
})
    .text(" 50 گیگ دوکاربره 1 ماهه 80تومن ", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    try {
        const id = (_m = ctx.from) === null || _m === void 0 ? void 0 : _m.id.toString();
        const file = yield (0, promises_1.readFile)("./src/v2ray.txt", {
            encoding: "utf-8",
        });
        const rawBalance = yield db_1.db.hget(id, "balance");
        const balance = parseInt(rawBalance !== null && rawBalance !== void 0 ? rawBalance : "0");
        const rawDiscount = yield db_1.db.hget(id, "discount");
        const discount = parseInt(rawDiscount !== null && rawDiscount !== void 0 ? rawDiscount : "0");
        let price = discount ? 80000 - discount : 80000;
        if ((0, lodash_1.isEmpty)(file)) {
            return yield ctx.editMessageText("هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید", {
                reply_markup: backMenu,
            });
        }
        if (balance >= price && file) {
            yield ctx.reply("شما سرویس 50 گیگ دوکاربره 1 ماهه 80تومن را انتخاب کرده اید");
            const content = file.split("\n").map((item) => item.replace("\r", ""));
            const server = (0, lodash_1.sample)(content);
            const qr = yield qrcode_1.default.toDataURL(server);
            let base64Image = qr.split(";base64,").pop();
            yield (0, promises_1.writeFile)("./imagev2.png", base64Image, {
                encoding: "base64",
            });
            yield ctx.replyWithPhoto(new grammy_1.InputFile("./imagev2.png"), {
                caption: `LINK: ${server}`,
            });
            let s = (0, remove_1.default)(content, server);
            yield (0, promises_1.writeFile)("./v2ray.txt", s.join("\n"));
            yield db_1.db.hset(id, {
                balance: balance - price,
            });
            yield db_1.db.sadd(`${id}:services:v2ray`, server);
            yield db_1.db.hset(`${id}:v2ray:${server}`, {
                expire: oneMonth,
            });
            yield db_1.db.expire(`${id}:v2ray:${server}`, oneMonth);
        }
        else {
            yield ctx.editMessageText("موجودی شما کافی نیست", {
                reply_markup: backMenu,
            });
        }
    }
    catch (error) {
        console.error(error);
    }
}))
    .row()
    .text(" 150 گیگ دوکاربره 3 ماهه 230تومن ", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _o;
    try {
        const id = (_o = ctx.from) === null || _o === void 0 ? void 0 : _o.id.toString();
        const file = yield (0, promises_1.readFile)("./src/v2ray.txt", {
            encoding: "utf-8",
        });
        const rawBalance = yield db_1.db.hget(id, "balance");
        const balance = parseInt(rawBalance !== null && rawBalance !== void 0 ? rawBalance : "0");
        const rawDiscount = yield db_1.db.hget(id, "discount");
        const discount = parseInt(rawDiscount !== null && rawDiscount !== void 0 ? rawDiscount : "0");
        let price = discount ? 230000 - discount : 230000;
        if ((0, lodash_1.isEmpty)(file)) {
            return yield ctx.editMessageText("هیچ سروری موجود نیست لطفا با پشتیبانی در تماس باشید", {
                reply_markup: backMenu,
            });
        }
        if (balance >= price && file) {
            yield ctx.reply("شما سرویس 150 گیگ دوکاربره 3 ماهه 230تومن را انتخاب کرده اید");
            const content = file.split("\n").map((item) => item.replace("\r", ""));
            const server = (0, lodash_1.sample)(content);
            const qr = yield qrcode_1.default.toDataURL(server);
            let base64Image = qr.split(";base64,").pop();
            yield (0, promises_1.writeFile)("./imagev2.png", base64Image, {
                encoding: "base64",
            });
            yield ctx.replyWithPhoto(new grammy_1.InputFile("./imagev2.png"), {
                caption: `LINK: ${server}`,
            });
            let s = (0, remove_1.default)(content, server);
            yield (0, promises_1.writeFile)("./v2ray.txt", s.join("\n"));
            yield db_1.db.hset(id, {
                balance: balance - price,
            });
            yield db_1.db.sadd(`${id}:services:v2ray`, server);
            yield db_1.db.hset(`${id}:v2ray:${server}`, {
                expire: threeMonth,
            });
            yield db_1.db.expire(`${id}:v2ray:${server}`, threeMonth);
        }
        else {
            yield ctx.editMessageText("موجودی شما کافی نیست", {
                reply_markup: backMenu,
            });
        }
    }
    catch (error) {
        console.error(error);
    }
}))
    .row()
    .back("بازگشت", (ctx) => ctx.editMessageText("لطفا انتخاب کنید"));
exports.selectVless = selectVless;
const confirmPurchase = new menu_1.Menu("confirm-purchase", {
    onMenuOutdated: "retry!",
})
    .text("تایید رسید", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _p;
    try {
        if (ctx.from.id === BOT_DEVELOPER) {
            const caption = (_p = ctx.msg) === null || _p === void 0 ? void 0 : _p.caption;
            const pattern = /\b\d{7,10}\b/;
            const id = caption === null || caption === void 0 ? void 0 : caption.match(pattern);
            if (id) {
                yield ctx.deleteMessage();
                yield ctx.reply("انجام شد");
                yield ctx.api.sendMessage(id[0], "رسید شما تایید شد لطفا به قسمت خرید کانفیگ برگردید و خرید خودتون رو انجام بدید");
            }
        }
    }
    catch (e) {
        console.error(e);
    }
}))
    .row()
    .text("عدم تایید", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    try {
        if (ctx.from.id === BOT_DEVELOPER) {
            const caption = (_q = ctx.msg) === null || _q === void 0 ? void 0 : _q.caption;
            const pattern = /\b\d{7,10}\b/;
            const id = caption === null || caption === void 0 ? void 0 : caption.match(pattern);
            if (id) {
                yield ctx.deleteMessage();
                yield ctx.reply("انجام شد");
                yield ctx.api.sendMessage(id[0], "رسید شما تایید نشد لطفا با پشتیبانی در تماس باشید");
            }
        }
    }
    catch (e) {
        console.error(e);
    }
}));
exports.confirmPurchase = confirmPurchase;
