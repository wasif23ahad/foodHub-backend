import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { config } from "./config";
import { auth } from "./lib/auth";
import { errorHandler } from "./middlewares";
import { sendNotFound } from "./utils";
import routes from "./routes";
// Create Express app
const app = express();
// ======================
// MIDDLEWARE
// ======================
// CORS - Allow frontend to communicate with backend
app.use(cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true, // Allow cookies for BetterAuth sessions
}));
// Request logging (dev mode only)
if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
}
// =====================================
// HEALTH CHECK (before json middleware)
// =====================================
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "FoodHub API is running",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});
// ========================================
// BETTER AUTH HANDLER
// Must be BEFORE express.json() middleware
// ========================================
app.all("/api/auth/*splat", toNodeHandler(auth));
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
app.use((_req, res) => {
    sendNotFound(res, "Route not found");
});
// ======================
// GLOBAL ERROR HANDLER
// ======================
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map