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
    await promiseExec(`echo '${cleanedString}' | ./piper/piper --model "./piper/en_US-joe-medium.onnx" --config "./piper/en_en_US_joe_medium_en_US-joe-medium.onnx.json" -q --output_file './sounds/${cleanedIP}.wav'`);
    try {
        const data = await fs.readFileSync(`./sounds/${cleanedIP}.wav`, { encoding: 'base64' }); 
        return data;
    } catch (e) {
        return {
            stdout: '',
            stderr: e
        }
    }
}