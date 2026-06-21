"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const order_service_1 = require("../services/order.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.orderRouter = (0, express_1.Router)();
// PLACE order (Public or Authenticated Customer)
exports.orderRouter.post("/", async (req, res, next) => {
    try {
        const { contactPhone, shippingAddress, notes, items } = req.body;
        if (!contactPhone || !shippingAddress || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: "Missing required fields or invalid items list" });
        }
        // Try to extract session for authenticated users, fallback to null for guests
        let userId = null;
        try {
            const { auth } = await Promise.resolve().then(() => __importStar(require("../config/auth")));
            const session = await auth.api.getSession({
                headers: new Headers(req.headers),
            });
            if (session) {
                userId = session.user.id;
            }
        }
        catch (_) {
            // Guest order
        }
        const orderResult = await order_service_1.OrderService.createOrder(userId, contactPhone, shippingAddress, notes || null, items);
        res.status(201).json(orderResult);
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to create order" });
    }
});
// GET user orders (Admins retrieve all, Customers retrieve their own)
exports.orderRouter.get("/", auth_middleware_1.authenticateSession, async (req, res, next) => {
    try {
        if (req.user.role === "admin") {
            const allOrders = await order_service_1.OrderService.getAllOrders();
            return res.json(allOrders);
        }
        else {
            const userOrders = await order_service_1.OrderService.getOrdersByUser(req.user.id);
            return res.json(userOrders);
        }
    }
    catch (error) {
        next(error);
    }
});
// GET single order details (Authenticated and authorized users only)
exports.orderRouter.get("/:id", auth_middleware_1.authenticateSession, async (req, res, next) => {
    try {
        const order = await order_service_1.OrderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        // Authorization: User must be an Admin OR the owner of the order
        if (req.user.role !== "admin" && order.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: Access to this order detail is denied" });
        }
        res.json(order);
    }
    catch (error) {
        next(error);
    }
});
// PATCH update status (Admin only)
exports.orderRouter.patch("/:id/status", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }
        const updatedOrder = await order_service_1.OrderService.updateOrderStatus(req.params.id, status);
        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.json(updatedOrder);
    }
    catch (error) {
        next(error);
    }
});
