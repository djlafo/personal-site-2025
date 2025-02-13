'use server'

import { MyError } from '@/lib/myerror';
import { createWorker } from 'tesseract.js';

export async function getOCR(image: File) {
    try {
        const worker = await createWorker('eng');
        const buffer = await image.arrayBuffer();
        const ret = await worker.recognize(Buffer.from(buffer));
        await worker.terminate();
        return ret.data.text;
    } catch {
        return new MyError({message: 'Failed to generate OCR'});
    }
}