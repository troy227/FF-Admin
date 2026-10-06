export function getDatabaseConnectionOptions() {
  return {
    dialect: 'postgres' as const,
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME ?? 'myapp_db',
    username: process.env.DATABASE_USER ?? 'home_user',
    password: process.env.DATABASE_PASSWORD ?? 'home_user',
  };
}
