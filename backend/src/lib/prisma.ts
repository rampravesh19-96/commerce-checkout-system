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

export const prisma = new PrismaClient({ adapter });