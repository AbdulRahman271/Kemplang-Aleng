import { db } from "../config/db";
import { reviews } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const COLOR_PAIRS = [
  { bg: "#F3E8FF", color: "#6B21A8" }, // Purple
  { bg: "#E0F2FE", color: "#0369A1" }, // Sky
  { bg: "#FEE2E2", color: "#B91C1C" }, // Red
  { bg: "#D1FAE5", color: "#047857" }, // Emerald
  { bg: "#FEF3C7", color: "#B45309" }, // Amber
];

export class ReviewService {
  static async getApprovedReviews() {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.createdAt));
  }

  static async getAllReviews() {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  static async createReview(name: string, rating: number, comment: string, role: string = "Pelanggan", isApproved: boolean = false) {
    const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const initial = name.trim().charAt(0).toUpperCase() || "P";
    const colorPair = COLOR_PAIRS[Math.floor(Math.random() * COLOR_PAIRS.length)];

    const results = await db
      .insert(reviews)
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

  static async approveReview(id: string, isApproved: boolean = true) {
    const results = await db
      .update(reviews)
      .set({ isApproved })
      .where(eq(reviews.id, id))
      .returning();
    return results[0] || null;
  }

  static async updateReview(
    id: string,
    data: {
      name?: string;
      role?: string;
      rating?: number;
      comment?: string;
      isApproved?: boolean;
    }
  ) {
    const updateData: any = { ...data };
    if (data.name) {
      updateData.initial = data.name.trim().charAt(0).toUpperCase() || "P";
    }

    const results = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning();
    return results[0] || null;
  }

  static async deleteReview(id: string) {
    const results = await db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning();
    return results[0] || null;
  }
}
