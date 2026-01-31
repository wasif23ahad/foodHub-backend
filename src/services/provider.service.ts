import prisma from "../lib/prisma";
import { NotFoundError, ConflictError } from "../utils/AppError";
import type { CreateProviderProfileInput, UpdateProviderProfileInput } from "../validations/provider.validation";

// ═══════════════════════════════════════════════════════════
// PROVIDER SERVICE
// Business logic for provider profile management
// ═══════════════════════════════════════════════════════════

/**
 * Get provider profile by user ID
 */
export const getProfileByUserId = async (userId: string) => {
    const profile = await prisma.providerProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (!profile) {
        throw new NotFoundError("Provider profile not found");
    }

    return profile;
};

/**
 * Create provider profile
 */
export const createProfile = async (userId: string, data: CreateProviderProfileInput) => {
    // Check if profile already exists
    const existing = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (existing) {
        throw new ConflictError("Provider profile already exists");
    }

    // Create the profile - explicitly build data to handle undefined vs null
    const profile = await prisma.providerProfile.create({
        data: {
            userId,
            businessName: data.businessName,
            description: data.description ?? null,
            logo: data.logo ?? null,
            address: data.address ?? null,
            phone: data.phone ?? null,
            cuisineType: data.cuisineType ?? null,
            contactEmail: data.contactEmail ?? null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    return profile;
};

/**
 * Update provider profile
 */
export const updateProfile = async (userId: string, data: UpdateProviderProfileInput) => {
    // Check if profile exists
    const existing = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (!existing) {
        throw new NotFoundError("Provider profile not found");
    }

    // Update the profile - build update data with only defined values
    const updateData: Record<string, unknown> = {};
    if (data.businessName !== undefined) updateData["businessName"] = data.businessName;
    if (data.description !== undefined) updateData["description"] = data.description;
    if (data.logo !== undefined) updateData["logo"] = data.logo;
    if (data.address !== undefined) updateData["address"] = data.address;
    if (data.phone !== undefined) updateData["phone"] = data.phone;
    if (data.cuisineType !== undefined) updateData["cuisineType"] = data.cuisineType;
    if (data.contactEmail !== undefined) updateData["contactEmail"] = data.contactEmail;
    if (data.isActive !== undefined) updateData["isActive"] = data.isActive;

    const profile = await prisma.providerProfile.update({
        where: { userId },
        data: updateData,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    return profile;
};

/**
 * Get provider profile by ID (public)
 */
export const getProfileById = async (profileId: string) => {
    const profile = await prisma.providerProfile.findUnique({
        where: { id: profileId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            meals: {
                where: { isAvailable: true },
                include: {
                    category: true,
                },
            },
        },
    });

    if (!profile) {
        throw new NotFoundError("Provider not found");
    }

    return profile;
};

/**
 * Get all active providers
 */
export const getAllProviders = async () => {
    const providers = await prisma.providerProfile.findMany({
        where: { isActive: true },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            _count: {
                select: { meals: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return providers;
};
