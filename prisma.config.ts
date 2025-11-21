import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma configuration for database connection and migrations
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  // Connection URLs for database access
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
});
