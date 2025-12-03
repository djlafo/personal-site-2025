'use client'

import React, { useEffect, useRef } from "react";
import { useState } from "react";

import { HistoryPoint } from "@/actions/gpt";
import { sendChatTTS } from "@/actions/tts";

import { GPTMAXLENGTH } from "./constants";

import styles from './gpt.module.css';
import { MyError } from "@/lib/myerror";
import { toast } from "react-toastify";

export default function DylanChat() {
    const [chatText, setChatText] = useState<HistoryPoint[]>([{
        fromGPT: true,
        content: "What's up?"
    }]);
    const [userInput, setUserInput] = useState('');
    const [audioObj] = useState<HTMLAudioElement | undefined>(() => {
        if(typeof window !== 'undefined') {
            return new Audio();
        }
    });
    const chatRef = useRef<HTMLDivElement>(null);

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
        if(MyError.isInstanceOf(response)) {
            toast.error(response.message);
        } else {
            if(audioObj) {
                // eslint-disable-next-line
                audioObj.src = `data:audio/mpeg;base64,${response.audio}`;
                audioObj.play();
            }
            setChatText(ct => {
                return ct.concat([
                {
                    content: response.text,
                    fromGPT: true
                }]);
            });
        }
    }

    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [chatText]);

    return <div ref={chatRef} className={styles.gpt}>
        <div className={styles.disclaimer}>
            Audio is actually my voice
        </div>
        <hr/>
        <div className={styles.chatBox}>
            {chatText.map((ct,i) => {
                return <React.Fragment key={i}>
                    <div className={ct.fromGPT ? styles.left : styles.right}>
                        <b>{ct.fromGPT ? 'Dylan' : 'You'}</b>
                        <br/>
                        <div>
                            {ct.content}
                        </div>
                    </div>
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