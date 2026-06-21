"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = require("express");
const product_service_1 = require("../services/product.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.productRouter = (0, express_1.Router)();
// Configure storage for product images
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path_1.default.join(__dirname, "../../uploads");
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error("Only images are allowed (jpeg, jpg, png, webp, gif)"));
    }
});
// GET all products
exports.productRouter.get("/", async (req, res, next) => {
    try {
        const { category, sortBy } = req.query;
        const productsList = await product_service_1.ProductService.getAllProducts(category, sortBy);
        res.json(productsList);
    }
    catch (error) {
        next(error);
    }
});
// GET single product
exports.productRouter.get("/:id", async (req, res, next) => {
    try {
        const product = await product_service_1.ProductService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
// POST upload product image (Admin only)
exports.productRouter.post("/upload", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, upload.single("image"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Return the relative URL of the uploaded file
        const fileUrl = `/api/uploads/${req.file.filename}`;
        res.json({ imageUrl: fileUrl });
    }
    catch (error) {
        next(error);
    }
});
// POST new product (Admin only)
exports.productRouter.post("/", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const { id, name, description, price, weight, category, image, badge, altText } = req.body;
        if (!id || !name || !description || !price || !weight || !category || !image || !altText) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const product = await product_service_1.ProductService.createProduct({
            id,
            name,
            description,
            price,
            weight,
            category,
            image,
            badge,
            altText,
        });
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
});
// PUT update product (Admin only)
exports.productRouter.put("/:id", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const product = await product_service_1.ProductService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    }
    catch (error) {
        next(error);
    }
});
// DELETE product (Admin only)
exports.productRouter.delete("/:id", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const product = await product_service_1.ProductService.deleteProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ message: "Product deleted successfully", product });
    }
    catch (error) {
        next(error);
    }
});
