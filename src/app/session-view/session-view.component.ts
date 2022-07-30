import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SocketService } from '../socket.service';
import { User } from '../User';

@Component({
  selector: 'app-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: ['./session-view.component.css'],
})
export class SessionViewComponent implements OnInit, OnDestroy {
  private unsub = new Subject();
  validSession: boolean = true;
  joined: boolean = false;
  session: {
    host: { name: string; id: string };
    sesId: string;
    users: { [id: string]: User };
    details: { description: string; extra: string };
  };
  nUsers: number = 0;
  form: {
    name: string;
    name_alt: string;
  };
  messages: string[] = [];

  constructor(
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.session = {
      host: { name: '', id: '' },
      sesId: '',
      users: {},
      details: { description: '', extra: '' },
    };
    this.form = {
      name: '',
      name_alt: '',
    };
  }

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.unsub)).subscribe((data) => {
      console.log(data);
      if (!data['session']) {
        this.validSession = false;
      } else {
        this.session = data['session'];
        this.nUsers = Object.keys(this.session.users).length;
      }
    });

    this.socketService
      .onConnect()
      .pipe(takeUntil(this.unsub))
      .subscribe(() => {
        console.log('Connected to socket');
        console.log(this.socketService.id);
        let userJson = sessionStorage.getItem('user');
        console.log(userJson);
        if (userJson) {
          let user = JSON.parse(userJson);
          this.form.name = user.name;
          this.form.name_alt = user.name_alt;
        }
      });

    this.socketService
      .addUser()
      .pipe(takeUntil(this.unsub))
      .subscribe((resp: User) => {
        console.log('new user: ' + resp);
        this.session.users[resp.id] = resp;
        this.updateNUsers(1);
      });

    this.socketService
      .removeUser()
      .pipe(takeUntil(this.unsub))
      .subscribe((id: string) => {
        delete this.session.users[id];
        this.updateNUsers(-1);
      });

    this.socketService
      .sessionClosed()
      .pipe(takeUntil(this.unsub))
      .subscribe(() => {
        this.openDialog();
      });
  }

  joinSession(): void {
    console.log(this.socketService.id);
    const user = new User(
      this.form.name,
      this.form.name_alt,
      this.socketService.id
    );
    this.socketService.joinSession(this.session.sesId, user, (resp: any) => {
      console.log(resp);
      if (resp.success) {
        console.log('joined');
        this.joined = true;
        this.session.users[user.id] = user;
        sessionStorage.setItem('user', JSON.stringify(user));
        this.updateNUsers(1);
      }
    });
    this.socketService
      .getMessages()
      .pipe(takeUntil(this.unsub))
      .subscribe((msg: string) => {
        this.messages.push(msg);
      });
  }

  leaveSession(): void {
    console.log('I want to leave');
    delete this.session.users[this.socketService.id];
    this.socketService.leaveSession(this.session.sesId);
    this.updateNUsers(-1);
    this.joined = false;
  }

  goHome() {
    this.router.navigate(['']);
  }

  updateNUsers(val: number) {
    this.nUsers += val;
  }

  ngOnDestroy(): void {
    this.unsub.next(true);
    this.unsub.complete();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(SessionCloseDialogComponent, {
      width: '250px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
      this.joined = false;
      this.router.navigate(['']);
    });
  }
}

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-session-close-dialog',
  template: `<div mat-dialog-content>The host has closed the session</div>
    <div mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close color="primary">Ok</button>
    </div>`,
  styles: [],
})
export class SessionCloseDialogComponent {
  constructor(public dialogRef: MatDialogRef<SessionCloseDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
