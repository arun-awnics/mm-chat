import {Injectable} from '@angular/core';
import { Message } from './interfaces/message';
import * as io from 'socket.io-client';

const socket = io.connect('http://localhost:3000/'); 
@Injectable()
export class SocketService {
    constructor() {
    }
    socketConnection() {}
    // for sending a message
    sendMessage(message: Message) {
    socket.on(message.receiverId).emit('send-message', message);
    //console.log(message);
    }
    reciveMessages(message) {
        socket.emit('recive-message', message);
        console.log('message is recived' + message);

    }

 }