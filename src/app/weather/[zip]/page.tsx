'use server'

import { redirect } from "next/navigation";
import { getCoordsFromZip } from "../location";

interface PageProps {
    params: Promise<{ zip: string }>;
}
export default async function Page({ params }: PageProps) {
    const zip = (await params).zip;
    let coords = '';
    try {
        coords = await getCoordsFromZip(zip);
    } catch {
        redirect('/weather');
    } finally {
        redirect(`/weather/${zip}/${coords}`);
    }
}