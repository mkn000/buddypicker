import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { User } from './User';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private _id: string = '';
  constructor(private socket: Socket) {
    this.socket.on('connect', () => {
      this._id = this.socket.ioSocket.id;
      console.log('socket constructor,id: ' + this.id);
    });
  }

  get id() {
    return this._id;
  }

  addUser(): Observable<User> {
    return this.socket.fromEvent('new_user');
  }

  removeUser(): Observable<string> {
    return this.socket.fromEvent('remove_user');
  }

  getMessages() {
    return this.socket.fromEvent('messages');
  }

  onConnect() {
    return this.socket.fromEvent('connect');
  }

  receiveSession(sesId: string) {
    this.socket.emit('check', sesId);
    return this.socket.fromOneTimeEvent('receive');
  }

  joinSession(sesId: string, user: User, callback: (resp: any) => void) {
    this.socket.emit(
      'join',
      sesId,
      user,
      (resp: { success: boolean; msg: string }) => {
        callback(resp);
      }
    );
  }

  leaveSession(sesId: string) {
    this.socket.emit('leave', sesId);
  }

  createSession(
    ses: {
      host: { name: string; id: string };
      details: { description: string; extra: string };
    },
    callback: (resp: { sesId: string }) => void
  ) {
    this.socket.emit('create', ses, callback);
  }

  sendMessage(data: { name: string; msg: string }) {
    this.socket.emit('messages', data);
  }
}
