import { Router, Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { authenticateSession, requireAdmin, AuthenticatedRequest } from "../middleware/auth.middleware";

export const categoryRouter = Router();

// GET all categories (Public)
categoryRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await CategoryService.getAllCategories();
    res.json(list);
  } catch (error) {
    next(error);
  }
});

// GET single category (Public)
categoryRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await CategoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// POST new category (Admin only)
categoryRouter.post(
  "/",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id, name, description } = req.body;

      if (!id || !name) {
        return res.status(400).json({ error: "Missing required fields (id, name)" });
      }

      // Check if category already exists
      const existing = await CategoryService.getCategoryById(id);
      if (existing) {
        return res.status(400).json({ error: "Category with this ID already exists" });
      }

      const category = await CategoryService.createCategory({ id, name, description });
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }
);

// PUT update category (Admin only)
categoryRouter.put(
  "/:id",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE category (Admin only)
categoryRouter.delete(
  "/:id",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.deleteCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category deleted successfully", category });
    } catch (error) {
      next(error);
    }
  }
);
