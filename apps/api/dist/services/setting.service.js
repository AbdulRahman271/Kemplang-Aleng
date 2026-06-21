"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingService = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class SettingService {
    static async getAllSettings() {
        return await db_1.db.select().from(schema_1.settings);
    }
    static async getSettingByKey(key) {
        const results = await db_1.db.select().from(schema_1.settings).where((0, drizzle_orm_1.eq)(schema_1.settings.key, key)).limit(1);
        return results[0]?.value || null;
    }
    static async updateSettingByKey(key, value) {
        const results = await db_1.db
            .insert(schema_1.settings)
            .values({
            key,
            value,
            updatedAt: new Date(),
        })
            .onConflictDoUpdate({
            target: schema_1.settings.key,
            set: {
                value,
                updatedAt: new Date(),
            },
        })
            .returning();
        return results[0];
    }
}
exports.SettingService = SettingService;
