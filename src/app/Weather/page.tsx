'use client'

/* 3rd PARTY COMPONENTS */
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* SETTINGS */
import WeatherSettings from './WeatherSettings';

/* WEATHER */
import WeeklyWeather from './WeeklyWeather';

/* LOCATION */
import { LocationProvider, LocationContext } from './LocationHandler';

import styles from './weather.module.css';
import { useContext, useEffect, useState } from 'react';

/* COMPONENT */
export default function Weather() {
    return <>
        <div className={styles.weather}>
            <ToastContainer/>
            <LocationProvider>
                <WeeklyWeather/>
                <WeatherSettings autoOpen={true}/>
                <ErrorBox/>
            </LocationProvider>
        </div>
    </>;
}

const ErrorBox = () => {
    const {logs, setLogs} = useContext(LocationContext);
    const [hidden, setHidden] = useState(true);
    const [lastLength, setLastLength] = useState(logs.length);
    useEffect(() => {
        if(lastLength !== logs.length && logs.length !== 0) {
            const last = logs[logs.length-1];
            if(last.toast) toast(last.toast);
            setLastLength(logs.length);
        }
    }, [lastLength, setLastLength, logs])
    let errorMessages = '';
    logs.forEach(e => {
        let newString = '';
        if (e.string) {
            newString += `${e.string}\n`;
        }
        if (e.error) {
            newString += `${e.error.message || e.error}${(e.error.stack && `\n${e.error.stack}`) || ''}\n`;
        }
        if(newString) errorMessages = `${newString}\n${errorMessages}`;
    });
    return errorMessages && <>
        <input type='button' value='Toggle Logs' onClick={_ => setHidden(b => !b)}/><br/>
        {!hidden && <>
            <textarea readOnly rows={7} value={errorMessages}/><br/>
            <input type='button' value="Clear" onClick={_ => setLogs && setLogs([])}/>
        </>}
    </>;
}