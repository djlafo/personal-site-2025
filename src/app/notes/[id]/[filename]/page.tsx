import { getFile } from "@/actions/notes";
import { MyError } from "@/lib/myerror";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string, filename: string}>;
}
export default async function Page({params}: PageProps) {
    const p = await params;
    
    const fileReq = await getFile(p.id, decodeURIComponent(p.filename));

    if(fileReq instanceof MyError) {
        return <span>{fileReq.message}</span>;
    } else {
        redirect(fileReq);
    }
}