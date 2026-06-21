"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingRouter = void 0;
const express_1 = require("express");
const setting_service_1 = require("../services/setting.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.settingRouter = (0, express_1.Router)();
// GET settings map (Public)
exports.settingRouter.get("/", async (req, res, next) => {
    try {
        const list = await setting_service_1.SettingService.getAllSettings();
        // Convert array of {key, value} to a dictionary
        const settingsMap = list.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    }
    catch (error) {
        next(error);
    }
});
// PUT update settings (Admin only)
exports.settingRouter.put("/", auth_middleware_1.authenticateSession, auth_middleware_1.requireAdmin, async (req, res, next) => {
    try {
        const updates = req.body;
        if (!updates || typeof updates !== "object") {
            return res.status(400).json({ error: "Invalid updates format. Must be an object." });
        }
        const results = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                const updated = await setting_service_1.SettingService.updateSettingByKey(key, String(value));
                results[key] = updated.value;
            }
        }
        res.json({ message: "Settings updated successfully", settings: results });
    }
    catch (error) {
        next(error);
    }
});
