import { useEffect } from "react";

import styles from '../tts.module.css';

interface ReadDisplayProps {
    paragraphs: string[];
    onClickParagraph: (paragraph: string, ind?: number) => void;
    activeRow: number;
    onEditRequest: () => void;
}
export default function ReadDisplay({paragraphs, onClickParagraph, activeRow, onEditRequest}: ReadDisplayProps) {
    useEffect(() => {
        const detectMediaKeys = (e : KeyboardEvent) => {
            if(e.key === 'ArrowDown') {
                e.preventDefault();
                onClickParagraph(paragraphs[activeRow + 1], activeRow + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                onClickParagraph(paragraphs[activeRow - 1], activeRow - 1);
            }
        };

        window.addEventListener('keydown', detectMediaKeys);
        return () => {
            window.removeEventListener('keydown', detectMediaKeys);
        }
    }, [activeRow, onClickParagraph, paragraphs])

    useEffect(() => {
        if(!activeRow && activeRow !== 0) return;
        const div = document.querySelector(`#readingRow${activeRow}`);
        if(div) div.scrollIntoView({
            behavior: 'smooth'
        });
    }, [activeRow])

    return <div>
        {paragraphs.map((t,i) => {
            return <div key={i} id={`readingRow${i}`}
                className={`${styles.readingText} ${i===activeRow ? styles.currentReading : ''}`}
                onDoubleClick={() => onClickParagraph(t, i)}>
                {t}
            </div>;
        })}
        <div className={styles.buttons}>
            <input type='button'
                value="Edit Text" 
                onClick={() => onEditRequest()}/>
        </div>
    </div>;
}
