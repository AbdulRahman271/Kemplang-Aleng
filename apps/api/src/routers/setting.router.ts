import { Router, Request, Response, NextFunction } from "express";
import { SettingService } from "../services/setting.service";
import { authenticateSession, requireAdmin, AuthenticatedRequest } from "../middleware/auth.middleware";

export const settingRouter = Router();

// GET settings map (Public)
settingRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await SettingService.getAllSettings();
    // Convert array of {key, value} to a dictionary
    const settingsMap = list.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    res.json(settingsMap);
  } catch (error) {
    next(error);
  }
});

// PUT update settings (Admin only)
settingRouter.put(
  "/",
  authenticateSession,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const updates: Record<string, string> = req.body;

      if (!updates || typeof updates !== "object") {
        return res.status(400).json({ error: "Invalid updates format. Must be an object." });
      }

      const results: Record<string, string> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const updated = await SettingService.updateSettingByKey(key, String(value));
          results[key] = updated.value;
        }
      }

      res.json({ message: "Settings updated successfully", settings: results });
    } catch (error) {
      next(error);
    }
  }
);
