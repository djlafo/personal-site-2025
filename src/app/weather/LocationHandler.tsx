import React, { useEffect } from 'react';
import { createContext, useState } from "react";
import { getCoordsFromZip, getZipFromCoords, getBrowserCoordinates } from "./location";

import { useSearchParams, usePathname } from 'next/navigation';

/* HELPERS */
const grabOther = async ({zip, coords, auto} : LocationData) => {
    return new Promise<LocationDataReq>((acc, rej) => {
        (async() => {
            if(auto) {
                try {
                    const autoCoords = await getBrowserCoordinates();
                    coords = autoCoords;
                } catch (e) {
                    rej(e);
                }
            }
    
            if(coords && !zip) {
                getZipFromCoords(coords).then(z => {
                    // Double null check for...... reasons?? blame the linter
                    if(coords) acc({zip: z, coords: coords});
                }).catch(e => rej(e));
            } else if (zip && !coords) {
                getCoordsFromZip(zip).then(c => {
                    acc({zip: zip, coords: c});
                }).catch(e => rej(e));
            } else {
                rej(new Error('Invalid parameters'));
            }
        })();
    });
};

const getParam = (s : string, params : URLSearchParams) => {
    let st = '';
    if(typeof window !== 'undefined') {
        st = localStorage.getItem(s) || '';
    }
    return params.get(s) || st || undefined;
}

export interface LocationData {
    zip?: string;
    coords?: string;
    auto?: boolean;
}
interface LocationDataReq {
    zip: string;
    coords: string;
}
interface LogData {
    string?: string;
    error?: Error;
    toast?: string;
}
interface LocationContextData { 
    zip?: string;
    coords?: string;
    setLocation?: (ld: LocationData) => Promise<LocationData>;
    logs: Array<LogData>;
    setLogs?: React.Dispatch<React.SetStateAction<LogData[]>>;
};
const locationDefault : LocationContextData = {
    logs: []
};
export const LocationContext = createContext(locationDefault);

// a reducer wouldn't quite work here because this is always going into async for grabOther, so i'm not bothering with it
export function LocationProvider({children} : {children:React.ReactNode}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const params = new URLSearchParams(searchParams);

    const [zip, setZip] = useState(getParam('zip', params));
    const [coords, setCoords] = useState(getParam('coords', params));
    const [logs, setLogs] = useState<Array<LogData>>([]);


    const setLocation = (ld : LocationData) : Promise<LocationDataReq> => {
        const prom = grabOther(ld).then(ldFull => {
            setZip(ldFull.zip);
            setCoords(ldFull.coords);
            return ldFull;
        });
        prom.catch(e => {
            setLogs(l => l.concat([{
                error: e,
                toast: e
            }]));
        });
        return prom;
    }

    if(zip && coords) {
        if(typeof window !== 'undefined') {
            localStorage.setItem('zip', zip);
            localStorage.setItem('coords', coords);
        }
        if(params.get('zip') !== zip || params.get('coords') !== coords) {
            params.set('zip', zip);
            params.set('coords', coords);
            // I have no idea how to do this properly for now, nextjs does not play nicely
            // with changing params without doing anything else
            setTimeout(() => {
                window.history.pushState(null, '', `${pathname}?${params.toString()}`);
            }, 250);
        }
    }
    return <LocationContext.Provider value={{
        zip: zip, 
        coords: coords, 
        setLocation: setLocation, 
        logs: logs,
        setLogs: setLogs
    }}>
        {children}    
    </LocationContext.Provider>;
}