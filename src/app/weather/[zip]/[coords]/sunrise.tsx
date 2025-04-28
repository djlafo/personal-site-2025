interface SunriseResponse {
    results: SunriseDetails;
    status: string;
    tzid: string;
}

export interface SunriseDetails {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
}

const URL = (lat: string, lng: string, date?: string) => `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&tzid=America/Chicago&date=${date}`;

export async function getSunrise(lat: string, lng: string, date?: string) {
    const url = URL(lat, lng, date);
    const resp = await fetch(url);
    const respObj: SunriseResponse = await resp.json();
    return respObj.results;
}