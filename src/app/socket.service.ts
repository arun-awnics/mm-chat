import { Injectable } from '@angular/core';
import { Message } from './interfaces/message';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {
    private socket;
    private baseUrl = 'http://localhost:3000';

    constructor() {
    }

    // send userId with connection to the server
    connection(userId) {
        this.socket = io(`${this.baseUrl}`, { query: `userId=${userId}` });
        this.socket.on('connect', () => {
            this.socket.emit('user-connected', userId);
        });
    }

    sendMessage(message: Message) {
        this.socket.emit('send-message', message);
    }

    logout(userId): any {
        this.socket.emit('logout', userId);
        const observable = new Observable(observer => {
            this.socket.on('logout-response', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    receiveMessages(): any {
        const observable = new Observable(observer => {
            this.socket.on('receive-message', (data) => {
                observer.next(data);
                console.log('message received: ', data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    sendTyping(sender, receiver, receiverType) {
        const data = {
            sender: sender,
            receiver: receiver,
            receiverType: receiverType
        };
        this.socket.emit('send-typing', (data));
        console.log('sending typing message', data);
    }

    receiveTyping() {
        const observable = new Observable(observer => {
            this.socket.on('receive-typing', (data) => {
                observer.next(data.sender.name);
                console.log('received typing message');
            });
        });
        return observable;
    }
}
