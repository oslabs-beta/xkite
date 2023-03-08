import path from 'path';

const defaultCfg: KiteConfig = {
  kafka: {
    brokers: {
      size: 2,
      replicas: 2
    },
    zookeepers: {
      size: 2
    }
  },
  db: {
    name: 'ksql',
    port: 8088
  },
  sink: { name: 'jupyter' }
};

export enum KiteState {
  Init = 'Init',
  Configured = 'Configured',
  Running = 'Running',
  Shutdown = 'Shutdown'
}

export enum KiteServerState {
  Disconnected = 'Disconnected',
  Connected = 'Connected'
}
export const configFilePath = path.join(
  process.cwd(),
  'src/common/kite/download/config'
);

export default defaultCfg;
