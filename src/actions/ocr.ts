'use server'

import { createWorker } from 'tesseract.js';

export async function getOCR(image: File) {
    
    const worker = await createWorker('eng');
    const buffer = await image.arrayBuffer();
    const ret = await worker.recognize(Buffer.from(buffer));
    await worker.terminate();
    return ret.data.text;
}