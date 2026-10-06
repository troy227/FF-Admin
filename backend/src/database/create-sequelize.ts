import { Sequelize } from 'sequelize-typescript';
import { getDatabaseConnectionOptions } from './database-config.js';
import { sequelizeModels } from './models/index.js';

export function createSequelize(): Sequelize {
  return new Sequelize({
    ...getDatabaseConnectionOptions(),
    models: sequelizeModels,
    logging: false,
  });
}
