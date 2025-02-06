'use server'

import { promisify } from 'util';
import { exec } from 'child_process';

import fs from 'node:fs';
import { getIp } from '@/lib/sessions';

const promiseExec = promisify(exec);

export async function getTTS(str: string) {
    if(str.length > 10000) {
        return {
            stdout: '',
            stderr: 'Max is 10000 characters'
        }
    };
    const ip = await getIp();
    if(!ip) return {
        stdout: '',
        stderr: 'Sorry you cant use this'
    };
    const cleanedString = str.replaceAll("'", "’")
    const res = await promiseExec(`echo '${cleanedString}' | ./piper/piper --model "./piper/en_US-joe-medium.onnx" --config "./piper/en_US-joe-medium.onnx.json" --output-raw | ffmpeg -f s16le -ar 22050 -ac 1 -i pipe: -ar 44100 -f mp3 pipe:`, { encoding: 'base64' });
    return res.stdout;
}