import "reflect-metadata";
import { config } from "dotenv";
import path from "path";
import { DataSource } from "typeorm";
import { getMigrationDataSourceOptions } from "./data-source-options";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();

/** CLI-only DataSource — includes migrations (not loaded by Next.js runtime). */
export default new DataSource(getMigrationDataSourceOptions());
