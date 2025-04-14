interface Insert {
    insert?: any;
}
interface Ops {
    ops: Insert[];
}
export function getTextFromDelta(d: string) {
    try {
        const json: Ops = JSON.parse(d);
        let s = '';
        json.ops.map(o => {
            if(o.insert && typeof o.insert === 'string') {
                s += o.insert;
            }
        });
        return s;
    } catch {
        return d;
    }
}

export function getNoteTitleFromDelta(s: string, maxLen = 100) {
    return getNoteTitle(getTextFromDelta(s), maxLen);
}


export function getNoteTitle(s: string, maxLen = 100) {
    const sub = s.split('\n')[0].substring(0, maxLen);
    return `${sub}${sub.length === maxLen ? '...' : ''}`;
}