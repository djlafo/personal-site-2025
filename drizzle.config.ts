import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';
import { ConnectionOptions } from 'node:tls';

interface sslOpts {
  ca?: string;
}

export const dbCreds : {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: ConnectionOptions | "prefer";
} = {
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE!,
  ssl: process.env.DATABASE_CA ? {
    ca: process.env.DATABASE_CA!
  } : "prefer"
};

const config: Config = {
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'postgresql',
  dbCredentials: dbCreds,
  migrations: {
    table: 'migrations',
    schema: 'public'
  }
};

export default defineConfig(config);