try {
  require("dotenv/config");
} catch (e) {
  // dotenv optional if environment variables are provided by host
}
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "file:./dev.db",
  },
});
