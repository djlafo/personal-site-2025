import 'server-only';
import { getWebSocket } from './websocket';
import { MyError, MyErrorObj } from './myerror';
import WebSocket from 'ws';

export async function getServerWebSocket(): Promise<WebSocket | MyErrorObj> {
    try {
        const ws = await getWebSocket({token: process.env.AUTH_SECRET || '', user:false});
        return ws;
    } catch (e: any) {
        return MyError.create({message: e.code || e});
    }
}