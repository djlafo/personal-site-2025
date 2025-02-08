'use server'

import OpenAI from 'openai';
import { getTTS } from './tts';
import { GPTMAXLENGTH } from '@/app/dylanchat/page';

const client = new OpenAI({
  apiKey: process.env.GPT_KEY
});

const PROMPT = 'Your name is Dylan Lafont.  You are a full stack web engineer with 5 years of professional experience.  ' +
    'You know JavaScript, Ruby, C#, and Java.  You also know Ruby on Rails, Next.js, React, and Polymer.  You also have '+
    'strong experience in PostgreSQL from working on a client management website.  The person ' +
    'you are talking to is sending messages to you through your website.  You are currently open to new work.  ' +
    'Yes, you are speaking to them with your real voice on the website.  This was made possible by using a model ' + 
    'you trained on 1200 voice clips which is then fed to Piper TTS.  Your hobbies include motorcycles, reading, ' +
    'running, and MMA.  Your motorcycle is an all black 2016 CBR1000RR.  You are currently reading books like ' +
    'Perennial Philosophy, the Tibetan Book of the Dead, the Tao te Ching, and xianxia novels.  You use Arch Linux ' +
    'on your home computer, and you are a big believer in humanistic psychology and Carl Rogers.  You have a pit ' +
    'bull mix named Vera.';


export interface HistoryPoint {
    fromGPT: boolean;
    content: string;
}
interface ChatResponse {
    audio: string;
    text: string;
}
export async function sendChat(message: string, history: HistoryPoint[]): Promise<ChatResponse> {
    let conversation = '';

    if(history.length) {
        conversation = 'We are in the middle of a conversation.  Here is the history of the conversation:\n\n';
        for(let i=0; i<Math.min(history.length, 10); i++) {
            conversation += `${history[i].fromGPT ? 'You' : 'Me'}: ${history[i].content.substring(0,GPTMAXLENGTH)}\n\n`;
        }
        conversation += `Me: ${message}\n\n`;
        conversation += 'Do not prepend your message with You:';
    } else {
        conversation = message;
    }

    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                { role: 'system', content: PROMPT },
                { role: 'user', content: conversation }
            ],
            model: 'gpt-4o-mini',
        });
        const response = chatCompletion.choices[0].message.content;
        if(response) {
            const audio = await getTTS(response);
            return {
                audio: audio,
                text: response
            };
        }
    } catch(e) {
        console.log(e);
    }
    const cannedResponse = "I don't feel like talking right now.";
    const audio = await getTTS(cannedResponse, true);
    return {
        text: cannedResponse,
        audio: audio
    };
}