import path from "path";
import type { DataSourceOptions } from "typeorm";
import {
  Admin,
  Booking,
  Category,
  Contact,
  Gallery,
  Review,
  ReviewInvite,
  Setting,
  Video,
} from "./entities";

export const entities = [
  Admin,
  Booking,
  Category,
  Contact,
  Gallery,
  Review,
  ReviewInvite,
  Setting,
  Video,
];

export function getBaseDataSourceOptions(): DataSourceOptions {
  return {
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/regal_events",
    entities,
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    extra: {
      connectionTimeoutMillis: 10_000,
    },
  };
}

export function getMigrationDataSourceOptions(): DataSourceOptions {
  return {
    ...getBaseDataSourceOptions(),
    migrations: [path.join(process.cwd(), "migrations", "*.{ts,js}")],
    migrationsTableName: "migrations",
  };
}
