
import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer"; // Import FileFilterCallback directly
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { sendSuccess, sendError } from "../utils/response.util";

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// Extend Request type to include file
interface MulterRequest extends Request {
    file?: any; // Avoiding explicit type to prevent namespace errors
}

// Configure File Filter
const fileFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images are allowed (jpeg, jpg, png, gif, webp)"));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter as any, // Cast to any to avoid strict type mismatch with multer types
});


// Upload Route
router.post("/", upload.single("file"), (req: Request, res: Response) => {
    const multerReq = req as MulterRequest;
    try {
        if (!multerReq.file) {
            return sendError(res, "No file uploaded", 400);
        }

        // URL to access the file
        // Assumes 'uploads' is served statically from the root or via /uploads path
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${multerReq.file.filename}`;

        sendSuccess(res, { url: fileUrl }, "File uploaded successfully");
    } catch (error) {
        console.error("Upload error:", error);
        sendError(res, "File upload failed", 500);
    }
});

export default router;
