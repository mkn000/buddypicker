import { Server } from 'socket.io';
import http from 'http';
import crypto from 'crypto';
import { User } from '../src/app/User';

export class SocketHandler {
  rooms: Map<String, User[]>;
  io: Server;

  constructor(server: http.Server) {
    this.rooms = new Map();
    this.io = new Server(server);

    this.io.on('connection', (socket) => {
      socket.on('join', (sessionId: String, user: User) => {
        if (this.rooms.has(sessionId)) {
          user.id = socket.id;
          this.rooms.get(sessionId)?.push(user);
        } else {
          this.io.emit('no_session');
        }
      });

      socket.on('create', (user: User, callback) => {
        user.id = socket.id;
        let sessionId;
        do {
          sessionId = crypto.randomBytes(3).toString('hex');
        } while (!this.rooms.has(sessionId));

        this.rooms.set(sessionId, [user]);
        callback({
          sessionId: sessionId,
        });
      });
    });
    console.log('SocketHandler loaded.');
  }
}
