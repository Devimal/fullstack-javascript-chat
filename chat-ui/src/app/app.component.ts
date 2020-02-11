import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { MsgServerToUi, JoinUiToServer, JoinAcknowledgement, MsgUiToServer } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('chatUlElement') chatUlElement: ElementRef<HTMLUListElement>;

  joined = false;
  joinMessage = '';

  username = '';
  message = '';
  chatHistory: MsgServerToUi[] = [];

  constructor(private socket: Socket) {}

  ngAfterViewInit() {
    this.subscribeToChat();
  }

  private subscribeToChat() {
    return this.socket.fromEvent('chatMessage').subscribe((msg: MsgServerToUi) => {
      this.chatHistory.push(msg);
      this.scrollToBottomOfChat();
    });
  }

  /**
   *  Example uses setTimeout for demo simplicity.
   *  A better way would be to have a separate app-chat-content component and use ngAfterViewChecked() for scrolling to bottom.
   */
  private scrollToBottomOfChat() {
    setTimeout(() => {
      const nativeElement = this.chatUlElement.nativeElement;
      nativeElement.scrollTo(0, nativeElement.scrollHeight + 1000);
    }, 0);
  }

  onJoinChat() {
    const joinMessage: JoinUiToServer = {
      username: this.username
    };

    const acknowledgementCallback = (ack: JoinAcknowledgement) => {
      this.joined = ack.joined;
      this.joinMessage = ack.message;

      if (!this.joined) {
        this.username = '';
      }
    };

    this.socket.emit('joinChat', joinMessage, acknowledgementCallback);
  }

  onSendMessage() {
    const chatMessage: MsgUiToServer = {
      message: this.message
    };

    this.socket.emit('chatMessage', chatMessage);
    this.message = '';
  }
}
