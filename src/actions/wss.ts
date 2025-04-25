'use server'

// import { MyError, MyErrorObj } from "@/lib/myerror";
// import { getUser } from "@/lib/sessions"
// import { getServerWebSocket } from "@/lib/websocketserver";

// export async function setupTextAlert(time: number, text: string): Promise<boolean | MyErrorObj> {
//     const user = await getUser();
//     if(!user) return MyError.create({message: 'Not logged in'});
    
//     const ws = await getServerWebSocket();
//     if(MyError.isInstanceOf(ws)) return ws;

//     ws.send(JSON.stringify({
//         event: 'text',
//         data: {
//             action: 'add',
//             time: time,
//             text: text,
//             recipient: user.phoneNumber
//         }
//     }), err => {
//         if(err) return MyError.create({message: err.message});
//     });
//     ws.close();

//     return true;
// }

// export async function deleteTextAlert(time: number, text: string): Promise<boolean | MyErrorObj> {
//     const user = await getUser();
//     if(!user) return MyError.create({message: 'Not logged in'});

//     const ws = await getServerWebSocket();
//     if(MyError.isInstanceOf(ws)) return ws;

//     ws.send(JSON.stringify({
//         event: 'text',
//         data: {
//             action: 'remove',
//             time: time,
//             text: text,
//             recipient: user.phoneNumber
//         }
//     }), err => {
//         if(err) return MyError.create({message: err.message});
//     });
//     ws.close();

//     return true;

// }

// export async function listTextAlerts(): Promise<TextMessage[] | MyErrorObj> {
//     const user = await getUser();
//     if(!user) return MyError.create({message: 'Not logged in'});
//     const ws = await getServerWebSocket();
//     if(MyError.isInstanceOf(ws)) return ws;

//     const p = new Promise<TextMessage[] | MyErrorObj>(acc => {
//         ws.on('message', data => {
//             // get the response list
//             const resp = JSON.parse(data.toString());
//             const events = resp.data as TextMessage[];
//             acc(events);
//         });
//         ws.send(JSON.stringify({
//             event: 'text',
//             data: {
//                 action: 'list',
//                 recipient: user.phoneNumber
//             }
//         }), err => {
//             if(err)
//                 acc(MyError.create({message: err.message}));
//         });
//     });

//     const result = await p;
//     ws.close();
//     return result;
// }