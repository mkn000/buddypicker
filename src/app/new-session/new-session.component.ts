import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import { Subject, takeUntil } from 'rxjs';
import { RafflerService } from '../raffler.service';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.css'],
})
export class NewSessionComponent implements OnInit, OnDestroy {
  unsub = new Subject();
  memberLuck: number = 1;
  groupSize: number = 1;
  form: { name: string; description: string; extra: string } = {
    name: '',
    description: '',
    extra: '',
  };
  sesId: string = '';
  users: { [key: string]: any } = {};
  nUsers: number = 0;
  groups: Array<string[]> = [];
  constructor(
    private socketService: SocketService,
    private raffler: RafflerService
  ) {}

  ngOnInit(): void {
    this.socketService
      .addUser()
      .pipe(takeUntil(this.unsub))
      .subscribe((user) => {
        this.users[user.id] = user;
        this.updateNUsers(1);
      });

    this.socketService
      .removeUser()
      .pipe(takeUntil(this.unsub))
      .subscribe((id: string) => {
        delete this.users[id];
        this.updateNUsers(-1);
        console.log(this.users);
      });
  }

  createSession() {
    let ses = {
      host: { name: this.form.name, id: '' },
      users: {},
      details: { description: this.form.description, extra: this.form.extra },
    };
    this.socketService.createSession(ses, (resp) => {
      this.sesId = resp.sesId;
    });
  }

  selectGroup() {
    let toRaffler: string[] = [];
    Object.keys(this.users).forEach((e) => toRaffler.push(e));
    let group = this.raffler.raffle(toRaffler, this.memberLuck, this.groupSize);
    this.groups.push(group);
    console.log(group);
  }

  formatLabel(value: number) {
    return value + 'x';
  }

  updateNUsers(val: number) {
    this.nUsers += val;
  }

  ngOnDestroy(): void {
    this.unsub.next(true);
    this.unsub.complete();
  }
}
