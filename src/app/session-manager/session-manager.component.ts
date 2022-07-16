import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';
import { User } from '../User';
type Session = {
  id: string;
  host: string;
  details: any;
  init_users: User[];
  isCreator?: boolean;
};

@Component({
  selector: 'app-session-manager',
  templateUrl: './session-manager.component.html',
  styleUrls: ['./session-manager.component.css'],
})
export class SessionManagerComponent implements OnInit {
  sessions: Session[];
  model = { host: '', title: '' };

  constructor(private socketService: SocketService, private router: Router) {
    this.sessions = [];
  }

  ngOnInit(): void {
    console.log('init');
  }

  createNew() {
    this.router.navigate(['new']);
  }

  fetchSession(sessionId: string) {
    this.router.navigate(['join', sessionId]);
  }
}
