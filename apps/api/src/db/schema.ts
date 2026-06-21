import { pgTable, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";

// --- Enums ---
export const productCategoryEnum = pgEnum("product_category", ["roasted", "fried", "curly", "spicy"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "shipped", "completed", "cancelled"]);
export const messageStatusEnum = pgEnum("message_status", ["unread", "read", "replied"]);

// --- Better Auth Required Tables ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: text("role").default("customer").notNull(), // "admin" or "customer"
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// --- Application Specific Tables ---

// Categories Table
export const categories = pgTable("categories", {
  id: text("id").primaryKey(), // e.g. "roasted" or uuid
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Settings Table
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Products Table
export const products = pgTable("products", {
  id: text("id").primaryKey(), // e.g. "prod-1" or uuid
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // stored in IDR
  weight: integer("weight").notNull(), // stored in grams
  category: text("category")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  image: text("image").notNull(),
  badge: text("badge"), // e.g. "Terlaris", "Baru"
  altText: text("alt_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders Table
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // Order ID (e.g. ALENG-YYYYMMDD-XXXX)
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // optional for guest checkouts
  subtotal: integer("subtotal").notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  contactPhone: text("contact_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order Items Table (Many-to-Many Relationship between Orders and Products)
export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: integer("price_at_purchase").notNull(), // snapshots the price at the time of purchase
});

// Contact Messages Table
export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: messageStatusEnum("status").default("unread").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Testimonials / Reviews Table
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").default("Pelanggan").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  initial: text("initial").notNull(),
  avatarBg: text("avatar_bg").notNull(),
  avatarColor: text("avatar_color").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(), // reviews must be approved by admin before displaying
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
