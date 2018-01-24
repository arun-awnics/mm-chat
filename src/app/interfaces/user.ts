export class User {
    id: any;
    socketId: string;
    name: string;
    email: string;
    phoneNo: string;
    picUrl: string;
    description: string;
    status: string;
    waitingTime: number;
    rating: number;
    token: string; // token generated to activate the user
    actviate: number; // either 0 or 1(default is 0)
    privilege: string; // user or admin privilege
    createdTime: any;
    createdBy: string;
    updatedTime: any;
    updatedBy: string;
}
