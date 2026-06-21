"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const node_1 = require("better-auth/node");
const product_router_1 = require("./routers/product.router");
const order_router_1 = require("./routers/order.router");
const contact_router_1 = require("./routers/contact.router");
const review_router_1 = require("./routers/review.router");
const category_router_1 = require("./routers/category.router");
const setting_router_1 = require("./routers/setting.router");
const error_middleware_1 = require("./middleware/error.middleware");
const db_1 = require("./config/db");
const auth_1 = require("./config/auth");
const schema_1 = require("./db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Configure CORS to permit credentials (necessary for Better Auth sessions via cookies)
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure uploads folder exists
const uploadsDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Serve uploaded images statically
app.use("/api/uploads", express_1.default.static(uploadsDir));
// Simple logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date() });
});
// Mount Feature Routers
app.all("/api/auth/*", (0, node_1.toNodeHandler)(auth_1.auth));
app.use("/api/products", product_router_1.productRouter);
app.use("/api/categories", category_router_1.categoryRouter);
app.use("/api/settings", setting_router_1.settingRouter);
app.use("/api/orders", order_router_1.orderRouter);
app.use("/api/contact", contact_router_1.contactRouter);
app.use("/api/reviews", review_router_1.reviewRouter);
// Fallback Route Handler (404)
app.use((req, res) => {
    res.status(404).json({ error: `Not Found: ${req.method} ${req.path}` });
});
// Error handling middleware (MUST be final middleware)
app.use(error_middleware_1.errorHandler);
// Database Seeding Logic
async function seedDatabase() {
    try {
        console.log("[Seed] Checking database seeding...");
        // 1. Seed Categories
        const categoryCount = await db_1.db.select().from(schema_1.categories);
        if (categoryCount.length === 0) {
            console.log("[Seed] Seeding default categories...");
            const defaultCategories = [
                { id: "roasted", name: "Panggang", description: "Kemplang panggang arang tradisional" },
                { id: "fried", name: "Goreng", description: "Kemplang goreng renyah" },
                { id: "curly", name: "Keriting", description: "Kerupuk keriting anyaman tradisional" },
                { id: "spicy", name: "Pedas", description: "Kemplang dengan balutan bumbu pedas" },
            ];
            for (const cat of defaultCategories) {
                await db_1.db.insert(schema_1.categories).values({
                    id: cat.id,
                    name: cat.name,
                    description: cat.description,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            console.log("[Seed] Categories seeded.");
        }
        // 2. Seed Settings (About Us and Contact)
        const settingsCount = await db_1.db.select().from(schema_1.settings);
        if (settingsCount.length === 0) {
            console.log("[Seed] Seeding default settings...");
            const defaultSettings = [
                { key: "about_title", value: "Kenapa Harus Kami?" },
                { key: "about_description", value: "Kami menjaga kualitas dan keaslian rasa Palembang dalam setiap butir kemplang yang kami produksi." },
                {
                    key: "about_features",
                    value: JSON.stringify([
                        {
                            icon: "verified",
                            title: "Asli Palembang",
                            description: "Diproduksi langsung di pusat kemplang Palembang dengan bahan pilihan."
                        },
                        {
                            icon: "bakery_dining",
                            title: "Renyah & Gurih",
                            description: "Tekstur yang pas dan rasa ikan yang kuat, cocok untuk teman makan atau camilan."
                        },
                        {
                            icon: "local_shipping",
                            title: "Pengiriman Cepat",
                            description: "Sistem pengiriman terintegrasi untuk menjaga kesegaran kemplang sampai tangan Anda."
                        },
                        {
                            icon: "health_and_safety",
                            title: "Tanpa Pengawet",
                            description: "Hanya menggunakan bahan alami berkualitas tanpa tambahan bahan kimia berbahaya."
                        }
                    ])
                },
                { key: "contact_whatsapp", value: "+62 812-3456-7890" },
                { key: "contact_email", value: "halo@kemplangaleng.com" },
                { key: "contact_address", value: "Jalan Demang Lebar Daun No. 12, Lorok Pakjo, Kec. Ilir Barat I, Kota Palembang, Sumatera Selatan 30137" },
                { key: "contact_maps_url", value: "https://maps.google.com/?q=Demang+Lebar+Daun+Palembang" }
            ];
            for (const set of defaultSettings) {
                await db_1.db.insert(schema_1.settings).values({
                    key: set.key,
                    value: set.value,
                    updatedAt: new Date(),
                });
            }
            console.log("[Seed] Settings seeded.");
        }
        // 3. Seed Products
        const productCount = await db_1.db.select().from(schema_1.products);
        if (productCount.length === 0) {
            console.log("[Seed] Seeding mock products...");
            const mockProducts = [
                {
                    id: "prod-1",
                    name: "Kemplang Panggang Super",
                    description: "Kemplang panggang premium dengan aroma bakar khas arang tradisional dan rasa ikan belida yang gurih melimpah.",
                    price: 45000,
                    weight: 250,
                    category: "roasted",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEfn9B5DrPIDJqfxBbbGiDSVRQ7PI5xMVrzn4o4b32OKNTkRlpcxxgwkMK7PCDXe-HKVqoKA3ScwRekehCW69YadaYewA1pQKhGKmWDHXtzbdfgcsklI7-qjJiCu3eMntWN6UYSPbeqAB4Ibt3AD-015G5oByW-rdRQn78RpsqCBVeQK1leerecGbuJYQmC9DU70fcIQoqWSLdkAykPzwOEzsc3jqiRzJdx5KYpq4fPNno0XzxAtMiPKTkQkwK5GyOBIiTP-k_9TxA",
                    badge: "Terlaris",
                    altText: "Kemplang Panggang Super",
                },
                {
                    id: "prod-2",
                    name: "Kemplang Goreng Koin",
                    description: "Kerupuk kemplang goreng berbentuk koin kecil yang super renyah dan pas untuk camilan sekali hap.",
                    price: 38000,
                    weight: 200,
                    category: "fried",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYSOmFbbn_4X08G0ff9t4eYbni_Pv56i-bqO0KVQG2Css16t2H69C5N7ya3lSfc87AO42i03Nr_hG64kJjSa_iBt2t2WlTwvs-jJMGa0N2JgGBBc8u1zfXJV8PvQGoxGCSLQuVT6dW3uAZgrY2PxrxxAcVoZjGXjto4OIwwtgacikUOwdDsp6ZTNIpYiQMfFzmWct-tEnYRMuO2SOB5x1icDy0AbQWjus5r_ONqaJP0vFqazoQaeedQbvtHSIDC7Uf8GFq24NecMdM",
                    badge: null,
                    altText: "Kemplang Goreng Koin",
                },
                {
                    id: "prod-3",
                    name: "Krupuk Keriting Belida",
                    description: "Kerupuk keriting dengan bentuk anyaman tradisional bertekstur sangat garing dan kaya rasa ikan belida asli.",
                    price: 52000,
                    weight: 150,
                    category: "curly",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAT4m7nJmqr5VMMk1c9e2cznRjMhOJOyXdE3Vlem02a6kreRNMQdGpj8WQ8WM7Y5vEcQE50zKVGR3hXHADdsGH2oW5tR6ly0k5kVenjSBOo86Ae3WqEeJsn6qtxdLWqg6d9JTWsP7PdFPzDS_kkph5QKzZqogTUVfW4d3hBfInpMtdLmhwXdlZCYonxrlHmLBMFm23gX7EA2tg8RrXrenFOCv13XBOg1TNNcQXkVMvewW_VFSQpujey6Xx8k2q1tRJwxFl0seGODflv",
                    badge: "Baru",
                    altText: "Krupuk Keriting Belida",
                },
                {
                    id: "prod-4",
                    name: "Kemplang Pedas Jeruk",
                    description: "Kemplang goreng dibalut bumbu cabai pedas berpadu dengan keharuman daun jeruk purut yang segar.",
                    price: 42000,
                    weight: 200,
                    category: "spicy",
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMGwHa3kIaCdyoAgCWXzVPAVMTBAJZElljc_8sAdJ4MSsKKRnBDmT7gkxRGHvIPt_kmYsdW2YoesISPePF4FxRhFf1AbHSCbS7JwzZkDaV2ZuCDdznSYgtXMpRWZ_0EoqdqjdB3eIpYgK7n4ayN238RGq-9Ia5K89AajUZ6Yszvs7z--BpGWipcJKccQVkj-hMHYECqmZRoQwXCb2frgnluneNZvGlPDEl5wY9qYLy9QXkDbBP5CJe22S4TlmZFYEkle5ep17T3xhC",
                    badge: null,
                    altText: "Kemplang Pedas Jeruk",
                }
            ];
            for (const prod of mockProducts) {
                await db_1.db.insert(schema_1.products).values({
                    ...prod,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            console.log("[Seed] Products seeded.");
        }
        // 4. Seed Admin User
        const adminCheck = await db_1.db.select().from(schema_1.user).where((0, drizzle_orm_1.eq)(schema_1.user.email, "admin@kemplangaleng.com")).limit(1);
        if (adminCheck.length === 0) {
            console.log("[Seed] Creating default admin user...");
            try {
                await auth_1.auth.api.signUpEmail({
                    body: {
                        email: "admin@kemplangaleng.com",
                        password: "Admin123!",
                        name: "Admin Aleng",
                    },
                });
                // Upgrade role to admin
                await db_1.db
                    .update(schema_1.user)
                    .set({ role: "admin", emailVerified: true })
                    .where((0, drizzle_orm_1.eq)(schema_1.user.email, "admin@kemplangaleng.com"));
                console.log("[Seed] Admin user created and upgraded to admin role.");
            }
            catch (authError) {
                console.error("[Seed] Better Auth signUpEmail failed:", authError.message);
            }
        }
        else {
            console.log("[Seed] Admin user already exists.");
        }
        // 5. Seed Reviews
        const reviewCount = await db_1.db.select().from(schema_1.reviews);
        if (reviewCount.length === 0) {
            console.log("[Seed] Seeding default reviews...");
            const defaultReviews = [
                {
                    id: 'rev-1',
                    name: 'Santi Rahmawati',
                    role: 'Ibu Rumah Tangga',
                    rating: 5,
                    comment: 'Kemplang panggangnya juara! Rasa ikannya berasa banget, beda sama yang biasa beli di supermarket. Packing rapi dan aman.',
                    initial: 'S',
                    avatarBg: '#F3E8FF',
                    avatarColor: '#6B21A8',
                    isApproved: true,
                },
                {
                    id: 'rev-2',
                    name: 'Andi Wijaya',
                    role: 'Wirausaha',
                    rating: 5,
                    comment: 'Langganan buat oleh-oleh kalau ke luar kota. Rasanya konsisten dari dulu. Pengiriman ke Jakarta cuma sehari.',
                    initial: 'A',
                    avatarBg: '#E0F2FE',
                    avatarColor: '#0369A1',
                    isApproved: true,
                },
                {
                    id: 'rev-3',
                    name: 'Maya Putri',
                    role: 'Food Vlogger',
                    rating: 5,
                    comment: 'Krupuk keritingnya renyah banget. Sambalnya juga mantap, pedasnya pas. Sangat direkomendasikan untuk camilan sore.',
                    initial: 'M',
                    avatarBg: '#FEF3C7',
                    avatarColor: '#B45309',
                    isApproved: true,
                }
            ];
            for (const rev of defaultReviews) {
                await db_1.db.insert(schema_1.reviews).values({
                    ...rev,
                    createdAt: new Date(),
                });
            }
            console.log("[Seed] Reviews seeded.");
        }
        console.log("[Seed] Seeding check completed.");
    }
    catch (error) {
        console.error("[Seed] Error during seeding:", error);
    }
}
// Start server
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, async () => {
        console.log(`[Server] Kemplang Aleng API listening on port ${PORT}`);
        await seedDatabase();
    });
}
// Export app agar dibaca oleh handler Serverless Vercel
exports.default = app;
