import "reflect-metadata";
import type { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "@/server/database/data-source";

let initializing: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!initializing) {
    initializing = AppDataSource.initialize().catch((err) => {
      initializing = null;
      throw err;
    });
  }

  await initializing;
  return AppDataSource;
}

export async function getRepository<Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>
): Promise<Repository<Entity>> {
  return (await getDataSource()).getRepository(entity);
}

export default getDataSource;
