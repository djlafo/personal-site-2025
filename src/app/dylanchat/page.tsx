'use client'

import React from "react";
import { useState } from "react";

import { HistoryPoint, sendChat } from "@/actions/gpt";

import styles from './gpt.module.css';

export const GPTMAXLENGTH = 500;

export default function DylanChat() {
    const [chatText, setChatText] = useState<HistoryPoint[]>([{
        fromGPT: true,
        content: "What's up?"
    }]);
    const [userInput, setUserInput] = useState('');

    const sendInput = async() => {
        setUserInput('');
        setChatText(ct => {
            return ct.concat([
            {
                content: userInput,
                fromGPT: false
            }]);
        });
        const response = await sendChat(userInput, chatText);
        const audio = new Audio(`data:audio/mpeg;base64,${response.audio}`);
        audio.play();
        setChatText(ct => {
            return ct.concat([
            {
                content: response.text,
                fromGPT: true
            }]);
        });
    }

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