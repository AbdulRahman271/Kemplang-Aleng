import { db } from "../config/db";
import { products } from "../db/schema";
import { eq, asc, desc } from "drizzle-orm";

export class ProductService {
  static async getAllProducts(category?: string, sortBy?: string) {
    let query = db.select().from(products).$dynamic();
    
    if (category && category !== "all") {
      query = query.where(eq(products.category, category));
    }
    
    if (sortBy === "price-low") {
      query = query.orderBy(asc(products.price));
    } else if (sortBy === "price-high") {
      query = query.orderBy(desc(products.price));
    } else {
      query = query.orderBy(asc(products.id));
    }

    return await query;
  }

  static async getProductById(id: string) {
    const results = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return results[0] || null;
  }

  static async createProduct(data: {
    id: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    category: string;
    image: string;
    badge?: string | null;
    altText: string;
  }) {
    const results = await db
      .insert(products)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return results[0];
  }

  static async updateProduct(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    weight: number;
    category: string;
    image: string;
    badge: string | null;
    altText: string;
  }>) {
    const results = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    return results[0] || null;
  }

  static async deleteProduct(id: string) {
    const results = await db.delete(products).where(eq(products.id, id)).returning();
    return results[0] || null;
  }
}

