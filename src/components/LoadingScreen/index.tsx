'use client'

import { createContext, useContext, useState } from 'react';
import styles from './loading.module.css';

type LoadingType = [
    boolean,
    (b: boolean) => void
]

const LoadingContext = createContext<LoadingType>([
    false,
    (b: boolean) => {}
]);

interface LoadingScreenProps {
    children: React.ReactNode;
}
export function LoadingScreen({children}: LoadingScreenProps) {
    const [loading, setLoading] = useState(false);

    return <LoadingContext.Provider value={[
            loading,
            (b: boolean) => setLoading(b)
        ]}>
        <div className={`${loading ? '' : styles.hidden}`}>
            <LoadingScreenOnly/>
        </div>
        {children}
    </LoadingContext.Provider>;
}

export function useLoadingScreen() {
    return useContext(LoadingContext);
}

export function LoadingScreenOnly() {
    return <div className={styles.loadingScreen}>
        <div className={styles.ldsRing}><div></div><div></div><div></div><div></div></div>
    </div>;
}

export function LoadingScreenFallBack() {
    return <div className={styles.fallback}>
        <div className={styles.ldsRing}><div></div><div></div><div></div><div></div></div>
    </div>
}