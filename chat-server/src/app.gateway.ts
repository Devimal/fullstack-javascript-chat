import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { MsgServerToUi, JoinUiToServer, JoinAcknowledgement, MsgUiToServer } from './types';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer()
  server: Server;
  private userToSocket: Map<string, Socket> = new Map();
  private socketToUser: WeakMap<Socket, string> = new WeakMap();

  private emitChatMessage(msg: MsgServerToUi) {
    this.server.emit('chatMessage', msg);
  }

  private emitJoinMessage(username: string): void {
    this.emitChatMessage({
      username: 'SERVER',
      message: `${username} has joined the chat.`,
      time: new Date(),
    });
  }

  @SubscribeMessage('joinChat')
  handleNewUserJoining(client: Socket, data: JoinUiToServer): JoinAcknowledgement {
    // same user cannot join twice
    if (this.userToSocket.has(data.username)) {
      return {
        joined: false,
        message: `Username "${data.username}" is already taken.`,
      };
    }

    // set maps
    this.userToSocket.set(data.username, client);
    this.socketToUser.set(client, data.username);

    // announce new person
    this.emitJoinMessage(data.username);

    // acknowledge
    return {
      joined: true,
      message: '',
    };
  }

  @SubscribeMessage('chatMessage')
  handleNewChatMessage(client: Socket, data: MsgUiToServer): void {
    const message: MsgServerToUi = {
      username: this.socketToUser.get(client),
      time: new Date(),
      message: data.message,
    };

    this.emitChatMessage(message);
  }
}
