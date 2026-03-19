import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            hospitalId: user.hospitalId,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// ─────────────────────────────────────────────
// @route   POST /api/v1/auth/register
// @access  Public (typically ADMIN-only in production)
// ─────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, hospitalId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !hospitalId) {
        throw new ApiError(400, "All fields are required: name, email, password, role, hospitalId");
    }

    // Validate role
    const validRoles = ["DOCTOR", "NURSE", "ADMIN", "DATA_ENGINEER"];
    if (!validRoles.includes(role)) {
        throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "A user with this email already exists");
    }

    // Verify hospital exists
    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) {
        throw new ApiError(404, "Hospital not found");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: { name, email, passwordHash, role, hospitalId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            hospitalId: true,
            createdAt: true,
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User registered successfully"));
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/auth/login
// @access  Public
// ─────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate JWT
    const accessToken = generateAccessToken(user);

    // Strip sensitive field before sending
    const { passwordHash: _, ...safeUser } = user;

    return res
        .status(200)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .json(
            new ApiResponse(200, { user: safeUser, accessToken }, "Login successful")
        );
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/auth/logout
// @access  Private (verifyJWT required)
// ─────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/auth/me
// @access  Private (verifyJWT required)
// ─────────────────────────────────────────────
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// ─────────────────────────────────────────────
// @route   PATCH /api/v1/auth/change-password
// @access  Private (verifyJWT required)
// ─────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Both currentPassword and newPassword are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
    }

    // Fetch full user record (includes passwordHash)
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash: newPasswordHash },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});
