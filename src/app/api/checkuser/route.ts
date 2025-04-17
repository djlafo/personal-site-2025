import { decrypt } from "@/lib/sessions";

export async function POST(req: Request) {
    // check auth
    if(!checkAuth(req)) return new Response('', {status: 401});
    
    const token = await req.text();
    const jwt = decrypt(token);
    return new Response(JSON.stringify({username: jwt.data.username}));
}

function checkAuth(req: Request) {
    const auth = req.headers.get('authorization');
    return (auth && auth === process.env.AUTH_SECRET);
}