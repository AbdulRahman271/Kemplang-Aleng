"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSession = authenticateSession;
exports.requireAdmin = requireAdmin;
const auth_1 = require("../config/auth");
async function authenticateSession(req, res, next) {
    try {
        // Better Auth checks the headers (including authorization header or cookies)
        const sessionData = await auth_1.auth.api.getSession({
            headers: new Headers(req.headers),
        });
        if (!sessionData) {
            return res.status(401).json({ error: "Unauthorized: Active session required" });
        }
        req.user = sessionData.user;
        req.session = sessionData.session;
        next();
    }
    catch (error) {
        next(error);
    }
}
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized: Active session required" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Administrator privileges required" });
    }
    next();
}
