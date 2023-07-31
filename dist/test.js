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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./database/db");
const cron_1 = require("cron");
const cj = new cron_1.CronJob('*/5 * * * * *', () => {
});
cj.start();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.db.set("name", "Alireza");
    const expire = yield db_1.db.expire('name', 10);
    console.log(expire);
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        const ex = yield db_1.db.ttl('name');
        const name = yield db_1.db.get('name');
        console.log(ex, name);
    }), 2000);
}))();
