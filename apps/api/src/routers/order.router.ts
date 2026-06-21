import { Router, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { authenticateSession, requireAdmin, AuthenticatedRequest } from "../middleware/auth.middleware";

export const orderRouter = Router();

// PLACE order (Public or Authenticated Customer)
orderRouter.post("/", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { contactPhone, shippingAddress, notes, items } = req.body;

    if (!contactPhone || !shippingAddress || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Missing required fields or invalid items list" });
    }

    // Try to extract session for authenticated users, fallback to null for guests
    let userId: string | null = null;
    try {
      const { auth } = await import("../config/auth");
      const session = await auth.api.getSession({
        headers: new Headers(req.headers as any),
      });
      if (session) {
        userId = session.user.id;
      }
    } catch (_) {
      // Guest order
    }

    const orderResult = await OrderService.createOrder(
      userId,
      contactPhone,
      shippingAddress,
      notes || null,
      items
    );

    res.status(201).json(orderResult);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create order" });
  }
});

// GET user orders (Admins retrieve all, Customers retrieve their own)
orderRouter.get("/", authenticateSession, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.role === "admin") {
      const allOrders = await OrderService.getAllOrders();
      return res.json(allOrders);
    } else {
      const userOrders = await OrderService.getOrdersByUser(req.user.id);
      return res.json(userOrders);
    }
  } catch (error) {
    next(error);
  }
});

// GET single order details (Authenticated and authorized users only)
orderRouter.get("/:id", authenticateSession, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Authorization: User must be an Admin OR the owner of the order
    if (req.user.role !== "admin" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: Access to this order detail is denied" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PATCH update status (Admin only)
orderRouter.patch(
  "/:id/status",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
      
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const updatedOrder = await OrderService.updateOrderStatus(req.params.id, status);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }
);
