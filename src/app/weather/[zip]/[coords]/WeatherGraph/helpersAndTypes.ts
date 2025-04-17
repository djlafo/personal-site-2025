/* HELPERS TO HELPERS */
interface WeatherKeyMappingData {
    label: string;
    color: string;
}
interface WeatherKeyMappingType {
    [key: string]: WeatherKeyMappingData;
}
export const weatherKeyMapping: WeatherKeyMappingType = {
    temp: {
        label: 'Temperature',
        color: 'hsl(7, 88%, 40%)'
    },
    humidity: {
        label: 'Humidity',
        color: 'hsl(214, 88%, 72%)'
    },
    rainChance: {
        label: 'Rain Chance',
        color: 'hsl(214, 92%, 49%)'
    },
    windSpeed: {
        label: 'Wind Speed',
        color: 'hsl(90, 9%, 85%)'
    },
    heatIndex: {
        label: 'Heat Index',
        color: 'hsl(27, 100%, 61%)'
    },
    wetBulb: {
        label: 'Wet Bulb',
        color: 'hsl(135, 100%, 60%)'
    },
    uv: {
        label: 'UV Index',
        color: 'hsl(57, 100%, 61%)'
    }
};