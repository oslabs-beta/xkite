//Monitor class to help connect to Kafka monitoring
const { spawn } = require('child_process');

export default class Monitor {
  public static initiate() {
    const port: number = parseInt(process.env.PORT2!, 10) || 6662;
    const child = spawn('open', [`http://localhost:${port}/display`]);
    child.on('error', (err: any) => {
      console.error('Failed to open localhost:', err);
    });
  }
}
