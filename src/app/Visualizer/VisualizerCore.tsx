import { useState } from "react";
import { VisualizerOptionsType } from "./VisualizerOptions";
import { createButterchurn, presets } from "./butterchurn";

export default function useVisualizerCore() {
    const [shuffleTimer, setShuffleTimer] = useState<number>();
    const [lock, _setLock] = useState(false);
    const [visualizer, setVisualizer] = useState<any>();
    const [vRenderer, setVRenderer] = useState<number|null>();
    const [presetSwitcher, setPresetSwitcher] = useState<number|null>();

    const shuffle = ({v=visualizer, timer=shuffleTimer, lk=lock, preset=presetSwitcher}={}) => {
        const presetFn : TimerHandler = () => {
            const keys = Object.keys(presets);
            v.loadPreset(presets[keys[Math.floor(Math.random() * keys.length)]], 1.0);
            console.log('rendered');
        };
        presetFn();
        if(!lk && !preset) setPresetSwitcher(setInterval(presetFn, 1000*Number(timer)));
    }
    const create = (o : VisualizerOptionsType) => {
        if(!o.canvas) return;
        if(vRenderer) {
            clearInterval(vRenderer);
            setVRenderer(null);
        }
        if(presetSwitcher) {
            clearInterval(presetSwitcher);
            setPresetSwitcher(null);
        }
        createButterchurn(o.canvas, o.width, o.height).then(v => {
            setVisualizer(v);
            const renderFn : TimerHandler = () => {
                v.render();
            };
            setVRenderer(setInterval(renderFn, 1000/(o.fps || 30)));
            shuffle({v:v, timer: o.shuffleTimer, preset:null});
            setShuffleTimer(o.shuffleTimer);
            _setLock(o.lock);
        }).catch(e => {});
    }
    const setLock = (b : boolean) => {
        if(b && presetSwitcher) {
            clearInterval(presetSwitcher);
            setPresetSwitcher(null);
        } else if(!b && !presetSwitcher) {
            shuffle({lk:b});
        }
        _setLock(b);
    }
    return {shuffle, create, setLock};
}