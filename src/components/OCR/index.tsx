'use client'

import { useRef } from 'react';

import { getOCR } from '@/actions/ocr';

import styles from './ocr.module.css';
import { toast } from 'react-toastify';
import { useLoadingScreen } from '../LoadingScreen';
import { MyError } from '@/lib/myerror';

interface OCRProps {
    onText: (s: string) => void;
    className?: string;
}
export default function OCR({onText, className}: OCRProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useLoadingScreen();

    const getImageOCR = async () => {
        if(!fileRef.current || !fileRef.current.files?.length) return;
        const img = fileRef.current.files[0];
        setLoading(true);
        const text = await getOCR(img);
        setLoading(false);
        // process out extraneous newlines
        if(text instanceof MyError) {
            toast(text.message);
        } else {
            onText(text.replaceAll(/(?<!\n)\n(?!\n)/g, '. '));
        }
    }

    return <div className={`${className} ${styles.ocr}`}>
        <label>OCR</label>
        <input ref={fileRef} type='file' accept="image/*"/>
        <input type='button' value='Get' onClick={getImageOCR}/>
    </div>;
}