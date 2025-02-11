'use server'

import fs from 'fs/promises';

import presets from '../../butterchurnpresets/presets.json';

export async function getRandomPreset() {
    const p = presets[Math.floor(Math.random() * presets.length)];
    const presetFile = (await fs.readFile(`butterchurnpresets/${p}`));
    const preset = JSON.parse(presetFile.toString());
    return {
        name: p,
        preset: preset
    };
}