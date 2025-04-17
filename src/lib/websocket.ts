import { PlannerData } from '@/app/planner/usePlanner';
import WebSocket from 'ws';

const endpoint = 'ws://localhost:8080';

export interface WebSocketOptions {
    token: string;
    user: boolean;
}
export async function getWebSocket(options: WebSocketOptions) {
    const p = new Promise<WebSocket | null>((acc, rej) => {
        const ws = new WebSocket(endpoint);
        ws.on('error', err => {
            rej();
        });
        ws.on('open', () => {
            ws.send(JSON.stringify(options));
        });
        ws.on('close', () => {
            rej();
        });
        ws.on('message', s => {
            if(s.toString() === 'authorized') {
                acc(ws);
            }
        });
    });
    const ws = await p;
    return ws;
}

export interface WebSocketEvent {
    event: string;
    data: object;
}

export interface WSPlannerEvent extends WebSocketEvent {
    event: 'PlannerUpdate';
    data: {
        username: string;
        planner: PlannerData
    }
}

// ws.on('close', () => {
//     console.log('Websocket closed, retrying in 3 seconds...');
//     setTimeout(() => {
//         ws = new WebSocket(endpoint);
//     }, 3000)
// });

// ws.on('message', function message(data) {
//   console.log('received: %s', data);
// });