import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

export async function getProducts(req: Request, res: Response) {
  try {
    const page = parsePositiveInt(req.query.page as string | undefined, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit as string | undefined, 12), 50);
    const search = (req.query.search as string | undefined)?.trim();
    const category = (req.query.category as string | undefined)?.trim();

    const where = {
      isActive: true,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              {
                description: {
                  contains: search,
                },
              },
              {
                brand: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch products", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Product id must be a positive integer" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
      },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("Failed to fetch product", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
}
