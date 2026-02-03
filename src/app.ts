import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { config } from "./config";
import { auth } from "./lib/auth";
import { errorHandler } from "./middlewares";
import { sendNotFound } from "./utils";
import routes from "./routes";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app: Application = express();

// ======================
// MIDDLEWARE
// ======================

// CORS - Allow frontend to communicate with backend
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            const normalizedOrigin = origin.replace(/\/$/, "");
            const normalizedAllowed = config.frontendUrl.replace(/\/$/, "");

            console.log(`[CORS] Request: ${origin} | Allowed: ${config.frontendUrl}`);

            if (normalizedOrigin === normalizedAllowed) {
                callback(null, true);
            } else {
                console.warn(`[CORS] Denied: ${origin} does not match ${config.frontendUrl}`);
                callback(null, false);
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true, // Allow cookies for BetterAuth sessions
    })
);

// Serve Static Files (Uploads)
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));
console.log("📁 Serving static files from:", uploadsPath);

// Request logging (dev mode only)
if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
}

// =====================================
// HEALTH CHECK (before json middleware)
// =====================================
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "FoodHub API is running",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        allowedOrigin: config.frontendUrl,
    });
});

// ========================================
// BETTER AUTH HANDLER
// Must be BEFORE express.json() middleware
// ========================================
app.all("/api/auth/*path", toNodeHandler(auth));

// JSON body parser (after BetterAuth, before other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// API ROUTES
// ======================
app.use("/api", routes);

// ======================
// 404 HANDLER
// ======================
app.use((_req: Request, res: Response) => {
    sendNotFound(res, "Route not found");
});

// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use(errorHandler);

export default app;

