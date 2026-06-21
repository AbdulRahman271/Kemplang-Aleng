"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRouter = void 0;
const express_1 = require("express");
const contact_service_1 = require("../services/contact.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.contactRouter = (0, express_1.Router)();
// POST submit contact message (Public)
exports.contactRouter.post("/", async (req, res, next) => {
    try {
        const { name, phone, message } = req.body;
        if (!name || !phone || !message) {
            return res.status(400).json({ error: "All fields are required (name, phone, message)" });
        }
        const newMessage = await contact_service_1.ContactService.createMessage(name, phone, message);
        res.status(201).json(newMessage);
    }
    catch (error) {
        next(error);
    }
});
// GET all contact messages (Admin only)
exports.contactRouter.get("/", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const messages = await contact_service_1.ContactService.getAllMessages();
        res.json(messages);
    }
    catch (error) {
        next(error);
    }
});
// PATCH message status (Admin only)
exports.contactRouter.patch("/:id/status", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ["unread", "read", "replied"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value (must be unread, read, or replied)" });
        }
        const updated = await contact_service_1.ContactService.updateMessageStatus(req.params.id, status);
        if (!updated) {
            return res.status(404).json({ error: "Message not found" });
        }
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
