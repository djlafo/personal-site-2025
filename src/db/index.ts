import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConnectionOptions } from 'node:tls';

interface connectionInfo {
    connectionString?: string,
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    ssl?: ConnectionOptions | boolean;
}

const config : {
    connection: connectionInfo
} = {
    connection: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE,
        ssl: process.env.DATABASE_CA ? {
            ca: process.env.DATABASE_CA,
            rejectUnauthorized: true
        } : false
    }
};

const db = drizzle(config);
export default db;
