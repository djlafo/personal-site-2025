'use server'

import db from '@/db';
import { zipsTable } from '@/db/schema/zips';
import { eq } from 'drizzle-orm';

// /* BROWSER BASED LOCATION */
// export async function getBrowserCoordinates(): Promise<string>  {
//     return new Promise((acc, rej) => {
//         if ("geolocation" in navigator) {
//             const onPosition = (p: GeolocationPosition) => {
//                 // acc(`${p.coords.latitude},${p.coords.longitude}`);
//                 if(p.addre)
//             }
    
//             navigator.geolocation.getCurrentPosition(onPosition, 
//                 e => {
//                     rej(e);
//                 }, {
//                     maximumAge: 60000,
//                     timeout: 5000,
//                     enableHighAccuracy: false
//                 });
//         } else {
//             rej(new Error('Geolocation not available'));
//         }
//     })
// }


export async function getCityFromZip(zip: string) {
    const row = await db.select().from(zipsTable).where(eq(zipsTable.zip, zip));
    if(row.length === 1) return `${row[0].city}, ${row[0].state_name}`;
}

export async function getCoordsFromZip(zip: string) : Promise<string> {
    const row = await db.select().from(zipsTable).where(eq(zipsTable.zip, zip));
    if(row.length === 1) {
        return `${row[0].lat},${row[0].lng}`;
    } else {
        throw new Error('ZIP not found');
    }
}

/* HELPER FUNCTIONS */
// function deg2rad(deg : number) : number {
//     return deg * (Math.PI/180)
// }

// const dist = getDistance(lat, long, Number(c.lat), Number(c.lng));
// const dist2 = getDistance(lat, long, Number(d.lat), Number(d.lng));
// return dist < dist2 ? c : d; 

// function getDistance(lat1 : number, lon1 : number, lat2 : number, lon2 : number) : number {
//     const R = 3958.8;
//     const dLat = deg2rad(lat2-lat1);  // deg2rad below
//     const dLon = deg2rad(lon2-lon1); 
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
//       Math.sin(dLon/2) * Math.sin(dLon/2)
//       ; 
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//     const d = R * c;
//     return d;
// }
