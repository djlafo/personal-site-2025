'use server'

import { redirect } from "next/navigation";
import { getCoordsFromZip } from "../location";
import { LoadingScreenFallBack } from "@/components/LoadingScreen";
import { Suspense } from "react";

interface PageProps {
    params : Promise<{ zip: string}>
}
export default async function Page({params} : PageProps) {
    const zip = (await params).zip;
    return <Suspense fallback={<LoadingScreenFallBack/>}>
        <LoadAndRedirect zip={zip}/>
    </Suspense>;
}

async function LoadAndRedirect(params: {zip: string}) {
    const coords = await getCoordsFromZip(params.zip);
    redirect(`/weather/${params.zip}/${coords}`);
    return <></>;
}