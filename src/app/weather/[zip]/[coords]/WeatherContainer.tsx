'use client'

import { useState } from "react";

import WeatherGraph from "./WeatherGraph";
import DaySwitcher from "./DaySwitcher";

import { FormattedWeatherData } from "./WeatherGraph/helpersAndTypes";

import styles from './weeklyweather.module.css';

interface WeeklyWeatherProps {
    weatherData: FormattedWeatherData;
}
export default function WeeklyWeather({weatherData}: WeeklyWeatherProps) {
    const [currentDay, setCurrentDay] = useState<string>(Object.keys(weatherData)[0]);

    return <div>
        <DaySwitcher currentDay={currentDay}
            days={Object.keys(weatherData)}
            onDaySwitched={s => setCurrentDay(s)}/>
        <WeatherGraph data={weatherData[currentDay as keyof FormattedWeatherData]}/>
    </div>;
}