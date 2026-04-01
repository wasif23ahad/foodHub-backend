import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary only if environment variables are present
const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
        api_key: process.env.CLOUDINARY_API_KEY as string,
        api_secret: process.env.CLOUDINARY_API_SECRET as string,
    });
}

/**
 * Uploads a local file or buffer to Cloudinary.
 * Returns null if Cloudinary is not configured.
 */
export const uploadToCloudinary = async (fileInput: string | Buffer, originalName?: string): Promise<string | null> => {
    if (!isCloudinaryConfigured) {
        return null;
    }

    try {
        if (Buffer.isBuffer(fileInput)) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "foodhub_uploads", resource_type: "auto" },
                    (error, result) => {
                        if (error) return reject(new Error("Failed to upload image buffer to Cloudinary"));
                        resolve(result?.secure_url || null);
                    }
                );
                uploadStream.end(fileInput);
            });
        }

        // Handle string file path (legacy support)
        const localFilePath = fileInput as string;
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "foodhub_uploads",
            resource_type: "auto",
        });

        // Delete the local file after successful upload
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Failed to delete local file after Cloudinary upload", unlinkError);
        }

        return response.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        
        // Still try to delete local file on upload error to prevent disk space issues
        if (typeof fileInput === "string") {
            try {
                if (fs.existsSync(fileInput)) {
                    fs.unlinkSync(fileInput);
                }
            } catch (e) {}
        }

        throw new Error("Failed to upload image to Cloudinary");
    }
};
