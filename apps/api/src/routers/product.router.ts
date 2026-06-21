import { Router, Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { authenticateSession, requireAdmin, AuthenticatedRequest } from "../middleware/auth.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";

export const productRouter = Router();

// Configure storage for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed (jpeg, jpg, png, webp, gif)"));
  }
});

// GET all products
productRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, sortBy } = req.query;
    const productsList = await ProductService.getAllProducts(
      category as string,
      sortBy as string
    );
    res.json(productsList);
  } catch (error) {
    next(error);
  }
});

// GET single product
productRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST upload product image (Admin only)
productRouter.post(
  "/upload",
  authenticateSession,
  requireAdmin,
  upload.single("image"),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      // Return the relative URL of the uploaded file
      const fileUrl = `/api/uploads/${req.file.filename}`;
      res.json({ imageUrl: fileUrl });
    } catch (error) {
      next(error);
    }
  }
);

// POST new product (Admin only)
productRouter.post(
  "/",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id, name, description, price, weight, category, image, badge, altText } = req.body;
      
      if (!id || !name || !description || !price || !weight || !category || !image || !altText) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const product = await ProductService.createProduct({
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
    } catch (error) {
      next(error);
    }
  }
);

// PUT update product (Admin only)
productRouter.put(
  "/:id",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE product (Admin only)
productRouter.delete(
  "/:id",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await ProductService.deleteProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ message: "Product deleted successfully", product });
    } catch (error) {
      next(error);
    }
  }
);
