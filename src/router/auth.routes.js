import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    changePassword,
} from "../controller/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /api/v1/auth/register
router.post("/register", registerUser);

// POST /api/v1/auth/login
router.post("/login", loginUser);

// ─── Protected Routes (JWT required) ─────────────────────────────────────────

// POST /api/v1/auth/logout
router.post("/logout", verifyJWT, logoutUser);

// GET /api/v1/auth/me
router.get("/me", verifyJWT, getCurrentUser);

// PATCH /api/v1/auth/change-password
router.patch("/change-password", verifyJWT, changePassword);

export default router;
