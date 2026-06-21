import { db } from "../config/db";
import { orders, orderItems, products } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export class OrderService {
  static async createOrder(
    userId: string | null,
    contactPhone: string,
    shippingAddress: string,
    notes: string | null,
    items: { productId: string; quantity: number }[]
  ) {
    if (items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    // Wrap in a database transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      let subtotal = 0;
      const enrichedItems: {
        id: string;
        productId: string;
        quantity: number;
        priceAtPurchase: number;
        productName: string;
        productWeight: number;
      }[] = [];

      // 1. Verify products and compute prices
      for (const item of items) {
        const prod = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (prod.length === 0) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const product = prod[0];
        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        enrichedItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: product.price,
          productName: product.name,
          productWeight: product.weight,
        });
      }

      // 2. Generate custom human-readable Order Reference ID
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit code
      const orderId = `ALENG-${dateStr}-${randomSuffix}`;

      // 3. Insert order
      await tx.insert(orders).values({
        id: orderId,
        userId,
        subtotal,
        status: "pending",
        contactPhone,
        shippingAddress,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 4. Insert order items
      for (const enriched of enrichedItems) {
        await tx.insert(orderItems).values({
          id: enriched.id,
          orderId: orderId,
          productId: enriched.productId,
          quantity: enriched.quantity,
          priceAtPurchase: enriched.priceAtPurchase,
        });
      }

      // 5. Generate formatted WhatsApp text redirection url
      const whatsappPhone = "6281234567890"; // Admin contact phone
      let whatsappMessage = `Halo Kemplang Aleng, saya ingin checkout pesanan dengan ID *${orderId}*:\n\n`;
      
      enrichedItems.forEach((item) => {
        whatsappMessage += `- *${item.productName}* (${item.productWeight}g) | ${item.quantity} pcs x Rp ${item.priceAtPurchase.toLocaleString("id-ID")} = Rp ${(item.priceAtPurchase * item.quantity).toLocaleString("id-ID")}\n`;
      });
      
      whatsappMessage += `\n*Total Belanja:* Rp ${subtotal.toLocaleString("id-ID")}\n`;
      whatsappMessage += `*Nomor HP:* ${contactPhone}\n`;
      whatsappMessage += `*Alamat Kirim:* ${shippingAddress}\n`;
      if (notes) {
        whatsappMessage += `*Catatan:* ${notes}\n`;
      }
      whatsappMessage += `\nMohon info ketersediaan stok & ongkir. Terima kasih!`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

      return {
        orderId,
        subtotal,
        status: "pending",
        items: enrichedItems,
        whatsappUrl,
      };
    });
  }

  static async getOrderById(id: string) {
    const orderResults = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (orderResults.length === 0) return null;

    const order = orderResults[0];

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        productName: products.name,
        productImage: products.image,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items,
    };
  }

  static async getOrdersByUser(userId: string) {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  static async getAllOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  static async updateOrderStatus(id: string, status: "pending" | "paid" | "shipped" | "completed" | "cancelled") {
    const results = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return results[0] || null;
  }
}
