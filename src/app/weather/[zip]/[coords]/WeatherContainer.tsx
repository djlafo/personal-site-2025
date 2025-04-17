'use client'

import { Suspense, useEffect, useState } from "react";

import WeatherGraph from "./WeatherGraph";
import DaySwitcher from "./DaySwitcher";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WeatherData } from "./WeatherAPI/types";

interface WeeklyWeatherProps {
    weatherData: WeatherData[];
    coords: string;
    zip: string;
}
export default function WeeklyWeather({zip, coords, weatherData}: WeeklyWeatherProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [currentDay, setCurrentDay] = useState<string>(() => {
        const day = searchParams.get('day');
        if(day && weatherData.find(wd => wd.time.toDateString() === day)) return day;
        return weatherData[0].time.toDateString();
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
        // eslint-disable-next-line
    }, []);

    return <div>
        <DaySwitcher currentDay={currentDay}
            days={getDates(weatherData)}
            onDaySwitched={s => _setCurrentDay(s)}/>
        <Suspense>
            <WeatherGraph data={getDailyWeather(weatherData, currentDay)}/>    
        </Suspense>
    </div>;
}

function getDailyWeather(weatherData: WeatherData[], day: string) {
    return weatherData.filter(wd => wd.time.toDateString() === day);
}

function getDates(weatherData: WeatherData[]) {
    const dates: string[] = [];
    weatherData.forEach(wd => {
        const date = wd.time.toDateString();
        if(!dates.includes(date)) dates.push(date);
    });
    return dates;
}