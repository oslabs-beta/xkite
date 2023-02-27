//Monitor class to help connect to Kafka monitoring
const { spawn } = require('child_process');

export default class Monitor {
  public static initiate() {
    const child = spawn('open', ['http://localhost:6662/display']);
    child.on('error', (err: any) => {
      console.error('Failed to open localhost:', err);
    });
  }
}
