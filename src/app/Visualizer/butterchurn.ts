import dynamic from 'next/dynamic'

// import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
// import isButterchurnSupported from "butterchurn/lib/isSupported.min";

export const presets = butterchurnPresets.getPresets();

export function createButterchurn(canvas : HTMLCanvasElement, width : number, height : number) {
    return new Promise<any>((acc, rej) => {
        (async() => {
            const butterchurn = await import('butterchurn');
            navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const v = butterchurn.default.createVisualizer(audioContext, canvas, {
                    width: width,
                    height: height
                });
                
                v.connectAudio(source);
                acc(v);
            }).catch(e => rej(e));
        })();
    });
}

export function supported() {
    return new Promise<boolean>((acc) => {
        (async() => {
            const s = await import('butterchurn/lib/isSupported.min');
            acc(s.default());
        })();
    });
}