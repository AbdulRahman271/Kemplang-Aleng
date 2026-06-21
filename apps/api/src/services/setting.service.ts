import { db } from "../config/db";
import { settings } from "../db/schema";
import { eq } from "drizzle-orm";

export class SettingService {
  static async getAllSettings() {
    return await db.select().from(settings);
  }

  static async getSettingByKey(key: string) {
    const results = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return results[0]?.value || null;
  }

  static async updateSettingByKey(key: string, value: string) {
    const results = await db
      .insert(settings)
      .values({
        key,
        value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return results[0];
  }
}
