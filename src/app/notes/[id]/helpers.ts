interface Insert {
    insert?: any;
}
interface Ops {
    ops: Insert[];
}
export function getTextFromDelta(d: string) {
    try {
        let json: Ops = JSON.parse(d);
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