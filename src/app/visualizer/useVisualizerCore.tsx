import { useState } from "react";
import { VisualizerOptionsType } from "./VisualizerOptions";
import { createButterchurn } from "./butterchurn";
import butterchurnPreset from 'butterchurn-presets';
import { getRandomPreset } from "@/actions/visualizer";

const butterchurnPresets = butterchurnPreset.getPresets();

export default function useVisualizerCore() {
    const [shuffleTimer, setShuffleTimer] = useState<number>();
    const [lock, _setLock] = useState(false);
    const [useAPI, setUseAPI] = useState(false);
    const [visualizer, setVisualizer] = useState<any>();
    const [vRenderer, setVRenderer] = useState<number|null>();
    const [presetSwitcher, setPresetSwitcher] = useState<number|null>();

    const shuffle = ({v=visualizer, timer=shuffleTimer, lk=lock, preset=presetSwitcher}={}) => {
        const presetFn : TimerHandler = async () => {
            let preset;
            if(useAPI) {
                let presetObj = await getRandomPreset();
                console.log(presetObj.name);
                preset = presetObj.preset;
            } else {
                const presetName = Object.keys(butterchurnPresets).at(Math.floor(Math.random() * Object.keys(butterchurnPresets).length));
                console.log(presetName);
                if(!presetName) return;
                preset = butterchurnPresets[presetName];
            }
            if(preset) v.loadPreset(preset, 1.0);
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
    const stop = () => {
        if(vRenderer) {
            clearInterval(vRenderer);
            setVRenderer(null);
        }
        if(presetSwitcher) {
            clearInterval(presetSwitcher);
            setPresetSwitcher(null);
        }
        setVisualizer(null);
    }
    return {shuffle, create, setLock, stop, setUseAPI};
}