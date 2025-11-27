import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConnectionOptions } from 'node:tls';

interface connectionInfo {
    connectionString: string,
    ssl?: ConnectionOptions
}

const config : {
    connection: connectionInfo
} = {
    connection: {
        connectionString: `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE}`,
        ssl: process.env.DATABASE_CA ? {
            ca: process.env.DATABASE_CA
        } : undefined
    }
};

const db = drizzle(config);
export default db;
