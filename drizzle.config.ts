import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';
import type { ConnectionOptions } from 'tls';

interface sslOpts {
  ca?: string;
}

const dbCreds : {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: ConnectionOptions;
} = {
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE!
};

if(process.env.DATABASE_CA) {
  const sslOpts: ConnectionOptions = {
    ca: process.env.DATABASE_CA!
  };
  dbCreds.ssl = sslOpts;
}

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
