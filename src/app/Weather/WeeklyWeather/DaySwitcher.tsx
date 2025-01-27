import { useCallback, useEffect } from "react";

interface DaySwitcherProps {
    days: Array<string>;
    currentDay: string;
    onDaySwitched: (s: string) => void;
}

export default function DaySwitcher({days, currentDay, onDaySwitched} : DaySwitcherProps) {

    const switchDay = useCallback((n : number) => {
        const currentIndex = days.indexOf(currentDay);
        let res = currentIndex + n;
        if(res < 0) res = days.length-1;
        if(res >= days.length) res = 0;
        onDaySwitched(days[res]);
    }, [currentDay, days, onDaySwitched]);

    useEffect(() => {
		const shiftActive = (e : KeyboardEvent) => {
            if(e.key === 'ArrowLeft') {
                switchDay(-1);
            } else if (e.key === 'ArrowRight') {
                switchDay(1);
            }
		};
		window.addEventListener('keydown', shiftActive);
		return () => {
			window.removeEventListener('keydown', shiftActive);
		}
	}, [switchDay])

    return <div className='day-switcher'>
        <input type='button' 
            onClick={() => switchDay(-1)}
            value='<'/>
        <span>{currentDay}</span>
        <input type='button' 
            onClick={() => switchDay(1)}
            value='>'/>
    </div>;
}