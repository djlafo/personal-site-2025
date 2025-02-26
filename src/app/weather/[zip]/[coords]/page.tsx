import { Suspense } from "react";
import { getWeather } from "./WeatherAPI";
import WeatherContainer from "./WeatherContainer";
import { formatWeatherData } from "./WeatherGraph/helpersAndTypes";
import { ResolvingMetadata } from "next";
import { getCityFromZip } from "../../location";
import { LoadingScreenFallBack } from "@/components/LoadingScreen";


interface MetaProps {
    params: Promise<{ zip: string, coords: string}>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
export async function generateMetadata({ params, searchParams }: MetaProps, parent: ResolvingMetadata) {
    const par = await params;
    const search = await searchParams;
    const city = await getCityFromZip(par.zip);
    return {
        title: city || par.zip,
        description: `Weather${search.day ? ` on ${search.day}` : ''}`
    }
}

interface PageProps {
    params: Promise<{ zip: string, coords: string}>;
}
export default async function Page({params}: PageProps) {
    const p = await params;
    return <Suspense fallback={<LoadingScreenFallBack/>}>
        <WeatherContainerContainer zip={p.zip} coords={p.coords}/>
    </Suspense>;
}

interface WeatherContainerContainerProps {
    zip: string;
    coords: string;
}
async function WeatherContainerContainer({zip, coords}: WeatherContainerContainerProps) {
    try {
        const weatherData = await getWeather(zip, coords, true);
        const formatted = formatWeatherData(weatherData);
        return <WeatherContainer zip={zip} coords={coords} weatherData={formatted}/>
    } catch {
        return <div>Failed to retrieve weather</div>;
    }
}