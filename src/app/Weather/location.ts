import Papa from 'papaparse';

/* BROWSER BASED LOCATION */
export async function getBrowserCoordinates() : Promise<string> {
    return new Promise((acc, rej) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(p => {
                acc(`${p.coords.latitude},${p.coords.longitude}`);
            }, e => {
                rej(e.message);
            }, {
                maximumAge: 60000,
                timeout: 5000,
                enableHighAccuracy: false
            });
        } else {
            rej(new Error('Geolocation not available'));
        }
    });
};

/* TRANSLATION TO/FROM ZIP/COORDS */
interface CsvRow {
    zip: string;
    lat: string;
    lng: string;
    [key: string]: any;
}

async function getCsv() : Promise<Papa.ParseResult<CsvRow>> {
    return new Promise((acc, rej) => {
        (async() => {
            try {
                const csvRead = await fetch ('/uszips.csv');
                const csvText = await csvRead.text();
                acc(Papa.parse(csvText, {header: true}));
            } catch (e) {
                rej(e);
            }
        })();
    });
}

export async function getZipFromCoords(coords : string) : Promise<string> {
    return new Promise((acc, rej) => {
        (async() => {
            try {
                const [lat, long] = coords.split(',').map(s => Number(s));
                const csv = await getCsv();
                const closest = csv.data.reduce((d, c) => {
                    if(!d) return c;
                    const dist = getDistance(lat, long, Number(c.lat), Number(c.lng));
                    const dist2 = getDistance(lat, long, Number(d.lat), Number(d.lng));
                    return dist < dist2 ? c : d; 
                }) as CsvRow;
                acc(closest.zip);
            } catch (e) {
                rej(e);
            }
        })();
    });
}

export async function getCoordsFromZip(zip: string) : Promise<string> {
    return new Promise((acc, rej) => {
        (async() => {
            try {
                const csv = await getCsv();
                const row = csv.data.find(d => d.zip === zip);
                if(row) {
                    acc(`${row.lat},${row.lng}`);
                } else {
                    rej(new Error('ZIP not found'));
                }
            } catch (e) {
                rej(e);
            }
        })();
    });
}

/* HELPER FUNCTIONS */
function deg2rad(deg : number) : number {
    return deg * (Math.PI/180)
}

function getDistance(lat1 : number, lon1 : number, lat2 : number, lon2 : number) : number {
    var R = 3958.8;
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}