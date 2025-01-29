'use client'

/* 3rd PARTY COMPONENTS */
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import WeatherSettings from './WeatherSettings';
import WeeklyWeather from './WeeklyWeather';
import ErrorBox from './ErrorBox';

/* LOCATION */
import { LocationProvider } from './LocationHandler';

import styles from './weather.module.css';
import { Suspense } from 'react';

/* COMPONENT */
export default function Weather() {
    return <>
        <div className={styles.weather}>
            <ToastContainer/>
            <Suspense>
                <LocationProvider>
                    <WeeklyWeather/>
                    <WeatherSettings autoOpen={true}/>
                    <ErrorBox/>
                </LocationProvider>
            </Suspense>
        </div>
    </>;
}