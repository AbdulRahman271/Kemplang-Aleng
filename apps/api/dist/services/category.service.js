"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class CategoryService {
    static async getAllCategories() {
        return await db_1.db.select().from(schema_1.categories).orderBy((0, drizzle_orm_1.asc)(schema_1.categories.name));
    }
    static async getCategoryById(id) {
        const results = await db_1.db.select().from(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, id)).limit(1);
        return results[0] || null;
    }
    static async createCategory(data) {
        const results = await db_1.db
            .insert(schema_1.categories)
            .values({
            id: data.id,
            name: data.name,
            description: data.description,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        return results[0];
    }
    static async updateCategory(id, data) {
        const results = await db_1.db
            .update(schema_1.categories)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.categories.id, id))
            .returning();
        return results[0] || null;
    }
    static async deleteCategory(id) {
        const results = await db_1.db.delete(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, id)).returning();
        return results[0] || null;
    }
}
exports.CategoryService = CategoryService;
