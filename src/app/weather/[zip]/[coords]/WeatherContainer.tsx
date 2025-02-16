'use client'

import { useEffect, useState } from "react";

import WeatherGraph from "./WeatherGraph";
import DaySwitcher from "./DaySwitcher";

import { FormattedWeatherData } from "./WeatherGraph/helpersAndTypes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface WeeklyWeatherProps {
    weatherData: FormattedWeatherData;
    coords: string;
    zip: string;
}
export default function WeeklyWeather({zip, coords, weatherData}: WeeklyWeatherProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [currentDay, setCurrentDay] = useState<string>(() => {
        const day = searchParams.get('day');
        if(day && Object.keys(weatherData).includes(day)) return day;
        return Object.keys(weatherData)[0]
    });

    const _setCurrentDay = (day: string) => {
        router.replace(`${pathname}?day=${day}`);
        setCurrentDay(day);
    }

    useEffect(() => {
        router.replace(`${pathname}?day=${currentDay}`);
        if(typeof window !== 'undefined') {
            localStorage.setItem('zip', zip);
            localStorage.setItem('coords', coords);
        }
    }, []);

    return <div>
        <DaySwitcher currentDay={currentDay}
            days={Object.keys(weatherData)}
            onDaySwitched={s => _setCurrentDay(s)}/>
        <WeatherGraph data={weatherData[currentDay as keyof FormattedWeatherData]}/>
    </div>;
}