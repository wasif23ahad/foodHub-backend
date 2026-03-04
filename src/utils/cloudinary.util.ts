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
 * Uploads a local file to Cloudinary and deletes the local file.
 * Returns null if Cloudinary is not configured.
 */
export const uploadToCloudinary = async (localFilePath: string): Promise<string | null> => {
    if (!isCloudinaryConfigured) {
        return null;
    }

    try {
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
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (e) {}

        throw new Error("Failed to upload image to Cloudinary");
    }
};
