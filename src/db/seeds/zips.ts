import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { zipsTable } from '@/db/schema/zips';
import Papa from 'papaparse';
const fs = require('node:fs/promises');
import path from 'path';

const filePath = path.join(__dirname, 'uszips.csv');

interface CsvRow {
    zip: string;
    lat: string;
    lng: string;
    city: string;
    state_id: string;
    state_name: string;
    timezone: string;
    [key: string]: any;
}


async function getCsv(): Promise<Papa.ParseResult<CsvRow>> {
    return new Promise((acc, rej) => {
        (async() => {
            try {
                const csvRead = await fs.readFile(filePath, { encoding: 'utf8' });
                acc(Papa.parse(csvRead, {header: true}));
            } catch (e) {
                rej(e);
            }
        })();
    });
}

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
    const csv = await getCsv();
    const inserts: any = [];
    csv.data.forEach(d => {
        const n = db.insert(zipsTable).values(d);
        inserts.push(n);
    });
    await Promise.all(inserts);
}

main();