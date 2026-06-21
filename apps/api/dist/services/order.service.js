"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class OrderService {
    static async createOrder(userId, contactPhone, shippingAddress, notes, items) {
        if (items.length === 0) {
            throw new Error("Order must contain at least one item.");
        }
        // Wrap in a database transaction to ensure atomicity
        return await db_1.db.transaction(async (tx) => {
            let subtotal = 0;
            const enrichedItems = [];
            // 1. Verify products and compute prices
            for (const item of items) {
                const prod = await tx
                    .select()
                    .from(schema_1.products)
                    .where((0, drizzle_orm_1.eq)(schema_1.products.id, item.productId))
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
            await tx.insert(schema_1.orders).values({
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
                await tx.insert(schema_1.orderItems).values({
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
    static async getOrderById(id) {
        const orderResults = await db_1.db.select().from(schema_1.orders).where((0, drizzle_orm_1.eq)(schema_1.orders.id, id)).limit(1);
        if (orderResults.length === 0)
            return null;
        const order = orderResults[0];
        const items = await db_1.db
            .select({
            id: schema_1.orderItems.id,
            productId: schema_1.orderItems.productId,
            quantity: schema_1.orderItems.quantity,
            priceAtPurchase: schema_1.orderItems.priceAtPurchase,
            productName: schema_1.products.name,
            productImage: schema_1.products.image,
        })
            .from(schema_1.orderItems)
            .innerJoin(schema_1.products, (0, drizzle_orm_1.eq)(schema_1.orderItems.productId, schema_1.products.id))
            .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
        return {
            ...order,
            items,
        };
    }
    static async getOrdersByUser(userId) {
        return await db_1.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    static async getAllOrders() {
        return await db_1.db.select().from(schema_1.orders).orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    static async updateOrderStatus(id, status) {
        const results = await db_1.db
            .update(schema_1.orders)
            .set({
            status,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
            .returning();
        return results[0] || null;
    }
}
exports.OrderService = OrderService;
