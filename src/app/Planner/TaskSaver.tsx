import { Task } from "./Planner";

interface TaskSaverProps {
    tasks : Array<Task>;
    onLoad : (t : Array<Task>) => void;
}

export const load = () => {
    const storage = localStorage.getItem('tasks');
    if(!storage) return;
    try {
        return JSON.parse(storage);
    } catch {}
}

export default function TaskSaver(props : TaskSaverProps) {
    const checkClipboard = () => {
        if(!navigator.clipboard) {
            alert('Cant access the clipboard');
            return false;
        }
        return true;
    }
    const copy = () => {
        if(!checkClipboard()) return;
        navigator.clipboard.writeText(JSON.stringify(props.tasks));
    };

    const paste = () => {
        if(!checkClipboard()) return;
        navigator.clipboard.readText().then(t => {
            try {
                const copied = JSON.parse(t);
                if(copied.constructor === Array) {
                    props.onLoad(copied);
                } else {
                    throw new Error('Invalid tasks format');
                }
            } catch (e) {
                alert('This doesn\'t seem to be the right data');
            }
        });
    };

    const save = () => {
        localStorage.setItem('tasks', JSON.stringify(props.tasks));
    };

    const _load = () => {
        const loaded = load();
        if(loaded) {
            props.onLoad(loaded);
        } else {
            alert('Nothing saved');
        }
    };

    return <>
        {
            (props.tasks.length !== 0 && <>
                <span>
                    <input type='button' value='Refresh' onClick={() => props.onLoad(props.tasks.slice())}/>
                    <input type='button' value='Clear' onClick={() => props.onLoad([])}/>
                </span>
            </>) || <></>
        }
        <span>
            {
                (props.tasks.length !== 0 && <>
                        <input type='button' value='Save to browser' onClick={() => save()}/>
                </>) || <></>
            }
            <input type='button' value='Load' onClick={() => _load()}/>
        </span>
        <span>
            {   
                (props.tasks.length !== 0 && <>
                    <input type='button' value='Copy' onClick={() => copy()}/>
                </>) || <></>
            }
            <input type='button' value='Paste' onClick={() => paste()}/>
        </span>
    </>
}