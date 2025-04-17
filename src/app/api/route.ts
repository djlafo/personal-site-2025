export async function GET() {
    return Response.json({
        message: 'hello :)',
    }, {
        status: 200,
        headers: {}
    });
}