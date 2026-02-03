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


// CORS - Must return a specific origin (never *) when credentials: true
const allowedOrigins = [
    config.frontendUrl,
    "https://foodhub-frontend-sand.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000"
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // When credentials are included, browser forbids Access-Control-Allow-Origin: *
        // So we only allow specific origins and never return *
        if (!origin) {
            return callback(null, allowedOrigins[0] ?? false);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, origin);
        }
        return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight using the SAME options
app.options("*", cors(corsOptions));

// Static files are handled by Vercel's Edge Network
// Local dev fallback is not needed if we rely on Vercel
// const publicPath = path.join(process.cwd(), "public");
// app.use(express.static(publicPath));

// Request logging (dev mode only)
if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
}

// =====================================
// HEALTH CHECK (before json middleware)
// Local: GET /health. Vercel: only /api/* hits serverless, so also expose /api/health
// =====================================
const healthPayload = () => ({
    success: true,
    message: "FoodHub API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    allowedOrigin: config.frontendUrl,
});
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json(healthPayload());
});
app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json(healthPayload());
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

