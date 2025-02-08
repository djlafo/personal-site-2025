'use server'

import { promisify } from 'util';
import { exec } from 'child_process';

import { getIp } from '@/lib/sessions';

const promiseExec = promisify(exec);

export async function getTTS(str: string, fromDylan=false) {
    if(str.length > 2000) throw new Error('Max is 2000 characters');
    const ip = await getIp();
    if(!ip) throw new Error('Sorry you cant use this');
    const cleanedString = str.replaceAll("'", "’");
    const model = fromDylan ? 'en_US-joe-medium' : 'en_US-joe-medium';
    const config = fromDylan ? 'en_US-joe-medium' : 'en_US-joe-medium';
    const res = await promiseExec(`echo '${cleanedString}' | ./piper/piper --model "./piper/${model}.onnx" --config "./piper/${config}.onnx.json" --output-raw | ffmpeg -f s16le -ar 22050 -ac 1 -i pipe: -f mp3 pipe:`, { encoding: 'base64' });
    return res.stdout;
}