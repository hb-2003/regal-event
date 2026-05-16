import "reflect-metadata";
import { config } from "dotenv";
import path from "path";
import { DataSource } from "typeorm";
import { getBaseDataSourceOptions } from "./data-source-options";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();

/** Runtime DataSource for Next.js — entities only (no migrations). */
export const AppDataSource = new DataSource(getBaseDataSourceOptions());
