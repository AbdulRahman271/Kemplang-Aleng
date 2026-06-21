import { db } from "../config/db";
import { categories } from "../db/schema";
import { eq, asc } from "drizzle-orm";

export class CategoryService {
  static async getAllCategories() {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  static async getCategoryById(id: string) {
    const results = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return results[0] || null;
  }

  static async createCategory(data: { id: string; name: string; description?: string | null }) {
    const results = await db
      .insert(categories)
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

  static async updateCategory(id: string, data: Partial<{ name: string; description: string | null }>) {
    const results = await db
      .update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();
    return results[0] || null;
  }

  static async deleteCategory(id: string) {
    const results = await db.delete(categories).where(eq(categories.id, id)).returning();
    return results[0] || null;
  }
}
