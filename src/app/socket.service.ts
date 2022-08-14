import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { User } from './User';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {}

  get id() {
    return this.socket.ioSocket.id;
  }

  addUser(): Observable<User> {
    return this.socket.fromEvent('new_user');
  }

  removeUser(): Observable<string> {
    return this.socket.fromEvent('remove_user');
  }

  getMessages(): Observable<string> {
    return this.socket.fromEvent('message');
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

  sessionClosed() {
    return this.socket.fromEvent('session_closed');
  }

  sendMessage(clients: string[], msg: string) {
    this.socket.emit('send_message', clients, msg);
  }

  updateID(old_data: { socketid: string; sesId: string }) {
    let data = {
      currentId: this.id,
      oldId: old_data.socketid,
      sesId: old_data.sesId,
    };
    console.log(data);
    this.socket.emit('update_id', data);
  }
}
