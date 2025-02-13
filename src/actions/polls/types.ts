export interface SerializedFullPoll extends SerializedPoll {
    options: Array<SerializedPollOption>;
}
export interface SerializedPoll {
    uuid: string;
    title: string;
    guestAddable: boolean;
    dateCreated: string;
    yours: boolean;
    rankedChoice: boolean;
}
export interface SerializedPollOption {
    id: number;
    text: string;
    votes: Array<SerializedPollVotes>;
}
export interface SerializedPollVotes {
    id: number;
    yours: boolean;
    rank: number;
}