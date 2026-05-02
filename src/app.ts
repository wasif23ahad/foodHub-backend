import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { config } from "./config";
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
        if (!origin) return callback(null, true);
        
        const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
        const isVercel = origin.endsWith(".vercel.app");
        const isAllowed = ALLOWED_ORIGINS.includes(origin);

        if (isLocalhost || isVercel || isAllowed) {
            return callback(null, true);
        }
        
        console.warn(`CORS blocked for origin: ${origin}`);
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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Routes
app.use("/api/auth", authRoutes);

app.use("/api", routes);

app.use((_req: Request, res: Response) => {
    sendNotFound(res, "Route not found");
});

app.use(errorHandler);

export default app;
