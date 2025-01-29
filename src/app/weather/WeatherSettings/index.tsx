import { useState, useContext } from 'react';

import { LocationContext, LocationData } from './../LocationHandler';

import Modal from '@/components/Modal';


interface WeatherSettingsTypes {
    autoOpen?: boolean;
}

export default function WeatherSettings({autoOpen=true} : WeatherSettingsTypes) {
    const {zip, coords, setLocation, setLogs} = useContext(LocationContext);
    const [zipField, setZipField] = useState(zip);
    const [coordsField, setCoordsField] = useState(coords);
    const [loading, setLoading] = useState(false);
    const [settingsOpened, setSettingsOpened] = useState(autoOpen && (!zip || !coords));

    const _setLocation = (ld : LocationData) => {
        setLoading(true);
        if(setLogs) setLogs(a => a.concat([{
            string: `Loading full location for:
            zip:${ld.zip}
            coords:${ld.coords}
            autograb:${ld.auto || false}`
        }]));
        if(setLocation) setLocation(ld).then(ldTwo => {
            if(setLogs) setLogs(a => a.concat([{
                string: `Loaded location:
                zip:${ldTwo.zip}
                coords:${ldTwo.coords}`
            }]));
            setZipField(ldTwo.zip);
            setCoordsField(ldTwo.coords);
            setSettingsOpened(false);
        }).catch(() => {}).finally(() => setLoading(false));
    };

    return <>
        <input type='button' 
            value='Settings'
            onClick={() => setSettingsOpened(true)}/>
        <Modal onClose={() => setSettingsOpened(false)} 
            styleOne
            opened={settingsOpened}>
            <div className='settings'>
                <PopupInfo/>
                <div className='inputs'>
                    <div>
                        ZIP: <input type='textbox' value={zipField || ''} onChange={e => setZipField(e.target.value)}/>
                    </div>
                    <div>
                        Coordinates: <input type='textbox' value={coordsField || ''} onChange={e => setCoordsField(e.target.value)}/>
                    </div>
                    <br/>
                    <div className='buttons'>
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
                            onClick={() => _setLocation({auto: true})} 
                            readOnly={loading}/>
                    </div>
                </div>
            </div>
        </Modal>
    </>;
}

const PopupInfo = () => <>
    <h2>
        Weather Settings
    </h2>
    <p>
        - UV is only available for current date due to API constraint.  Multiplied by 10 for visibility.<br/>
        - Zip code table obtained from <a href='https://simplemaps.com/data/us-zips' target='_blank' rel='noreferrer'>simplemaps</a><br/>
        <br/>
        0-20 low<br/>
        30-50 moderate<br/>
        60-70 high<br/>
        80-100 very high<br/>
    </p>
</>;