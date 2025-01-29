export interface WeatherAPIData {                                                                
    properties: {
        periods: Array<WeatherPeriods>
    };
    [key: string]: any;
}

export interface UVAPIData {
    ORDER: number;
    ZIP: string;
    CITY: string;
    STATE: string;
    DATE_TIME: string;
    UV_VALUE: number;
}

export interface WeatherPeriods {
    startTime: string,
    temperature: number;
    temperatureUnit: string;
    relativeHumidity: {
        value: number,
        unitCode: string
    };
    probabilityOfPrecipitation: {
        unitCode: string,
        value: number
    };
    windSpeed: string;
    shortForecast: string;
    [key: string]: any;
}

export interface WeatherData {
    time: Date;
    temp: number;
    tempUnit: string;
    humidity: number;
    rainChance: number;
    windSpeed: string;
    desc: string;
    icon: string;
    uv: number | undefined;
    wetBulb: number;
    heatIndex: number;
}