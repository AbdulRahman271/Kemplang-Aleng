import { db } from "../config/db";
import { contactMessages } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export class ContactService {
  static async createMessage(name: string, phone: string, message: string) {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const results = await db
      .insert(contactMessages)
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
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  static async updateMessageStatus(id: string, status: "unread" | "read" | "replied") {
    const results = await db
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))
      .returning();
    return results[0] || null;
  }
}
