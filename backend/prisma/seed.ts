import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const isDevelopment = process.env.APP_ENV === "development";

const adapter = new PrismaMariaDb({
  host: isDevelopment ? "localhost" : process.env.DB_HOST || "localhost",
  port: isDevelopment ? 3306 : Number(process.env.DB_PORT || 3306),
  user: isDevelopment ? "root" : process.env.DB_USER || "root",
  password: isDevelopment ? "" : process.env.DB_PASSWORD || "",
  database: isDevelopment ? "commerce_checkout" : process.env.DB_NAME || "commerce_checkout",
  ssl: isDevelopment
    ? undefined
    : {
        rejectUnauthorized: true,
      },
});

const prisma = new PrismaClient({ adapter });


const categories = [
  {
    name: "Headphones",
    slug: "headphones",
    description: "Wireless, over-ear, and in-ear audio gear for work and everyday listening.",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Keyboards",
    slug: "keyboards",
    description: "Mechanical and productivity-first keyboards for developers and creators.",
    imageUrl:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Monitors",
    slug: "monitors",
    description: "Sharp displays for coding setups, design work, and hybrid workstations.",
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Useful desk and device accessories that round out a modern setup.",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

const products = [
  {
    name: "Nova ANC Wireless Headphones",
    slug: "nova-anc-wireless-headphones",
    description:
      "Premium wireless headphones with active noise cancellation, 40-hour battery life, and USB-C fast charging.",
    shortDescription: "Noise-cancelling over-ear headphones for commute and focus time.",
    priceInPaise: 1299900,
    compareAtPaise: 1499900,
    sku: "HDP-NOVA-ANC-001",
    brand: "Nova",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
    ]),
    isActive: true,
    stock: 24,
    categorySlug: "headphones",
  },
  {
    name: "Orbit Studio Headphones",
    slug: "orbit-studio-headphones",
    description:
      "Closed-back wired studio headphones with balanced tuning and cushioned ear cups for long sessions.",
    shortDescription: "Reliable wired headphones for editing, mixing, and deep work.",
    priceInPaise: 799900,
    compareAtPaise: null,
    sku: "HDP-ORBIT-STUDIO-002",
    brand: "Orbit",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 16,
    categorySlug: "headphones",
  },
  {
    name: "Pulse Fit Earbuds",
    slug: "pulse-fit-earbuds",
    description:
      "Compact true wireless earbuds with sweat resistance, touch controls, and a slim charging case.",
    shortDescription: "Lightweight wireless earbuds for calls, workouts, and travel.",
    priceInPaise: 599900,
    compareAtPaise: 699900,
    sku: "EAR-PULSE-FIT-003",
    brand: "Pulse",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 40,
    categorySlug: "headphones",
  },
  {
    name: "TypeFlow Mechanical Keyboard",
    slug: "typeflow-mechanical-keyboard",
    description:
      "Tenkeyless mechanical keyboard with hot-swappable switches, white backlight, and Mac/Windows support.",
    shortDescription: "A clean TKL mechanical keyboard built for everyday coding.",
    priceInPaise: 899900,
    compareAtPaise: 999900,
    sku: "KEY-TYPEFLOW-001",
    brand: "TypeFlow",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    imagesJson: JSON.stringify([
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
    ]),
    isActive: true,
    stock: 18,
    categorySlug: "keyboards",
  },
  {
    name: "Grid 96 Wireless Keyboard",
    slug: "grid-96-wireless-keyboard",
    description:
      "A compact 96-key wireless keyboard with multi-device pairing and a gasket-mounted typing feel.",
    shortDescription: "Full productivity layout in a compact wireless form factor.",
    priceInPaise: 1099900,
    compareAtPaise: null,
    sku: "KEY-GRID96-002",
    brand: "Grid",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 9,
    categorySlug: "keyboards",
  },
  {
    name: "LiteKeys Office Keyboard",
    slug: "litekeys-office-keyboard",
    description:
      "Low-profile wireless keyboard with quiet scissor switches and all-day battery life for office setups.",
    shortDescription: "Quiet, low-profile typing for focused office work.",
    priceInPaise: 449900,
    compareAtPaise: 499900,
    sku: "KEY-LITE-003",
    brand: "LiteKeys",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 27,
    categorySlug: "keyboards",
  },
  {
    name: "Vista 27 QHD Monitor",
    slug: "vista-27-qhd-monitor",
    description:
      "27-inch QHD IPS monitor with thin bezels, ergonomic stand, and USB-C connectivity for modern desks.",
    shortDescription: "Sharp 27-inch display for coding, design, and general work.",
    priceInPaise: 2299900,
    compareAtPaise: 2499900,
    sku: "MON-VISTA27-001",
    brand: "Vista",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 11,
    categorySlug: "monitors",
  },
  {
    name: "Frame UltraWide Monitor",
    slug: "frame-ultrawide-monitor",
    description:
      "34-inch ultrawide monitor with a 144Hz refresh rate, ideal for multitasking, dashboards, and immersive work.",
    shortDescription: "Ultrawide screen real estate for deep multitasking.",
    priceInPaise: 3999900,
    compareAtPaise: 4299900,
    sku: "MON-FRAME-002",
    brand: "Frame",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 6,
    categorySlug: "monitors",
  },
  {
    name: "Pixel 24 Everyday Monitor",
    slug: "pixel-24-everyday-monitor",
    description:
      "24-inch full HD IPS monitor with a simple stand and reliable panel quality for home office setups.",
    shortDescription: "A dependable entry monitor for daily work and study.",
    priceInPaise: 1199900,
    compareAtPaise: null,
    sku: "MON-PIXEL24-003",
    brand: "Pixel",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 20,
    categorySlug: "monitors",
  },
  {
    name: "DockHub USB-C Dock",
    slug: "dockhub-usb-c-dock",
    description:
      "A compact USB-C dock with HDMI, Ethernet, SD card reader, and pass-through charging for laptop desks.",
    shortDescription: "A practical USB-C dock for hybrid work setups.",
    priceInPaise: 699900,
    compareAtPaise: 799900,
    sku: "ACC-DOCKHUB-001",
    brand: "DockHub",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 31,
    categorySlug: "accessories",
  },
  {
    name: "Rise Laptop Stand",
    slug: "rise-laptop-stand",
    description:
      "Aluminum laptop stand with adjustable height and foldable design to improve desk ergonomics.",
    shortDescription: "An adjustable stand that makes laptop setups more ergonomic.",
    priceInPaise: 349900,
    compareAtPaise: null,
    sku: "ACC-RISE-002",
    brand: "Rise",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 44,
    categorySlug: "accessories",
  },
  {
    name: "Glide XL Desk Mat",
    slug: "glide-xl-desk-mat",
    description:
      "Extended desk mat with stitched edges and a spill-resistant surface for keyboard and mouse setups.",
    shortDescription: "A clean oversized desk mat for a polished workspace.",
    priceInPaise: 199900,
    compareAtPaise: 249900,
    sku: "ACC-GLIDE-003",
    brand: "Glide",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80",
    imagesJson: null,
    isActive: true,
    stock: 52,
    categorySlug: "accessories",
  },
] as const;

async function main() {
  console.log("Seed script started");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      create: category,
    });
  }

  const categoryMap = new Map(
    (
      await prisma.category.findMany({
        select: { id: true, slug: true },
      })
    ).map((category) => [category.slug, category.id]),
  );

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Category with slug "${product.categorySlug}" was not found during seeding.`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        priceInPaise: product.priceInPaise,
        compareAtPaise: product.compareAtPaise,
        sku: product.sku,
        brand: product.brand,
        thumbnailUrl: product.thumbnailUrl,
        imagesJson: product.imagesJson,
        isActive: product.isActive,
        stock: product.stock,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        priceInPaise: product.priceInPaise,
        compareAtPaise: product.compareAtPaise,
        sku: product.sku,
        brand: product.brand,
        thumbnailUrl: product.thumbnailUrl,
        imagesJson: product.imagesJson,
        isActive: product.isActive,
        stock: product.stock,
        categoryId,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
