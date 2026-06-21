"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const category_service_1 = require("../services/category.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.categoryRouter = (0, express_1.Router)();
// GET all categories (Public)
exports.categoryRouter.get("/", async (req, res, next) => {
    try {
        const list = await category_service_1.CategoryService.getAllCategories();
        res.json(list);
    }
    catch (error) {
        next(error);
    }
});
// GET single category (Public)
exports.categoryRouter.get("/:id", async (req, res, next) => {
    try {
        const category = await category_service_1.CategoryService.getCategoryById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(category);
    }
    catch (error) {
        next(error);
    }
});
// POST new category (Admin only)
exports.categoryRouter.post("/", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const { id, name, description } = req.body;
        if (!id || !name) {
            return res.status(400).json({ error: "Missing required fields (id, name)" });
        }
        // Check if category already exists
        const existing = await category_service_1.CategoryService.getCategoryById(id);
        if (existing) {
            return res.status(400).json({ error: "Category with this ID already exists" });
        }
        const category = await category_service_1.CategoryService.createCategory({ id, name, description });
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
});
// PUT update category (Admin only)
exports.categoryRouter.put("/:id", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const category = await category_service_1.CategoryService.updateCategory(req.params.id, req.body);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(category);
    }
    catch (error) {
        next(error);
    }
});
// DELETE category (Admin only)
exports.categoryRouter.delete("/:id", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const category = await category_service_1.CategoryService.deleteCategory(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({ message: "Category deleted successfully", category });
    }
    catch (error) {
        next(error);
    }
});
