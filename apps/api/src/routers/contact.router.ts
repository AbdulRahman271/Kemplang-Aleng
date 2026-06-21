import { Router, Request, Response, NextFunction } from "express";
import { ContactService } from "../services/contact.service";
import { authenticateSession, requireAdmin, AuthenticatedRequest } from "../middleware/auth.middleware";

export const contactRouter = Router();

// POST submit contact message (Public)
contactRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: "All fields are required (name, phone, message)" });
    }

    const newMessage = await ContactService.createMessage(name, phone, message);
    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
});

// GET all contact messages (Admin only)
contactRouter.get(
  "/",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const messages = await ContactService.getAllMessages();
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH message status (Admin only)
contactRouter.patch(
  "/:id/status",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const validStatuses = ["unread", "read", "replied"];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value (must be unread, read, or replied)" });
      }

      const updated = await ContactService.updateMessageStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);
