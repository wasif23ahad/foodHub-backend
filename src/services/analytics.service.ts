import prisma from "../lib/prisma";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";

/**
 * Get Admin Global Analytics
 */
export const getAdminAnalytics = async (days: number = 30) => {
    const startDate = subDays(startOfDay(new Date()), days);

    // 1. Revenue & Order Time-series
    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: startDate },
            status: "DELIVERED",
        },
        select: {
            totalAmount: true,
            createdAt: true,
        },
    });

    // 2. Aggregate by day
    const dayInterval = eachDayOfInterval({
        start: startDate,
        end: new Date(),
    });

    const timeSeries = dayInterval.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayOrders = orders.filter(o => format(o.createdAt, "yyyy-MM-dd") === dateStr);
        
        return {
            date: dateStr,
            revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
            orders: dayOrders.length,
        };
    });

    // 3. Category Distribution
    const categoryStats = await prisma.orderItem.groupBy({
        by: ["mealId"],
        _count: true,
        where: {
            order: { status: "DELIVERED" }
        }
    });

    // Get meal details for categories
    const meals = await prisma.meal.findMany({
        where: { id: { in: categoryStats.map(s => s.mealId) } },
        include: { category: true }
    });

    const categoryDistribution: Record<string, number> = {};
    categoryStats.forEach(stat => {
        const meal = meals.find(m => m.id === stat.mealId);
        const catName = meal?.category?.name || "Unknown";
        categoryDistribution[catName] = (categoryDistribution[catName] || 0) + stat._count;
    });

    return {
        timeSeries,
        categoryDistribution: Object.entries(categoryDistribution).map(([name, value]) => ({ name, value })),
        topProviders: await getTopProviders(5),
    };
};

/**
 * Get Provider Specific Analytics
 */
export const getProviderAnalytics = async (providerId: string, days: number = 30) => {
    const startDate = subDays(startOfDay(new Date()), days);

    const orders = await prisma.order.findMany({
        where: {
            providerProfileId: providerId,
            createdAt: { gte: startDate },
            status: "DELIVERED",
        },
        select: {
            totalAmount: true,
            createdAt: true,
        },
    });

    const dayInterval = eachDayOfInterval({
        start: startDate,
        end: new Date(),
    });

    const timeSeries = dayInterval.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const dayOrders = orders.filter(o => format(o.createdAt, "yyyy-MM-dd") === dateStr);
        
        return {
            date: dateStr,
            revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
            orders: dayOrders.length,
        };
    });

    // Top selling meals for this provider
    const topMeals = await prisma.orderItem.groupBy({
        by: ["mealId"],
        where: {
            order: { 
                providerProfileId: providerId,
                status: "DELIVERED" 
            }
        },
        _count: true,
        orderBy: {
            _count: {
                mealId: "desc"
            }
        },
        take: 5
    });

    const mealDetails = await prisma.meal.findMany({
        where: { id: { in: topMeals.map(m => m.mealId) } },
        select: { id: true, name: true }
    });

    return {
        timeSeries,
        topMeals: topMeals.map(m => ({
            name: mealDetails.find(d => d.id === m.mealId)?.name || "Unknown",
            orders: m._count
        }))
    };
};

/**
 * Helper: Get Top Providers by Revenue
 */
async function getTopProviders(limit: number) {
    const topProviders = await prisma.order.groupBy({
        by: ["providerProfileId"],
        where: { status: "DELIVERED" },
        _sum: { totalAmount: true },
        orderBy: {
            _sum: { totalAmount: "desc" }
        },
        take: limit
    });

    const profiles = await prisma.providerProfile.findMany({
        where: { id: { in: topProviders.map(p => p.providerProfileId) } },
        select: { id: true, businessName: true }
    });

    return topProviders.map(p => ({
        name: profiles.find(profile => profile.id === p.providerProfileId)?.businessName || "Unknown",
        revenue: Number(p._sum.totalAmount)
    }));
}
