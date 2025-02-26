import React from "react";

import { SliceTooltip } from "@nivo/line";

import styles from './tooltip.module.css';

// const dataOrder = ['temp', 'heat', 'bulb', 'uv', 'rain', 'humidity', 'wind'];
const labels = ['Temperature', 'Heat Index', 'Wet Bulb', 'UV Index', 'Rain Chance', 'Humidity', 'Wind Speed'];

const Tooltip: SliceTooltip = (point) => {
    const time = new Date(point.slice.points[0].data.x).toLocaleTimeString('en-US', {hour: 'numeric', hour12: true});
    
    const points = point.slice.points.map(p => {
        const label = p.serieId.toString();
        const isDec = ['Heat Index', 'Wet Bulb'].includes(label);
        let data = isDec ? `${Number(p.data.y).toFixed(1)}F` : p.data.y.toString();
        if(['Humidity', 'Rain Chance'].includes(label)) data = `${data}%`;
        if(label === 'Wind Speed') data = `${data}mph`;
        if(label === 'Temperature') data = `${data}F`;
        if(label === 'UV Index') data = (Number(data)/10).toString();

        return {label: label, data: data};
    });
    points.sort((a,b) => {
        return labels.indexOf(a.label) - labels.indexOf(b.label);
    });

    return <div className={styles.tooltip}>
        <h3>
            [{ time }]
        </h3>
        <table>
            <tbody>
                {
                    points.map(p => {
                        return <tr key={`${p.label}`}>
                            <td>
                                {p.label}
                            </td>
                            <td>
                                {p.data}
                            </td>
                        </tr>;
                    })
                }
            </tbody>
        </table>
    </div>;
};
export default Tooltip;