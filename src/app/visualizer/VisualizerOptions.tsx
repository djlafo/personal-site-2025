import { useState } from "react";

import styles from './visualizer.module.css';

export interface VisualizerOptionsType {
    width: number;
    height: number;
    fps: number;
    shuffleTimer: number;
    lock: boolean;
    useAPI: boolean;
    canvas?: HTMLCanvasElement | null;
}

interface VisualizerOptionsOptions { // lol
    onStart: (o: VisualizerOptionsType) => void;
    onShuffle: () => void;
    onLock: (b: boolean) => void;
    onUseAPI: (b: boolean) => void;
    onStop: () => void;
}

export default function VisualizerOptions(o: VisualizerOptionsOptions) {
    const [width, setWidth] = useState('1600');
    const [height, setHeight] = useState('900');
    const [fps, setFps] = useState('30');
    const [shuffleTimer, setShuffleTimer] = useState('15');
    const [lock, setLock] = useState(false);
    const [useAPI, setUseAPI] = useState(false);

    const [started, setStarted] = useState(false);

    const start = () => {
        o.onStart({
            width: Number(width) || 1600,
            height: Number(height) || 900,
            fps: Number(fps) || 30,
            shuffleTimer: Number(shuffleTimer) || 15,
            lock: lock,
            useAPI: useAPI
        });
        setStarted(true);

        if(!Number(width)) setWidth('1600');
        if(!Number(height)) setHeight('900');
        if(!Number(fps)) setFps('30');
        if(!Number(shuffleTimer)) setShuffleTimer('15');
    }

    return <div className={styles.options}>
        {!started && 
            <div>
                <h2>
                    Added using <a href="https://github.com/jberg/butterchurn" target="_blank" rel="noreferrer">Butterchurn</a>
                </h2>
                <label htmlFor='widthInput'>Render width: </label>
                <input type='text' id="widthInput" value={width} onChange={e => setWidth(e.target.value)}/><br/>

                <label htmlFor='heightInput'>Render height: </label>
                <input type='text' id="heightInput" value={height} onChange={e => setHeight(e.target.value)}/><br/>

                <label htmlFor='fpsInput'>FPS: </label>
                <input type='text' id="fpsInput" value={fps} onChange={e => setFps(e.target.value)}/><br/>
                
                <label htmlFor='shuffleInput'>Shuffle Timer: </label>
                <input type='text' id="shuffleInput" value={shuffleTimer} onChange={e => setShuffleTimer(e.target.value)}/><br/>
            </div> || <></>
        }
        <div>
            <label htmlFor='lockInput'>Lock: </label>
            <input type='checkbox' id="lockInput" onChange={e => {
                o.onLock(e.target.checked);
                setLock(e.target.checked);
            }}/>
            &nbsp;&nbsp;
            <label htmlFor='lockInput'>Use API: </label>
            <input type='checkbox' id="apiInput" onChange={e => {
                o.onUseAPI(e.target.checked);
                setUseAPI(e.target.checked);
            }}/>
        </div>
        <div>
            {!started && <input type='button' value='Start' onClick={() => start()}/> || <></>}
            {started && <>
                <input type='button' value='Stop' onClick={() => {
                    o.onStop();
                    setStarted(false);
                }}/> 
                <input type='button' value='Shuffle' onClick={() => o.onShuffle()}/>
            </>}
            <br/>
        </div>
    </div>;
}