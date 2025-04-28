'use client'

import { Suspense, useEffect, useState } from "react";

import WeatherGraph from "./WeatherGraph";
import DaySwitcher from "./DaySwitcher";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WeatherData } from "./WeatherAPI/types";
import Link from "next/link";

import styles from './weeklyweather.module.css';
import { getSunrise, SunriseDetails } from "./sunrise";
import { toast } from "react-toastify";

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
    const [sunrise, setSunrise] = useState<SunriseDetails>();


    const _setCurrentDay = async (day: string) => {
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

    useEffect(() => {
        const date = new Date(currentDay);
        const formatted = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
        const _coords = decodeURIComponent(coords).split(',');
        getSunrise(_coords[0],_coords[1],formatted).then(sunrise => {
            setSunrise(sunrise);
        }).catch(() => {
            toast.error('Failed to get sunrise and sunset');
        });
    }, [currentDay, coords]);

    return <div>
        <div className={styles.weatherHeader}>
            <Link className='button-style' href='/weather'>Back</Link>
            <DaySwitcher currentDay={currentDay}
                days={getDates(weatherData)}
                onDaySwitched={s => _setCurrentDay(s)}/>
            {sunrise && <span><b>Sunrise:</b> {sunrise.sunrise} <b>Noon:</b> {sunrise.solar_noon} <b>Sunset:</b> {sunrise.sunset} <b>Length:</b> {sunrise.day_length}</span>}
        </div>
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