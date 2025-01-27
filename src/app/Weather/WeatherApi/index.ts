import { UVAPIData, WeatherAPIData, WeatherPeriods, WeatherData } from "./types";

const coordinateURL = (coord : string) => `https://api.weather.gov/points/${coord}`;
const uvURL = (zip: string) => `https://data.epa.gov/efservice/getEnvirofactsUVHOURLY/ZIP/${zip}/JSON`;

export async function getWeather(zip : string, coord : string, cache=false): Promise<Array<WeatherData>> {
    return new Promise((acc, rej) => {
        (async() => {
            let currentApi = '';
            try {
                currentApi = uvURL(zip);
                const uvProm = apiFetch<Array<UVAPIData>>({
                    storageKey: `uv${zip}`,
                    api: uvURL(zip)
                }, cache);

                const coordResp = await fetch(coordinateURL(coord.replaceAll(' ', '')));
                if(!coordResp.ok) throw new Error(`${coordResp.url}: ${coordResp.statusText}`, { cause: coordResp });
                const coordJson = await coordResp.json();
                const hourlyURL = coordJson.properties.forecastHourly;

                currentApi = hourlyURL;
                const weatherJson : WeatherAPIData = await apiFetch<WeatherAPIData>({
                    storageKey: `weather${zip}`,
                    api: hourlyURL
                }, cache);
                const uvJson : Array<UVAPIData> = await uvProm;

                const dataPoints : Array<WeatherPeriods> = weatherJson.properties.periods;
                const data: Array<WeatherData> = dataPoints.map(e => {
                    const date = new Date(e.startTime);
                    return {
                        time: date,
                        temp: e.temperature,
                        tempUnit: e.temperatureUnit,
                        humidity: e.relativeHumidity?.value,
                        rainChance: e.probabilityOfPrecipitation.value,
                        windSpeed: e.windSpeed,
                        desc: e.shortForecast,
                        icon: e.icon,
                        uv: findUV(uvJson, date)?.UV_VALUE,
                        heatIndex: e.relativeHumidity && calcHeatIndex(e.temperature, e.relativeHumidity.value),
                        wetBulb: e.relativeHumidity && calcWetBulb(e.temperature, e.relativeHumidity.value)
                    };
                });
                acc(data);
            } catch(e) {
                rej({error: e, string: `API: ${currentApi}`});
            }
        })();
    });
}


/* HELPER FUNCTIONS */
const findUV = (a : Array<UVAPIData>, d : Date) => {
    return a.find(uv => {
        const day = Number(uv.DATE_TIME.substring(4, 6));
        const time = uv.DATE_TIME.substring(12).split(' ');
        let timeTwentyFour = Number(time[0]);
        if(time[1] === 'PM' && time[0] !== '12') {
            timeTwentyFour = timeTwentyFour + 12;
        } else if(time[1] === 'AM' && time[0] === '12') {
            timeTwentyFour = 0;
        }
        return (d.getDate() === day && d.getHours() === timeTwentyFour);
    });
}


function calcHeatIndex(T : number, RH : number) : number {
    let calc = .5 * (T + 61 + ((T-68)*1.2) + (RH*.094));
    calc = (calc + T) / 2;
    if(calc >= 80) {
        calc = -42.379 + 2.04901523*T + 10.14333127*RH - .22475541*T*RH - .00683783*T*T - .05481717*RH*RH + .00122874*T*T*RH + .00085282*T*RH*RH - .00000199*T*T*RH*RH;
        if(RH > 85 && T >= 80 && T <=87) {
            calc -= ((RH-85)/10) * ((87-T)/5);
        }
    }
    return calc;
}

function calcWetBulb(T: number, RH : number) : number {
    return T * Math.atan(0.151977 * Math.sqrt(RH + 8.313689)) + 0.00391838 * Math.sqrt(RH**3) * Math.atan(0.023101 * RH) - Math.atan(RH - 1.676331) + Math.atan(T + RH) - 4.686035;
}

type common = {
    storageKey : string;
    api: string;
};

const apiFetch = async function<T>(f : common, cache = false) : Promise<T> {
    return new Promise((acc,rej) => {
        (async() => {
            try {
                const storage = cache && localStorage.getItem(f.storageKey); 
                const date = cache && localStorage.getItem(`${f.storageKey}Date`);
                let tJson : T;
                if(storage && date && new Date(date) > new Date()) {
                    tJson = JSON.parse(storage);
                } else {
                    const response: Response = await fetch(f.api);
                    if(!response.ok) {
                        const text = await response.text();
                        throw new Error(`${response.status}:${text}`);
                    } else {
                        tJson = await response.json();
                    }
                }
                const hourAhead = new Date(new Date().setHours(new Date().getHours() + 1)).toUTCString();
                localStorage.setItem(f.storageKey, JSON.stringify(tJson));
                localStorage.setItem(`${f.storageKey}Date`, hourAhead);
                acc(tJson);
            } catch (e) {
                rej(e);
            }
        })();
    });
}