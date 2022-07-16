import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RafflerService {
  constructor() {}

  raffle(users: string[], luck: number, size: number): string[] {
    let group: string[] = [];
    console.log(users);
    if (users.length <= size) {
      group = users;
    } else {
      const max = users.length - 1;
      for (let i = 0; i < size; i++) {
        //Math.floor(Math.random() * (max - min +1)) + min
        let ix = Math.floor(Math.random() * (max - i + 1));
        console.log(ix);
        group.push(users[ix]);
        users.splice(ix, 1);
      }
    }
    return group;
  }
}
