import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SessionViewComponent } from './session-view/session-view.component';
import { NewSessionComponent } from './new-session/new-session.component';
import { SessionManagerComponent } from './session-manager/session-manager.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

const config: SocketIoConfig = {
  url: environment.socketUrl,
  options: {
    transports: ['websocket'],
  },
};

@NgModule({
  declarations: [
    AppComponent,
    SessionViewComponent,
    NewSessionComponent,
    SessionManagerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSliderModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
