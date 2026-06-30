import { Router, Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { authenticateSession, requireAdmin, AuthenticatedRequest } from "../middleware/auth.middleware";
import multer from "multer";
import { cloudinary } from "../config/cloudinary";

export const productRouter = Router();

// Use memory storage instead of disk — works on Vercel serverless and feeds directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mimeType = allowedTypes.test(file.mimetype);
    if (mimeType) {
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

// POST upload product image to Cloudinary (Admin only)
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

      // Upload to Cloudinary using a stream from the memory buffer
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "kemplang-aleng/products",
            resource_type: "image",
            transformation: [
              { quality: "auto", fetch_format: "auto" } // Auto-optimize for best format & quality
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      res.json({
        imageUrl: result.secure_url,
        publicId: result.public_id
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
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
