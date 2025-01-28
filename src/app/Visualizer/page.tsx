'use client'

import { useEffect, useRef, useState } from 'react';

// Visualizer
import { supported } from './butterchurn';

import VisualizerOptions, {VisualizerOptionsType} from './VisualizerOptions';
import useVisualizerCore from './VisualizerCore';

import styles from './visualizer.module.css';

export default function Visualizer() {
    const {shuffle, create, setLock} = useVisualizerCore();
    const [fullScreen, setFullScreen] = useState(false);
    const [isSupported, setIsSupported] = useState<boolean>();
    const [mediaDevices, setMediaDevices] = useState<boolean>();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const start = (o : VisualizerOptionsType) => {
        create({...o, canvas: canvasRef.current});
    }

    useEffect(() => {
        supported().then(b => setIsSupported(b));
        setMediaDevices(!!navigator.mediaDevices);
    }, []);

    return <>
        <div className={styles.visualizer}>
            {
                (isSupported === false && <>Browser not supported</>) ||
                (!mediaDevices && <>Cannot get media source</>) ||
                <>
                    <h2>
                        Added using <a href="https://github.com/jberg/butterchurn" target="_blank" rel="noreferrer">Butterchurn</a>
                    </h2>
                    <VisualizerOptions onLock={setLock} onShuffle={shuffle} onStart={o => start(o)}/>
                    <canvas ref={canvasRef} onClick={() => setFullScreen(fs => !fs)} className={fullScreen ? styles.full : ''}/>
                </>    
            }
        </div>
    </>;
}