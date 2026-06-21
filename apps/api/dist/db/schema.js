"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviews = exports.contactMessages = exports.orderItems = exports.orders = exports.products = exports.settings = exports.categories = exports.verification = exports.account = exports.session = exports.user = exports.messageStatusEnum = exports.orderStatusEnum = exports.productCategoryEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// --- Enums ---
exports.productCategoryEnum = (0, pg_core_1.pgEnum)("product_category", ["roasted", "fried", "curly", "spicy"]);
exports.orderStatusEnum = (0, pg_core_1.pgEnum)("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);
exports.messageStatusEnum = (0, pg_core_1.pgEnum)("message_status", ["unread", "read", "replied"]);
// --- Better Auth Required Tables ---
exports.user = (0, pg_core_1.pgTable)("user", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)("email_verified").notNull(),
    image: (0, pg_core_1.text)("image"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull(),
    role: (0, pg_core_1.text)("role").default("customer").notNull(), // "admin" or "customer"
});
exports.session = (0, pg_core_1.pgTable)("session", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    userId: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(() => exports.user.id, { onDelete: "cascade" }),
});
exports.account = (0, pg_core_1.pgTable)("account", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    accountId: (0, pg_core_1.text)("account_id").notNull(),
    providerId: (0, pg_core_1.text)("provider_id").notNull(),
    userId: (0, pg_core_1.text)("user_id")
        .notNull()
        .references(() => exports.user.id, { onDelete: "cascade" }),
    accessToken: (0, pg_core_1.text)("access_token"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    idToken: (0, pg_core_1.text)("id_token"),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    password: (0, pg_core_1.text)("password"),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").notNull(),
});
exports.verification = (0, pg_core_1.pgTable)("verification", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    identifier: (0, pg_core_1.text)("identifier").notNull(),
    value: (0, pg_core_1.text)("value").notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at"),
});
// --- Application Specific Tables ---
// Categories Table
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.text)("id").primaryKey(), // e.g. "roasted" or uuid
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Settings Table
exports.settings = (0, pg_core_1.pgTable)("settings", {
    key: (0, pg_core_1.text)("key").primaryKey(),
    value: (0, pg_core_1.text)("value").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Products Table
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.text)("id").primaryKey(), // e.g. "prod-1" or uuid
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    price: (0, pg_core_1.integer)("price").notNull(), // stored in IDR
    weight: (0, pg_core_1.integer)("weight").notNull(), // stored in grams
    category: (0, pg_core_1.text)("category")
        .notNull()
        .references(() => exports.categories.id, { onDelete: "restrict" }),
    image: (0, pg_core_1.text)("image").notNull(),
    badge: (0, pg_core_1.text)("badge"), // e.g. "Terlaris", "Baru"
    altText: (0, pg_core_1.text)("alt_text").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Orders Table
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.text)("id").primaryKey(), // Order ID (e.g. ALENG-YYYYMMDD-XXXX)
    userId: (0, pg_core_1.text)("user_id").references(() => exports.user.id, { onDelete: "set null" }), // optional for guest checkouts
    subtotal: (0, pg_core_1.integer)("subtotal").notNull(),
    status: (0, exports.orderStatusEnum)("status").default("pending").notNull(),
    contactPhone: (0, pg_core_1.text)("contact_phone").notNull(),
    shippingAddress: (0, pg_core_1.text)("shipping_address").notNull(),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Order Items Table (Many-to-Many Relationship between Orders and Products)
exports.orderItems = (0, pg_core_1.pgTable)("order_items", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    orderId: (0, pg_core_1.text)("order_id")
        .notNull()
        .references(() => exports.orders.id, { onDelete: "cascade" }),
    productId: (0, pg_core_1.text)("product_id")
        .notNull()
        .references(() => exports.products.id),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    priceAtPurchase: (0, pg_core_1.integer)("price_at_purchase").notNull(), // snapshots the price at the time of purchase
});
// Contact Messages Table
exports.contactMessages = (0, pg_core_1.pgTable)("contact_messages", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    status: (0, exports.messageStatusEnum)("status").default("unread").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Testimonials / Reviews Table
exports.reviews = (0, pg_core_1.pgTable)("reviews", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    role: (0, pg_core_1.text)("role").default("Pelanggan").notNull(),
    rating: (0, pg_core_1.integer)("rating").notNull(),
    comment: (0, pg_core_1.text)("comment").notNull(),
    initial: (0, pg_core_1.text)("initial").notNull(),
    avatarBg: (0, pg_core_1.text)("avatar_bg").notNull(),
    avatarColor: (0, pg_core_1.text)("avatar_color").notNull(),
    isApproved: (0, pg_core_1.boolean)("is_approved").default(false).notNull(), // reviews must be approved by admin before displaying
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
