"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class ContactService {
    static async createMessage(name, phone, message) {
        const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const results = await db_1.db
            .insert(schema_1.contactMessages)
            .values({
            id,
            name,
            phone,
            message,
            status: "unread",
            createdAt: new Date(),
        })
            .returning();
        return results[0];
    }
    static async getAllMessages() {
        return await db_1.db.select().from(schema_1.contactMessages).orderBy((0, drizzle_orm_1.desc)(schema_1.contactMessages.createdAt));
    }
    static async updateMessageStatus(id, status) {
        const results = await db_1.db
            .update(schema_1.contactMessages)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.contactMessages.id, id))
            .returning();
        return results[0] || null;
    }
}
exports.ContactService = ContactService;
