const defaultCfg: KiteConfig = {
  kafka: {
    brokers: {
      size: 2,
      replicas: 2,
    },
    zookeepers: {
      size: 2,
    },
  },
  db: {
    dataSource: 'postgresql',
    port: 5432,
  },
  sink: { name: 'jupyter' },
};

export enum KiteState {
  Init = 'Init',
  Configured = 'Configured',
  Running = 'Running',
  Shutdown = 'Shutdown',
}

export enum KiteServerState {
  Disconnected = 'Disconnected',
  Connected = 'Connected',
}

export default defaultCfg;
