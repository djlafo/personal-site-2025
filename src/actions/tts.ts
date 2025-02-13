'use server'

import { promisify } from 'util';
import { exec } from 'child_process';

import { ChatResponse, HistoryPoint, sendChat } from './gpt';
import { getUser } from '@/lib/sessions';
import { MyError } from '@/lib/myerror';

const promiseExec = promisify(exec);

export async function getTTS(str: string) {
    if(str.length > 2000) return new MyError({message: 'Max is 2000 characters'});
    const user = await getUser();
    const model = user?.username === 'dylan'  ? 'en_US-dylan' : 'en_US-joe-medium';
    const config = user?.username === 'dylan' ? 'en_US-dylan' : 'en_US-joe-medium';
    return await execPiper(str, model, config);
}

async function execPiper(text: string, model='en_US-joe-medium', conf='en_US-joe-medium') {
    try {
        const cleanedString = text.replaceAll("'", "’");
        const res = await promiseExec(`echo '${cleanedString}' | ./piper/piper --model "./piper/${model}.onnx" --config "./piper/${conf}.onnx.json" --output-raw | ffmpeg -f s16le -ar 22050 -ac 1 -i pipe: -f mp3 pipe:`, { encoding: 'base64' });
        return res.stdout;
    } catch {
        return new MyError({message: 'Failed to generate TTS'});
    }
}

export async function sendChatTTS(message: string, history: HistoryPoint[]): Promise<ChatResponse | MyError> {
    const resp = await sendChat(message,history);
    const tts = await execPiper(resp.text, 'en_US-dylan', 'en_US-dylan');
    if(tts instanceof MyError) return tts;
    resp.audio = tts;
    return resp;
}