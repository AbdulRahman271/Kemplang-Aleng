"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class ProductService {
    static async getAllProducts(category, sortBy) {
        let query = db_1.db.select().from(schema_1.products).$dynamic();
        if (category && category !== "all") {
            query = query.where((0, drizzle_orm_1.eq)(schema_1.products.category, category));
        }
        if (sortBy === "price-low") {
            query = query.orderBy((0, drizzle_orm_1.asc)(schema_1.products.price));
        }
        else if (sortBy === "price-high") {
            query = query.orderBy((0, drizzle_orm_1.desc)(schema_1.products.price));
        }
        else {
            query = query.orderBy((0, drizzle_orm_1.asc)(schema_1.products.id));
        }
        return await query;
    }
    static async getProductById(id) {
        const results = await db_1.db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, id)).limit(1);
        return results[0] || null;
    }
    static async createProduct(data) {
        const results = await db_1.db
            .insert(schema_1.products)
            .values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        return results[0];
    }
    static async updateProduct(id, data) {
        const results = await db_1.db
            .update(schema_1.products)
            .set({
            ...data,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, id))
            .returning();
        return results[0] || null;
    }
    static async deleteProduct(id) {
        const results = await db_1.db.delete(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, id)).returning();
        return results[0] || null;
    }
}
exports.ProductService = ProductService;
