"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const node_1 = require("better-auth/node");
const auth_1 = require("../config/auth");
exports.authRouter = (0, express_1.Router)();
// Mount Better Auth's Node/Express handler to handle login, signup, sessions, verification, etc.
exports.authRouter.all("*", (0, node_1.toNodeHandler)(auth_1.auth));
