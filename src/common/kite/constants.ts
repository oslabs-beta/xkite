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
  dataSource: 'postgresql',
  sink: 'jupyter',
};

export default defaultCfg;
