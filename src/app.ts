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

const app: Application = express();

const ALLOWED_ORIGINS = [
    "https://foodhub-frontend-sand.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000"
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // In development, be more permissive with localhost
        if (config.nodeEnv === "development" && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
            return callback(null, true);
        }

        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        
        return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
}

const healthPayload = () => ({
    success: true,
    message: "FoodHub API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    allowedOrigin: config.frontendUrl,
});

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "FoodHub API is live",
        docs: "/api/docs"
    });
});
app.get("/health", (_req: Request, res: Response) => res.status(200).json(healthPayload()));
app.get("/api/health", (_req: Request, res: Response) => res.status(200).json(healthPayload()));

// BetterAuth must be mounted before express.json()
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use((_req: Request, res: Response) => {
    sendNotFound(res, "Route not found");
});

app.use(errorHandler);

export default app;
