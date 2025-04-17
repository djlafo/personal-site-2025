import { PlannerData } from '@/app/planner/usePlanner';
import WebSocket from 'ws';

export interface WebSocketOptions {
    token: string;
    user: boolean;
}
export async function getWebSocket(options: WebSocketOptions) {
    const p = new Promise<WebSocket>((acc, rej) => {
        if(!process.env.WS_ENDPOINT) {
            rej('WS Endpoint not configured');
            return;
        }
        const ws = new WebSocket(process.env.WS_ENDPOINT);
        ws.on('error', err => {
            rej(err);
        });
        ws.on('open', () => {
            ws.send(JSON.stringify(options));
        });
        ws.on('close', () => {
            rej('Socket closed');
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