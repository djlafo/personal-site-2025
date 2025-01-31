import { Suspense } from "react";
import { getWeather } from "./WeatherApi";
import WeatherContainer from "./WeatherContainer";
import { formatWeatherData } from "./WeatherGraph/helpersAndTypes";
import { ResolvingMetadata } from "next";
import { getCityFromZip } from "../../location";


interface MetaProps {
    params: Promise<{ zip: string, coords: string}>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export async function generateMetadata({ params }: MetaProps, parent: ResolvingMetadata) {
    const par = await params;
    const city = await getCityFromZip(par.zip);
    return {
        title: city || par.zip,
        description: 'Weather'
    }
}

interface PageProps {
    params : Promise<{ zip: string, coords: string}>
}
export default async function Page({params} : PageProps) {
    const p = await params;
    return <Suspense fallback={'Loading weather data....'}>
        <WeatherContainerContainer zip={p.zip} coords={p.coords}/>
    </Suspense>;
}

interface WeatherContainerContainerProps {
    zip: string;
    coords: string;
}
async function WeatherContainerContainer({zip, coords}: WeatherContainerContainerProps) {
    const weatherData = await getWeather(zip, coords, true);
    const formatted = formatWeatherData(weatherData);
    return <WeatherContainer weatherData={formatted}/>
}