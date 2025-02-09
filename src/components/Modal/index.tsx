import React, { useState, useEffect } from 'react';
import './modal.css';

interface ModalProps {
    onClose: () => void;
    opened: boolean;
    children: React.ReactNode;
    styleOne?: boolean;
    doOnKey?: (e: KeyboardEvent) => void;
    fullVertical?: boolean;
}

export function openOnEscFn(openFn : () => void) {
    return (e: KeyboardEvent) => {
        if(e.key === 'Escape' && !document.querySelector('.modal-parent.opened')) {
            openFn();
        }
    }
}

export default function Modal({ opened, children, onClose, styleOne=false, doOnKey, fullVertical} : ModalProps) {
    const [prevOpened, setPrevOpened] = useState(false);

    if((prevOpened !== opened)) {
        setPrevOpened(opened);
    }

    useEffect(() => {
		const onEsc = (e : KeyboardEvent) => {
            if(doOnKey) doOnKey(e);
            if(opened && e.key === "Escape") {
                onClose();
            }
		};

		window.addEventListener('keydown', onEsc);
		return () => {
			window.removeEventListener('keydown', onEsc);
		}
	}, [onClose, doOnKey, opened]);

    return <div className={`modal-parent ${prevOpened ? 'opened' : ''}`}>
        <div className='modal-background' onClick={() => onClose()}></div>
        <div className={`modal-content ${styleOne ? 'style-one' : ''} ${fullVertical ? 'full-vertical' : ''}`}>
            {children}
        </div>
    </div>;
};