import { redirect } from "next/navigation";
import { getCoordsFromZip } from "../location";

interface PageProps {
    params : Promise<{ zip: string}>
}
export default async function Page({params} : PageProps) {
    const zip = (await params).zip;
    const coords = await getCoordsFromZip(zip);
    redirect(`/weather/${zip}/${coords}`);
}