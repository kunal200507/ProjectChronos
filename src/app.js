import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth.routes.js';
import { ApiError } from './utils/ApiError.js';

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err instanceof ApiError ? err.message : "Internal Server Error";
    const errors = err instanceof ApiError ? err.errors : [];

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
    });
});

export default app;