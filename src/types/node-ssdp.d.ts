declare module 'node-ssdp' {
  interface SsdpHeaders {
    [key: string]: string | number | boolean | symbol | null | undefined;
  }

  export interface RemoteInfo {
    address: string;
    family: string;
    port: number;
    size: number;
  }

  export class Client {
    constructor(options?: any);
    search(target: string): void;
    on(event: 'response', callback: (headers: SsdpHeaders, statusCode: number, rinfo: RemoteInfo) => void): void;
  }

  export class Server {
    constructor(options?: any);
    start(): void;
    stop(): void;
    on(event: 'advertise-alive' | 'advertise-bye' | 'response', 
       callback: (headers: Record<string, string>, statusCode: number, rinfo: { address: string }) => void): void;
    search(target: string): void;
  }
} 