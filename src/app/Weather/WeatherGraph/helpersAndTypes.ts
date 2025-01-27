import { WeatherData } from '../WeatherApi/types';

export interface Point {
    x: string;
    y: number;
    color: string
}
export interface WeatherDataPoint {
    id: string;
    color: string;
    data: Array<Point>
}
export interface FormattedWeatherData {
    [key : string]: Array<WeatherDataPoint>
}

export function formatWeatherData(weatherData : Array<WeatherData>) : FormattedWeatherData {
    const formattedWeatherData : FormattedWeatherData = {};
    weatherData.forEach(wd => {
        const date = wd.time.toDateString();
        if(!formattedWeatherData[date]) {
            formattedWeatherData[date] = getRowTemplate();
        }
        const rowTarget = formattedWeatherData[date];
        const time = wd.time.toLocaleString();
        Object.keys(weatherKeyMapping).forEach(k => {
            const keyRow = rowTarget.find(r => r.id === weatherKeyMapping[k].label);
            let yValue = wd[k as keyof WeatherData];
            if(yValue || yValue === 0) {
                if(k==='windSpeed') {
                    yValue = Number(yValue.toString().split(' ')[0]);
                } else if (k==='uv') {
                    yValue = Number(yValue) * 10;
                }
                keyRow?.data.push({
                    x: time,
                    y: Number(yValue),
                    color: keyRow.color
                });
            }
        });
    });
    clearUV(formattedWeatherData);
    return formattedWeatherData;
}

/* HELPERS TO HELPERS */
interface WeatherKeyMappingData {
    label: string,
    color: string
}
interface WeatherKeyMappingType {
    [key : string]: WeatherKeyMappingData
}
const weatherKeyMapping : WeatherKeyMappingType= {
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
const getRowTemplate = () => {
    return Object.keys(weatherKeyMapping).map(k => {
        return {
            id: weatherKeyMapping[k].label,
            color: weatherKeyMapping[k].color,
            data: []
        };
    });
}

const clearUV = (fwd : FormattedWeatherData) => {
    Object.keys(fwd).forEach(k => {
        const dayData = fwd[k as keyof FormattedWeatherData];
        const uvRow = dayData.findIndex(r => r.id==='UV Index');
        if(uvRow >= 0 && !dayData[uvRow].data.length) {
            dayData.splice(uvRow, 1);
        }
    });
};