import { Component, OnDestroy, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { SocketService } from '../socket.service';
import { Subject, takeUntil } from 'rxjs';
import { RafflerService } from '../raffler.service';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.css'],
})
export class NewSessionComponent implements OnInit, OnDestroy {
  step: number = 0;
  unsub = new Subject();
  memberLuck: number = 1;
  groupSize: number = 1;
  messages: string[] = [];
  form: { name: string; description: string; extra: string } = {
    name: '',
    description: '',
    extra: '',
  };
  sesId: string | null = null;
  users: { [key: string]: any } = {};
  nUsers: number = 0;
  groups: Array<string[]> = [];
  constructor(
    private socketService: SocketService,
    private raffler: RafflerService,
    private clipBoard: Clipboard
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

  copyLink() {
    console.log(`${location.origin}/join/${this.sesId}`);
    this.clipBoard.copy(`${location.origin}/join/${this.sesId}`);
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
    return value + '%';
  }

  updateNUsers(val: number) {
    this.nUsers += val;
  }

  sendMessage(i: number) {
    this.socketService.sendMessage(this.groups[i], this.messages[i]);
    this.messages[i] = '';
  }

  ngOnDestroy(): void {
    if (this.sesId) {
      console.log('leaving');
      this.socketService.leaveSession('sesId');
    }
    this.unsub.next(true);
    this.unsub.complete();
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
}
