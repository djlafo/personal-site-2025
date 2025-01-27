import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import isButterchurnSupported from "butterchurn/lib/isSupported.min";

export const presets = butterchurnPresets.getPresets();

export function createButterchurn(canvas : HTMLCanvasElement, width : number, height : number) {
    return new Promise<any>((acc, rej) => {
        navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const v = butterchurn.createVisualizer(audioContext, canvas, {
                width: width,
                height: height
            });
            
            v.connectAudio(source);
            acc(v);
        }).catch(e => rej(e));
    });
}

export const supported = isButterchurnSupported;