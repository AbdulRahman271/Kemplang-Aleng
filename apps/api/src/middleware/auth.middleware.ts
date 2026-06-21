import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";

export interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
}

export async function authenticateSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Better Auth checks the headers (including authorization header or cookies)
    const sessionData = await auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!sessionData) {
      return res.status(401).json({ error: "Unauthorized: Active session required" });
    }
    req.user = sessionData.user;
    req.session = sessionData.session;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Active session required" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Administrator privileges required" });
  }
  next();
}
