import prisma from "../lib/prisma";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/AppError";
// ═══════════════════════════════════════════════════════════
// CATEGORY SERVICE
// Business logic for category management
// ═══════════════════════════════════════════════════════════
/**
 * Get all categories with optional filters
 */
export const getCategories = async (query) => {
    const { search, page, limit } = query;
    const where = {};
    if (search) {
        where["OR"] = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
        prisma.category.findMany({
            where,
            include: {
                _count: {
                    select: { meals: true },
                },
            },
            orderBy: { name: "asc" },
            skip,
            take: limit,
        }),
        prisma.category.count({ where }),
    ]);
    return {
        categories,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
            _count: {
                select: { meals: true },
            },
        },
    });
    if (!category) {
        throw new NotFoundError("Category not found");
    }
    return category;
};
/**
 * Create a new category (Admin only)
 */
export const createCategory = async (data) => {
    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
    });
    if (existingCategory) {
        throw new ConflictError("A category with this name already exists");
    }
    const category = await prisma.category.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            image: data.image ?? null,
        },
    });
    return category;
};
/**
 * Update a category (Admin only)
 */
export const updateCategory = async (categoryId, data) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
    });
    if (!category) {
        throw new NotFoundError("Category not found");
    }
    // Check if new name conflicts with existing category
    if (data.name && data.name !== category.name) {
        const existingCategory = await prisma.category.findUnique({
            where: { name: data.name },
        });
        if (existingCategory) {
            throw new ConflictError("A category with this name already exists");
        }
    }
    const updateData = {};
    if (data.name !== undefined)
        updateData["name"] = data.name;
    if (data.description !== undefined)
        updateData["description"] = data.description;
    if (data.image !== undefined)
        updateData["image"] = data.image;
    const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: updateData,
    });
    return updatedCategory;
};
/**
 * Delete a category (Admin only)
 */
export const deleteCategory = async (categoryId) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
            _count: {
                select: { meals: true },
            },
        },
    });
    if (!category) {
        throw new NotFoundError("Category not found");
    }
    // Prevent deletion if category has meals
    if (category._count.meals > 0) {
        throw new BadRequestError(`Cannot delete category with ${category._count.meals} meal(s). Please reassign or delete the meals first.`);
    }
    await prisma.category.delete({
        where: { id: categoryId },
    });
    return { message: "Category deleted successfully" };
};
//# sourceMappingURL=category.service.js.map