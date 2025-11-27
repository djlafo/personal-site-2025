import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';
import type { ConnectionOptions } from 'tls';

interface sslOpts {
  ca?: string;
}

const dbCreds : {
  url: string;
  ssl?: ConnectionOptions;
} = {
  url: process.env.DATABASE_URL!,
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
