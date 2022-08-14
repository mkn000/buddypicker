import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RafflerService {
  constructor() {}

  raffle(regulars: string[], members: string[], luck: number): string {
    let rnd: number = Math.random();
    let source: string[];
    if (rnd * 100 < luck && members.length > 0) {
      source = members;
    } else if (regulars.length > 0) {
      source = regulars;
    } else {
      source = members;
    }
    let max = source.length - 1;
    console.log();
    //Math.floor(Math.random() * (max - min +1)) + min
    let ix = Math.floor(rnd * (max + 1));
    return source[ix];
  }
}
