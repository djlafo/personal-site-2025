'use client'

import { useState } from "react";

import { SerializedPoll } from "@/actions/polls";

import PollList from "./PollList";
import Poll from './Poll';

export default function PollPage() {
    const [selectedPoll, setSelectedPoll] = useState<SerializedPoll>();
    return <>
        <PollList onOpen={(p) => setSelectedPoll(p)}/>
        {
            selectedPoll && <Poll poll={selectedPoll}/> || <></>
        }
    </>;
}