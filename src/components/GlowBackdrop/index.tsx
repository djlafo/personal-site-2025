import React from 'react';

interface GlowBackdropProps {
    id: string;
    saturation?: string;
    deviation?: string;
}

export default function GlowBackdrop({id, saturation="5", deviation="20"} : GlowBackdropProps) {
    return <svg width="0" height="0">
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={deviation} result="blurred"/>
            <feColorMatrix type="saturate" in="blurred" values={saturation}/>
            <feComposite in="SourceGraphic" operator="over"/>
        </filter>
    </svg>;
}