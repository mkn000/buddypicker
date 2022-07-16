import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  Resolve,
} from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class SessionResolverService implements Resolve<any> {
  constructor(private socketService: SocketService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const sesId = route.paramMap.get('sesid')!;
    return this.socketService
      .receiveSession(sesId)
      .then((resp: any) => {
        if (resp.success) {
          return resp.session;
        } else {
          return false;
        }
      })
      .catch((err) => console.log(err));
  }
}
