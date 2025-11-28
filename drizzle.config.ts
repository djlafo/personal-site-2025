import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';
import { readFileSync } from 'node:fs';
import { ConnectionOptions } from 'node:tls';

let ca: ReturnType<typeof readFileSync> | boolean; 
try {
  ca = readFileSync('./ca.pem');
} catch {
  ca = false
}

export const dbCreds : {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: ConnectionOptions | boolean;
} = {
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE!,
  ssl: ca ? {
    ca
  } : false
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