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
  memberLuck: number = 50;
  groupIndex: number = 0;
  raffleError: string = '';
  hide: boolean = true;
  form: {
    name: string;
    description: string;
    extra: string;
    stream: { platform: string; member: { method: string; value: string } };
    insider: {
      method: string;
      passwordValue: string;
      ytUrl: string;
      ytKeyword: string;
    };
  } = {
    name: '',
    description: '',
    extra: '',
    stream: { platform: '', member: { method: '', value: '' } },
    insider: { method: '', passwordValue: '', ytUrl: '', ytKeyword: '' },
  };
  sesId: string | null = null;
  users: { [key: string]: any } = {};
  groupMsgs: string[] = [];
  messages: Array<string[]> = [[]];
  nUsers: number = 0;
  groups: Array<string[]> = [[]];
  constructor(
    private socketService: SocketService,
    private raffler: RafflerService,
    private clipBoard: Clipboard
  ) {}

  ngOnInit(): void {
    this.socketService
      .onConnect()
      .pipe(takeUntil(this.unsub))
      .subscribe(() => {
        console.log('connected');
        let hostJson = sessionStorage.getItem('hosting');
        if (hostJson) {
          let host = JSON.parse(hostJson);
          console.log(host);
          this.form.name = host.session.name;
          this.form.extra = host.session.extra;
          this.form.description = host.session.details.description;
          this.sesId = host.session.sesId;
          this.form.stream = host.session.details.stream;
          this.socketService.updateID(host);
          sessionStorage.setItem(
            'hosting',
            JSON.stringify({
              socketid: this.socketService.id,
              sesId: host.sesId,
            })
          );
        }
      });

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
      });
  }

  copyLink() {
    this.clipBoard.copy(`${location.origin}/join/${this.sesId}`);
  }

  createSession() {
    let ses = {
      host: { name: this.form.name, id: '' },
      users: {},
      details: {
        description: this.form.description,
        extra: this.form.extra,
        stream: this.form.stream,
      },
    };
    this.socketService.createSession(ses, (resp) => {
      this.sesId = resp.sesId;
      sessionStorage.setItem(
        'hosting',
        JSON.stringify({ socketid: this.socketService.id, session: ses })
      );
    });
  }

  selectGroup() {
    this.raffleError = '';
    let regulars: string[] = [],
      members: string[] = [];
    Object.keys(this.users).forEach((key) => {
      if (!this.users[key].assignedTo) {
        if (this.users[key].isMember) {
          members.push(key);
        } else {
          regulars.push(key);
        }
      }
    });
    let selected: string;
    if (regulars.length > 0 || members.length > 0) {
      selected = this.raffler.raffle(regulars, members, this.memberLuck);
    } else {
      this.raffleError = 'No users';
      return;
    }
    console.log(selected);
    this.users[selected].assignedTo = this.groupIndex;
    this.groups[this.groupIndex].push(selected);
  }

  formatLabel(value: number) {
    return value + '%';
  }

  updateNUsers(val: number) {
    this.nUsers += val;
  }

  sendMessage(i: number) {
    this.socketService.sendMessage(this.groups[i], this.groupMsgs[i]);
    this.messages[i].push(this.groupMsgs[i]);
    this.groupMsgs[i] = '';
  }

  ngOnDestroy(): void {
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
