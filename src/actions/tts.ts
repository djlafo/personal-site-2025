'use server'

import { promisify } from 'util';
import { exec } from 'child_process';

import { ChatResponse, HistoryPoint, sendChat } from './gpt';
import { getUser } from '@/lib/sessions';

const promiseExec = promisify(exec);

export async function getTTS(str: string) {
    if(str.length > 2000) throw new Error('Max is 2000 characters');
    const user = await getUser();
    const model = user?.username === 'dylan'  ? 'en_US-joe-medium' : 'en_US-joe-medium';
    const config = user?.username === 'dylan' ? 'en_US-joe-medium' : 'en_US-joe-medium';
    return await execPiper(model,config,str);
}

async function execPiper(text: string, model='en_US-joe-medium', conf='en_US-joe-medium') {
    const cleanedString = text.replaceAll("'", "’");
    const res = await promiseExec(`echo '${cleanedString}' | ./piper/piper --model "./piper/${model}.onnx" --config "./piper/${conf}.onnx.json" --output-raw | ffmpeg -f s16le -ar 22050 -ac 1 -i pipe: -f mp3 pipe:`, { encoding: 'base64' });
    return res.stdout;
}

export async function sendChatTTS(message: string, history: HistoryPoint[]): Promise<ChatResponse> {
    const resp = await sendChat(message,history);
    resp.audio = await execPiper(resp.text);
    return resp;
}