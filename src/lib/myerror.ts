export interface MyErrorObj {
    errorType: 'MyError';
    authRequired?: boolean;
    message: string;
}

export class MyError {
    static isInstanceOf(obj: any): obj is MyErrorObj {
        return obj.errorType === 'MyError';
    }

    static create({message, authRequired}: Omit<MyErrorObj, "errorType">): MyErrorObj {
        const obj: MyErrorObj = {
            errorType: 'MyError',
            message: message,
            authRequired: authRequired
        };
        return obj;
    }
}