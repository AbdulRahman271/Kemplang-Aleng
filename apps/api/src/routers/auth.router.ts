import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth";

export const authRouter = Router();

// Mount Better Auth's Node/Express handler to handle login, signup, sessions, verification, etc.
authRouter.all("*", toNodeHandler(auth));
