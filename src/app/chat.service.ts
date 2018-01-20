import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Message } from './interfaces/message';
import { User } from './interfaces/user';
import { Group } from './interfaces/group';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ChatService {

  private user: User;
  private group: Group;
  private messageUrl = 'http://localhost:3000/message/controllers/';  // URL to server

  constructor(
    private http: HttpClient) { }

    setUser(user) {
      this.user = user;
    }

    setGroup(group) {
      this.group = group;
    }

    getUser() {
      return this.user;
    }

    getGroup() {
      return this.group;
    }

  /** GET messages from the server */
  getMessages(userId, groupId, offset, size): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.messageUrl}getLimitedMessages/user/${userId}/groups/${groupId}/messages?offset=${offset}&size=${size}`
    )
      .pipe(
      map(messages => messages),
      tap(messages => console.log(messages)),
      catchError(this.handleError('getMessages', []))
      );
  }

  //////// Save methods //////////

  /** POST: add a new message to the server */
  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(`${this.messageUrl}sendMessage`, message, httpOptions).pipe(
      map(msg => msg),
      catchError(this.handleError<Message>('sendMessage'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
