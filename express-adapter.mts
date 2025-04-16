export async function sendTo(path: string, content: any) {
    const resp = await fetch(`http://localhost:3000/${path}`, {
        method: 'POST',
        body: JSON.stringify(content),
        headers: {
            'Authorization': `Token ${process.env.AUTH_SECRET}`
        }
    });
    return await resp.json();
}

export async function getFrom(path: string) {
    const resp = await fetch(`http://localhost:3000/${path}`, {
        headers: {
            'Authorization': `Token ${process.env.AUTH_SECRET}`
        }
    });
    return await resp.json();
}