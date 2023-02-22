import { Readable } from 'stream';
import { networkInterfaces } from 'os';

// get first ipAddress on machine
export function getIPAddress(): Function {
  let ipAddr!: string;
  const ifaces: any = networkInterfaces();
  return () => {
    if (ipAddr !== undefined) return ipAddr;

    for (const dev in ifaces) {
      if (ipAddr) break;
      ifaces[dev].filter((details: any) => {
        if (details.family === 'IPv4' && details.internal === false) {
          ipAddr = details.address;
        }
      });
    }
    return ipAddr;
  };
}

export default class ReadableString extends Readable {
  private sent = false;

  constructor(private str: string) {
    super();
  }

  _read() {
    if (!this.sent) {
      this.push(Buffer.from(this.str));
      this.sent = true;
    } else {
      this.push(null);
    }
  }
}
