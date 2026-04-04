import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    res.json(
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        productCount: category._count.products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
    );
  } catch (error) {
    console.error("Failed to fetch categories", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
}
