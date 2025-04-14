'use client'

import { useRouter } from 'next/navigation';

import 'react-toastify/dist/ReactToastify.css';
import styles from './weather.module.css';

export default function Page() {
    let storedZip = '';
    if(typeof window !== 'undefined') {
        storedZip = localStorage.getItem('zip') || '';
    }

    const router = useRouter();

    const _setLocation = (zip?: string) => {
        if(!zip) return;
        if(typeof window !== 'undefined') {
            const zLocal = localStorage.getItem('zip');
            const cLocal = localStorage.getItem('coords');
            if(zip === zLocal && cLocal) {
                router.push(`/weather/${zLocal}/${cLocal}`);
                return;
            }
        }
        router.push(`/weather/${zip}`);
    };

    return <div className={styles.weather}>
        <Info/>
        <form action={fd => _setLocation(fd.get('zip')?.toString())}>
            <div>
                ZIP: <input name='zip' type='text' defaultValue={storedZip || ''}/>
            </div>
            <br/>
            <div>
                <input type='submit' 
                    value='Get by ZIP'/>
            </div>
        </form>
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