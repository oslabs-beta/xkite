// types/common/yaml.d.ts

type YAMLGenerator = (KiteConfig) => KiteSetup;

interface YAMLConfig {
  services: any;
}

interface YAMLServices {
  postgres: string;
  jupyter: string;
  spark: string;
  zookeeper: string;
  prometheus: string;
  grafana: string;
}

interface YAMLDataSetup {
  dbSrc: string;
  env: YAMLDataEnv;
}

interface YAMLDataEnv {
  username: string;
  password: string;
  dbName: string;
  URI: string;
}

interface PROMConfig {
  global: {
    scrape_interval: string;
    evaluation_interval: string;
    scrape_timeout: string;
  };
  rule_files: Array<null>;
  scrape_configs: Array<ScrapeConfig>;
}

interface ScrapeConfig {
  job_name: string;
  static_configs: Array<StaticConfig>;
}

interface StaticConfig {
  targets: Array<string>;
}

interface JMXConfig extends BaseCfg {
  command: Array<string>;
  volumes: Array<string>;
  depends_on: Array<string>;
}

interface KafkaBrokerCfg extends BaseCfg {
  environment: {
    KAFKA_ZOOKEEPER_CONNECT: string;
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: string;
    KAFKA_INTER_BROKER_LISTENER_NAME: string;
    CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: string;
    CONFLUENT_METRICS_REPORTER_TOPIC_REPLICAS: number;
    CONFLUENT_METRICS_ENABLE: string;
    KAFKA_HEAP_OPTS: string;
    KAFKA_BROKER_ID: number;
    KAFKA_JMX_PORT: number;
    KAFKA_ADVERTISED_LISTENERS: string;
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: number;
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: number;
    CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: string;
  };
  volumes: Array<string>;
  depends_on: Array<string>;
}

interface ZooKeeperCfg extends BaseCfg {
  environment: {
    ZOOKEEPER_CLIENT_PORT: number;
    ZOOKEEPER_TICK_TIME: number;
    ZOOKEEPER_INIT_LIMIT: number;
    ZOOKEEPER_SYNC_LIMIT: number;
  };
}

interface PrometheusCfg extends BaseCfg {
  volumes: Array<string>;
}

interface GrafanaCfg extends BaseCfg {
  environment: {
    GF_PATHS_DATA: string;
    GF_SECURITY_ALLOW_EMBEDDING: string;
    GF_AUTH_ANONYMOUS_ENABLED: string;
    GF_SMTP_ENABLED: string;
    GF_SECURITY_ADMIN_PASSWORD: string;
  };
  volumes: Array<string>;
  depends_on: Array<string>;
}

interface PGConfig extends BaseCfg {
  environment: {
    POSTGRES_PASSWORD: string;
    POSTGRES_USER: string;
    POSTGRES_DB: string;
  };
}

interface PrometheusCfg extends BaseCfg {
  volumes: Array<string>;
}

interface BaseCfg {
  image: string;
  ports: Array<string>;
  container_name: string;
}
