import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewSessionComponent } from './new-session/new-session.component';
import { SessionManagerComponent } from './session-manager/session-manager.component';
import { SessionResolverService } from './session-resolver.service';
import { SessionViewComponent } from './session-view/session-view.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: SessionManagerComponent },
  { path: 'new', component: NewSessionComponent },
  {
    path: 'join/:sesid',
    component: SessionViewComponent,
    resolve: {
      session: SessionResolverService,
    },
  },
  { path: 'join', redirectTo: 'home', pathMatch: 'full' },
  { path: '*', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
