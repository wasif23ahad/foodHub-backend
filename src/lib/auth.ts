import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// import { admin } from "better-auth/plugins";
import prisma from "./prisma";
import { config } from "../config";

// ======================
// BETTER AUTH CONFIGURATION
// ======================

export const auth = betterAuth({
    // Base URL for auth endpoints
    // CRITICAL FIX: To prevent the Google `state_mismatch` cookie error on Vercel,
    // Google MUST redirect straight back to the backend. The frontend will make
    // direct cross-origin requests to the backend so the state cookie is saved as first-party.
    baseURL: config.betterAuthUrl + "/api/auth",

    // Secret for signing tokens/cookies
    secret: config.betterAuthSecret,

    // ======================
    // DATABASE ADAPTER
    // ======================
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // ======================
    // EMAIL & PASSWORD AUTH
    // ======================
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Simplified for assignment
        minPasswordLength: 6,
    },

    // ======================
    // SOCIAL PROVIDERS
    // ======================
    socialProviders: {
        google: {
            clientId: config.googleClientId || "",
            clientSecret: config.googleClientSecret || "",
        },
    },

    // ======================
    // USER CONFIGURATION
    // ======================
    user: {
        // Additional fields to store on user
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "CUSTOMER",
                input: true, // Allow setting during registration
            },
            address: {
                type: "string",
                required: false,
                input: true,
            },
            phone: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },

    // ======================
    // SESSION CONFIGURATION
    // ======================
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },

    // ======================
    // PLUGINS
    // ======================
    plugins: [
        // Admin plugin for user management
        // Admin plugin removed to allow public role changes
    ],

    // ======================
    // ADVANCED OPTIONS
    // ======================
    advanced: {
        // Use secure cookies in production
        useSecureCookies: config.nodeEnv === "production",
        defaultCookieAttributes: {
            sameSite: config.nodeEnv === "production" ? "none" : "lax",
            secure: config.nodeEnv === "production",
        },
    },

    // ======================
    // TRUSTED ORIGINS (FRONTEND_URL + deployed URL for serverless)
    // ======================
    trustedOrigins: [
        config.frontendUrl,
        "https://foodhub-frontend-sand.vercel.app",
        "http://localhost:3000",
    ].filter(Boolean),
});

// Export auth type for client
export type Auth = typeof auth;
