import { Router, Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { authenticateSession, requireAdmin, AuthenticatedRequest } from "../middleware/auth.middleware";
import { auth } from "../config/auth";

export const reviewRouter = Router();

// GET approved reviews (Public)
reviewRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const approvedReviews = await ReviewService.getApprovedReviews();
    res.json(approvedReviews);
  } catch (error) {
    next(error);
  }
});

// POST submit a review (Public/Customer, holds for approval)
reviewRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, rating, comment, role, isApproved } = req.body;

    if (!name || rating === undefined || !comment) {
      return res.status(400).json({ error: "Name, rating, and comment are required fields" });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    let approved = false;
    if (isApproved === true) {
      const sessionData = await auth.api.getSession({
        headers: new Headers(req.headers as any),
      });
      if (sessionData?.user?.role === "admin") {
        approved = true;
      }
    }

    const newReview = await ReviewService.createReview(name, parsedRating, comment, role, approved);
    res.status(201).json({
      message: approved ? "Review created successfully" : "Review submitted successfully and is pending administrator approval",
      review: newReview
    });
  } catch (error) {
    next(error);
  }
});

// GET all reviews (Admin only - includes pending items)
reviewRouter.get(
  "/admin",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const allReviews = await ReviewService.getAllReviews();
      res.json(allReviews);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH approve moderation status (Admin only)
reviewRouter.patch(
  "/:id/approve",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { isApproved } = req.body;

      if (isApproved === undefined || typeof isApproved !== "boolean") {
        return res.status(400).json({ error: "isApproved boolean field is required in request body" });
      }

      const updated = await ReviewService.approveReview(req.params.id, isApproved);
      if (!updated) {
        return res.status(404).json({ error: "Review not found" });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// PUT update a review (Admin only)
reviewRouter.put(
  "/:id",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, role, rating, comment, isApproved } = req.body;
      const parsedRating = rating !== undefined ? parseInt(rating) : undefined;
      if (parsedRating !== undefined && (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
        return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
      }

      const updated = await ReviewService.updateReview(req.params.id, {
        name,
        role,
        rating: parsedRating,
        comment,
        isApproved
      });

      if (!updated) {
        return res.status(404).json({ error: "Review not found" });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE a review (Admin only)
reviewRouter.delete(
  "/:id",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const deleted = await ReviewService.deleteReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json({ message: "Review deleted successfully", review: deleted });
    } catch (error) {
      next(error);
    }
  }
);
