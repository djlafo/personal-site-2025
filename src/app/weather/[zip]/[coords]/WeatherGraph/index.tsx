'use client'

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from './weathergraph.module.css';
import { WeatherData } from '../WeatherAPI/types';

export default function WeatherGraph({ data }: { data: WeatherData[] }) {

    return <div className={styles.weathergraph}>
        <ResponsiveContainer width="90%" height={800} >
            <LineChart data={data}>
                <CartesianGrid stroke="#333333"/>
                <XAxis dataKey="time" tickFormatter={getCustomXAxis}/>
                <YAxis/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend/>
                <ReferenceLine y={50} label="UV warning" stroke="#333300"/>
                {Object.keys(weatherKeyMapping).map(k => {
                    return <Line key={weatherKeyMapping[k].label} 
                        type="natural" 
                        stroke={weatherKeyMapping[k].color}
                        name={weatherKeyMapping[k].label}
                        dataKey={k}/>;
                })}
            </LineChart>
        </ResponsiveContainer>
    </div>;
};

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
        color: 'hsl(0, 0.00%, 58.80%)'
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
const percentages = ['Humidity', 'Rain Chance'];
const fahrenheit = ['Temperature', 'Heat Index', 'Wet Bulb'];
function withUnit(num: number, label: string) {
    if(percentages.includes(label)) return `${num}%`;
    if(fahrenheit.includes(label)) return `${num}F`;
    if(label === 'Wind Speed') return `${num}mph`;
    if(label === 'UV Index') return num/10;
    return num;
}

function getCustomXAxis(value: any) {
    return new Date(value).toLocaleTimeString('en-US');
}


function CustomTooltip(params: any) { //payload, label, active
    if(!params.active) return null;
    console.log(JSON.stringify(params.payload));
    return <div className={styles.tooltip}>
        <h3>{new Date(params.label).toLocaleTimeString('en-US')}</h3>
        <table>
            <tbody>
                {params.payload.map((pl: any) => {
                    return <tr key={pl.name} style={{color: pl.stroke}}> 
                        <td>{pl.name}</td>
                        <td> {withUnit(pl.value, pl.name)}</td>
                    </tr>
                })}
            </tbody>
        </table>
        <br/>
    </div>;
}