'use client'

import { useEffect, useRef, useState } from 'react';

// Visualizer
import { supported } from './butterchurn';

import VisualizerOptions, {VisualizerOptionsType} from './VisualizerOptions';
import useVisualizerCore from './useVisualizerCore';

import styles from './visualizer.module.css';

export default function Visualizer() {
    const {shuffle, create, setLock, setUseAPI, stop} = useVisualizerCore();
    const [fullScreen, setFullScreen] = useState(false);
    const [isSupported, setIsSupported] = useState<boolean>();
    const [mediaDevices, setMediaDevices] = useState<boolean>();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const start = (o: VisualizerOptionsType) => {
        create({...o, canvas: canvasRef.current});
    }

    useEffect(() => {
        supported().then(b => setIsSupported(b));
        // eslint-disable-next-line
        setMediaDevices(!!navigator.mediaDevices);
    }, []);

    return <>
        <div className={styles.visualizer}>
            {
                (isSupported === false && <>Browser not supported</>) ||
                (!mediaDevices && <>Cannot get media source</>) ||
                <>
                    <VisualizerOptions onLock={setLock} onUseAPI={setUseAPI} onShuffle={shuffle} onStart={o => start(o)} onStop={stop}/>
                    <canvas ref={canvasRef} onClick={() => setFullScreen(fs => !fs)} className={fullScreen ? styles.full : ''}/>
                </>    
            }
        </div>
    </>;
}