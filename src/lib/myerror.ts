export interface ErrorOptions {
    authRequired?: boolean;
    message: string;
}

export class MyError {
    message: string;
    authRequired: boolean;

    constructor({message, authRequired = false}: ErrorOptions) {
        this.message = message;
        this.authRequired = authRequired;
    }

    toObj() {
        const obj: ErrorOptions = {
            message: this.message,
            authRequired: this.authRequired
        };
        return obj;
    }
}