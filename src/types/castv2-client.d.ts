declare module 'castv2-client' {
  export class Client {
    constructor();
    connect(host: string, callback: () => void): void;
    launch(application: any, callback: (err: any, player: any) => void): void;
    on(event: string, callback: (err: any) => void): void;
    close(): void;
  }

  export class DefaultMediaReceiver {
    static APP_ID: string;
  }
} 