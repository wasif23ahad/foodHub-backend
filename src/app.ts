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
// CORS - Allow frontend to communicate with backend
const allowedOrigins = [config.frontendUrl, "http://localhost:3000", "http://localhost:5000"];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
            callback(null, true);
        } else {
            console.log(`[CORS] Request from unknown origin: ${origin}`);
            // STRICT MODE: Fail if not in allowed list
            // This prevents "Access-Control-Allow-Origin: *" errors when credentials are true
            // callback(new Error("Not allowed by CORS")); 

            // DEV MODE (Optional - use carefully): Reflect origin but don't wildcard
            callback(null, true);
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight using the SAME options
app.options("*", cors(corsOptions));

// Serve Static Files (Uploads)
// Serve Static Files (Locally & Fallback)
// On Vercel, the 'public' folder is served by the CDN automatically.
// This middleware ensures it works locally.
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));
console.log("📁 Serving static files from:", publicPath);

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

