export interface JoinUiToServer {
  username: string;
}

export interface JoinAcknowledgement {
  joined: boolean;
  message: string;
}

export interface MsgUiToServer {
  message: string;
}

export interface MsgServerToUi {
  username: string;
  time: string | Date;
  message: string;
}
