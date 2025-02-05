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
    const cleanedIP = ip.replaceAll(/[^a-zA-Z0-9]/g, ' ');
    console.log(cleanedString);
    const spdOut = await promiseExec(`echo '${cleanedString}' | piper-tts --model /usr/share/piper-voices/en/en_US/joe/medium/en_US-joe-medium.onnx -q --output_file './sounds/${cleanedIP}.wav'`);
    if(spdOut.stderr) return spdOut;
    const data = await fs.readFileSync(`./sounds/${cleanedIP}.wav`, { encoding: 'base64' }); 
    return data;
}