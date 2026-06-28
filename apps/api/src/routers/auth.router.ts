import { Router } from "express";
import { auth } from "../config/auth";

export const authRouter = Router();

// Mount Better Auth's Node/Express handler to handle login, signup, sessions, verification, etc.
authRouter.all("*", async (req, res, next) => {
  try {
    const { toNodeHandler } = await import("better-auth/node");
    return toNodeHandler(auth)(req, res);
  } catch (err) {
    next(err);
  }
});
