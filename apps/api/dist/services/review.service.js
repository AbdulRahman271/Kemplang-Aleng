"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const COLOR_PAIRS = [
    { bg: "#F3E8FF", color: "#6B21A8" }, // Purple
    { bg: "#E0F2FE", color: "#0369A1" }, // Sky
    { bg: "#FEE2E2", color: "#B91C1C" }, // Red
    { bg: "#D1FAE5", color: "#047857" }, // Emerald
    { bg: "#FEF3C7", color: "#B45309" }, // Amber
];
class ReviewService {
    static async getApprovedReviews() {
        return await db_1.db
            .select()
            .from(schema_1.reviews)
            .where((0, drizzle_orm_1.eq)(schema_1.reviews.isApproved, true))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.reviews.createdAt));
    }
    static async getAllReviews() {
        return await db_1.db.select().from(schema_1.reviews).orderBy((0, drizzle_orm_1.desc)(schema_1.reviews.createdAt));
    }
    static async createReview(name, rating, comment, role = "Pelanggan", isApproved = false) {
        const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const initial = name.trim().charAt(0).toUpperCase() || "P";
        const colorPair = COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];
        const results = await db_1.db
            .insert(schema_1.reviews)
            .values({
            id,
            name,
            role,
            rating,
            comment,
            initial,
            avatarBg: colorPair.bg,
            avatarColor: colorPair.color,
            isApproved,
            createdAt: new Date(),
        })
            .returning();
        return results[0];
    }
    static async approveReview(id, isApproved = true) {
        const results = await db_1.db
            .update(schema_1.reviews)
            .set({ isApproved })
            .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, id))
            .returning();
        return results[0] || null;
    }
    static async updateReview(id, data) {
        const updateData = { ...data };
        if (data.name) {
            updateData.initial = data.name.trim().charAt(0).toUpperCase() || "P";
        }
        const results = await db_1.db
            .update(schema_1.reviews)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, id))
            .returning();
        return results[0] || null;
    }
    static async deleteReview(id) {
        const results = await db_1.db
            .delete(schema_1.reviews)
            .where((0, drizzle_orm_1.eq)(schema_1.reviews.id, id))
            .returning();
        return results[0] || null;
    }
}
exports.ReviewService = ReviewService;
