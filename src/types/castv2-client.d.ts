declare module 'castv2-client' {
  export class Client {
    constructor(options?: any);
    connect(host: string, callback: (error?: Error) => void): void;
    close(): void;
    on(event: string, callback: (data: any) => void): void;
    launch(application: any, callback: (error?: Error, player?: Player) => void): void;
  }

  export class DefaultMediaReceiver {
    static APP_ID: string;
  }

  export interface Player {
    on(event: string, callback: (status: PlayerStatus) => void): void;
    load(media: Media, options: any, callback: (error?: Error, status?: PlayerStatus) => void): void;
    pause(): void;
    play(): void;
    getStatus(callback: (error?: Error, status?: PlayerStatus) => void): void;
    seek(position: number): void;
    setPlaybackRate(rate: number): void;
  }

  export interface Media {
    contentId: string;
    contentType: string;
    streamType: string;
  }

  export interface PlayerStatus {
    playerState: string;
    currentTime: number;
    duration: number;
    volume: {
      level: number;
      muted: boolean;
    };
  }
} 