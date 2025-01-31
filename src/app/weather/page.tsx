'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './weather.module.css';

import { grabOther, LocationData } from './location';

export default function Page() {
    const [zipField, setZipField] = useState(localStorage.getItem('zip') || undefined);
    const [coordsField, setCoordsField] = useState(localStorage.getItem('coords') || undefined);

    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const _setLocation = (ld: Partial<LocationData>, auto?: boolean) => {
        setLoading(true);
        grabOther(ld, auto).then(ldFull => {
            if(typeof window !== 'undefined') {
                localStorage.setItem('zip', ldFull.zip);
                localStorage.setItem('coords', ldFull.coords);
            }
            router.push(`/weather/${ldFull.zip}/${ldFull.coords}`);
        }).catch(e => {
            toast(e.message);
            setLoading(false);
        });
    };

    return <div className={styles.weather}>
        <ToastContainer/>
        <Info/>
        <div>
            <div>
                ZIP: <input type='text' value={zipField || ''} onChange={e => setZipField(e.target.value)}/>
            </div>
            <div>
                Coordinates: <input type='text' value={coordsField || ''} onChange={e => setCoordsField(e.target.value)}/>
            </div>
            <br/>
            <div>
                <input type='button' 
                    value='Get by ZIP' 
                    onClick={() => _setLocation({zip: zipField})}
                    readOnly={loading}/>
                <input type='button' 
                    value='Get by Coordinates' 
                    onClick={() => _setLocation({coords: coordsField})}
                    readOnly={loading}/>
                <input type='button' 
                    value={'Autoget Coordinates'} 
                    onClick={() => _setLocation({}, true)} 
                    readOnly={loading}/>
            </div>
        </div>
    </div>
}

const Info = () => <>
    <h2>
        Weather Settings
    </h2>
    <div>
        Zip code table obtained from <a href='https://simplemaps.com/data/us-zips' target='_blank' rel='noreferrer'>simplemaps</a><br/>
        <br/>
        UV is only available for current date due to API constraint.  Multiplied by 10 for visibility.<br/>
        0-20 low<br/>
        30-50 moderate<br/>
        60-70 high<br/>
        80-100 very high<br/>
        <br/>
    </div>
</>;