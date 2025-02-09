'use client'

import React, { useEffect } from "react";
import { useState } from "react";

import { HistoryPoint } from "@/actions/gpt";

import styles from './gpt.module.css';
import { sendChatTTS } from "@/actions/tts";
import { GPTMAXLENGTH } from "./constants";

export default function DylanChat() {
    const [chatText, setChatText] = useState<HistoryPoint[]>([{
        fromGPT: true,
        content: "What's up?"
    }]);
    const [userInput, setUserInput] = useState('');
    const [audioObj, setAudioObj] = useState(() => {
        if(typeof window !== 'undefined') return new Audio();
    });

    const sendInput = async() => {
        setUserInput('');
        setChatText(ct => {
            return ct.concat([
            {
                content: userInput,
                fromGPT: false
            }]);
        });
        const response = await sendChatTTS(userInput, chatText);
        audioObj.src = `data:audio/mpeg;base64,${response.audio}`;
        audioObj.play();
        setChatText(ct => {
            return ct.concat([
            {
                content: response.text,
                fromGPT: true
            }]);
        });
    }

    useEffect(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }, [chatText])

    return <div className={styles.gpt}>
        <div className={styles.chatBox}>
            {chatText.map(ct => {
                return <React.Fragment key={crypto.randomUUID()}>
                    <span>{ct.fromGPT ? 'Dylan' : 'You'}: {ct.content}</span><br/><br/>
                </React.Fragment>;
            })}
        </div>
        <form onSubmit={e => e.preventDefault()}>
            <div className={styles.inputs}> 
                <input type='text' max={GPTMAXLENGTH} value={userInput} onChange={e => setUserInput(e.target.value)}/>
                <input type='submit' value='Send' onClick={() => sendInput()}/>
            </div>
        </form>
    </div>
}