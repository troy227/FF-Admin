import type { Sequelize } from 'sequelize-typescript';
import { createSequelize } from './create-sequelize.js';

let sequelize: Sequelize | undefined;

export function getSequelize(): Sequelize {
  if (!sequelize) {
    sequelize = createSequelize();
  }
  return sequelize;
}

export async function connectDatabase(): Promise<void> {
  await getSequelize().authenticate();
}

export async function disconnectDatabase(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    sequelize = undefined;
  }
}
