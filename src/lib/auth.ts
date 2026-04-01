import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { config } from "../config";
export const auth = betterAuth({
    baseURL: config.betterAuthUrl,

    secret: config.betterAuthSecret,

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 6,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "CUSTOMER",
                input: true,
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
            banned: {
                type: "boolean",
                required: false,
                defaultValue: false,
                input: false,
            },
            banReason: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },

    account: {
        skipStateCookieCheck: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },

    plugins: [],

    advanced: {
        useSecureCookies: config.nodeEnv === "production",
        crossSubDomainCookies: {
            enabled: config.nodeEnv === "production",
        },
        defaultCookieAttributes: {
            sameSite: config.nodeEnv === "production" ? "none" : "lax",
            secure: config.nodeEnv === "production",
        },
    },

    trustedOrigins: [
        "https://foodhub-frontend-sand.vercel.app",
        "http://localhost:3000",
    ].filter(Boolean),
});

export type Auth = typeof auth;
