'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './weather.module.css';
import { getCoordsFromZip } from './location';

export default function Page() {
    const [zipField, setZipField] = useState(() => {
        if(typeof window !== 'undefined') {
            return localStorage.getItem('zip') || undefined;
        }
    });
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const _setLocation = async (zip?: string) => {
        if(!zip) return;
        setLoading(true);
        if(typeof window !== 'undefined') {
            localStorage.setItem('zip', zip);
        }
        const coords = await getCoordsFromZip(zip);
        router.push(`/weather/${zip}/${coords}`);
    };

    return <div className={styles.weather}>
        <ToastContainer/>
        <Info/>
        <div>
            <div>
                ZIP: <input type='text' value={zipField || ''} onChange={e => setZipField(e.target.value)}/>
            </div>
            <br/>
            <div>
                <input type='button' 
                    value='Get by ZIP' 
                    onClick={() => _setLocation(zipField)}
                        disabled={loading}/>
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