"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = require("express");
const review_service_1 = require("../services/review.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_1 = require("../config/auth");
exports.reviewRouter = (0, express_1.Router)();
// GET approved reviews (Public)
exports.reviewRouter.get("/", async (req, res, next) => {
    try {
        const approvedReviews = await review_service_1.ReviewService.getApprovedReviews();
        res.json(approvedReviews);
    }
    catch (error) {
        next(error);
    }
});
// POST submit a review (Public/Customer, holds for approval)
exports.reviewRouter.post("/", async (req, res, next) => {
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
            const sessionData = await auth_1.auth.api.getSession({
                headers: new Headers(req.headers),
            });
            if (sessionData?.user?.role === "admin") {
                approved = true;
            }
        }
        const newReview = await review_service_1.ReviewService.createReview(name, parsedRating, comment, role, approved);
        res.status(201).json({
            message: approved ? "Review created successfully" : "Review submitted successfully and is pending administrator approval",
            review: newReview
        });
    }
    catch (error) {
        next(error);
    }
});
// GET all reviews (Admin only - includes pending items)
exports.reviewRouter.get("/admin", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const allReviews = await review_service_1.ReviewService.getAllReviews();
        res.json(allReviews);
    }
    catch (error) {
        next(error);
    }
});
// PATCH approve moderation status (Admin only)
exports.reviewRouter.patch("/:id/approve", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const { isApproved } = req.body;
        if (isApproved === undefined || typeof isApproved !== "boolean") {
            return res.status(400).json({ error: "isApproved boolean field is required in request body" });
        }
        const updated = await review_service_1.ReviewService.approveReview(req.params.id, isApproved);
        if (!updated) {
            return res.status(404).json({ error: "Review not found" });
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// PUT update a review (Admin only)
exports.reviewRouter.put("/:id", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const { name, role, rating, comment, isApproved } = req.body;
        const parsedRating = rating !== undefined ? parseInt(rating) : undefined;
        if (parsedRating !== undefined && (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
            return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
        }
        const updated = await review_service_1.ReviewService.updateReview(req.params.id, {
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
    }
    catch (error) {
        next(error);
    }
});
// DELETE a review (Admin only)
exports.reviewRouter.delete("/:id", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const deleted = await review_service_1.ReviewService.deleteReview(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Review not found" });
        }
        res.json({ message: "Review deleted successfully", review: deleted });
    }
    catch (error) {
        next(error);
    }
});
