import { checkWSAuth, decrypt } from "@/lib/sessions";

export async function POST(req: Request) {
    // check auth
    if(!checkWSAuth(req)) return new Response('', {status: 401});
    
    const json = await req.json();
    const jwt = decrypt(json.token);
    return new Response(JSON.stringify({username: jwt.data.username}));
}