declare module 'node-ssdp' {
  export class Client {
    constructor(options?: any);
    search(serviceType: string): void;
    on(event: string, callback: (headers: any, statusCode: number, rinfo: any) => void): void;
  }
} 