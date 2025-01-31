'use client'

import { useEffect, useState } from "react";

import WeatherGraph from "./WeatherGraph";
import DaySwitcher from "./DaySwitcher";

import { FormattedWeatherData } from "./WeatherGraph/helpersAndTypes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface WeeklyWeatherProps {
    weatherData: FormattedWeatherData;
}
export default function WeeklyWeather({weatherData}: WeeklyWeatherProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [currentDay, setCurrentDay] = useState<string>(searchParams.get('day') || Object.keys(weatherData)[0]);

    const _setCurrentDay = (day: string) => {
        router.replace(`${pathname}?day=${day}`);
        setCurrentDay(day);
    }

    useEffect(() => {
        router.replace(`${pathname}?day=${currentDay}`);
    }, []);

    return <div>
        <DaySwitcher currentDay={currentDay}
            days={Object.keys(weatherData)}
            onDaySwitched={s => _setCurrentDay(s)}/>
        <WeatherGraph data={weatherData[currentDay as keyof FormattedWeatherData]}/>
    </div>;
}