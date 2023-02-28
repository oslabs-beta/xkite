// types/common/yaml.d.ts

type YAMLGenerator = (KiteConfig) => KiteSetup;

interface YAMLConfig {
  services: {
    [k: string]: BaseCfg | KafkaBrokerCfg | ZooKeeperCfg | JMXConfg | undefined;
    postgresql?: PGConfig;
    ksql?: KSQLConfig;
    ksql_schema?: KSQLSchemaCfg;
    spark?: BaseCfg;
    spring?: SpringCfg;
    prometheus?: PrometheusConfig;
    grafana?: GrafanaCfg;
    jupyter?: BaseCfg;
  };
  volumes?: {
    [k: string]: VolumeCfg;
  };
}

interface VolumeCfg {
  driver: 'local' | 'global';
  external?: 'true' | 'false';
  labels?: {};
  mountpoint?: string;
  name?: string;
  options?: {};
  scope?: 'local' | 'global';
  driver_opts?: {
    o?: string;
    type?: string;
    device?: string;
  };
}

interface YAMLServicesDefaultSetup {
  postgresql: PortForward;
  ksql: PortForward;
  ksql_schema: PortForward;
  spark: { webui: PortForward; rpc: PortForward };
  spring: PortForward;
  prometheus: PortForward;
  grafana: PortForward;
  jupyter: PortForward;
  zookeeper: { client: PortForward; peer: PortForward };
  kafka: { jmx: number; broker: PortForward; spring: number; metrics: number };
  jmx: PortForward;
}
type PortForward = {
  internal: number;
  external: number;
};

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
  scrape_configs: [
    {
      job_name: string;
      static_configs: [{ targets: Array<string> }];
    }
  ];
}

interface PrometheusConfig extends BaseCfg {}

interface KafkaBrokerCfg extends BaseCfg {
  environment: {
    KAFKA_ZOOKEEPER_CONNECT?: string;
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: string;
    KAFKA_INTER_BROKER_LISTENER_NAME: string;
    CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT?: string;
    CONFLUENT_METRICS_REPORTER_TOPIC_REPLICAS: number;
    CONFLUENT_METRICS_ENABLE: string;
    KAFKA_HEAP_OPTS: string;
    KAFKA_BROKER_ID: number;
    KAFKA_JMX_PORT: number;
    KAFKA_LISTENERS: string;
    KAFKA_ADVERTISED_LISTENERS: string;
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: number;
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: number;
    CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: string;
    KAFKA_AUTO_CREATE_TOPICS_ENABLE?: string;
    KAFKA_DELETE_TOPIC_ENABLE?: string;
    KAFKA_CREATE_TOPICS?: string;
  };
}

interface ZooKeeperCfg extends BaseCfg {
  environment: {
    ZOOKEEPER_SERVER_ID?: number;
    ZOOKEEPER_CLIENT_PORT: number;
    ZOOKEEPER_TICK_TIME: number;
    ZOOKEEPER_INIT_LIMIT: number;
    ZOOKEEPER_SYNC_LIMIT: number;
    ZOOKEEPER_SERVERS: string;
  };
}

interface GrafanaCfg extends BaseCfg {
  environment: {
    GF_PATHS_DATA: string;
    GF_SECURITY_ALLOW_EMBEDDING: string;
    GF_AUTH_ANONYMOUS_ENABLED: string;
    GF_SMTP_ENABLED: string;
    GF_SECURITY_ADMIN_PASSWORD: string;
  };
}

interface PGConfig extends BaseCfg {
  environment: {
    POSTGRES_PASSWORD: string;
    POSTGRES_USER: string;
    POSTGRES_DB: string;
    PGDATA: string;
  };
}

//https://docs.confluent.io/5.2.0/ksql/docs/installation/server-config/config-reference.html
interface KSQLConfig extends BaseCfg {
  environment: {
    KSQL_BOOTSTRAP_SERVERS: string; //kafka1:9092,kafka2:9093, ...
    KSQL_LISTENERS: string; //localhost:8090
    KSQL_KSQL_OUTPUT_TOPIC_NAME_PREFIX?: string; //ksql_
    KSQL_KSQL_SERVICE_ID?: string; //default_
    KSQL_KSQL_SCHEMA_REGISTRY_URL: string; //http://schema-registry:8081
    KSQL_KSQL_SINK_REPLICAS: number; //ex: 3, should be # of brokers
    KSQL_KSQL_STREAMS_REPLICATION_FACTOR: number; //ex: 3, should be # of brokers
    KSQL_KSQL_INTERNAL_TOPIC_REPLICAS: number; //ex: 3, should be # of brokers
    KSQL_KSQL_LOGGING_PROCESSING_STREAM_AUTO_CREATE?: 'true' | 'false';
    KSQL_KSQL_LOGGING_PROCESSING_TOPIC_AUTO_CREATE?: 'true' | 'false';
    KSQL_STREAMS_AUTO_OFFSET_RESET?: 'latest' | 'earliest';
    KSQL_STREAMS_PRODUCER_CONFLUENT_BATCH_EXPIRY_MS?: number; //9223372036854775807
    KSQL_STREAMS_PRODUCER_MAX_BLOCK_MS?: number; //9223372036854775807
    KSQL_STREAMS_PRODUCER_RETRIES?: number; //2147483647
    KSQL_STREAMS_PRODUCER_REQUEST_TIMEOUT_MS?: number; //300000
    // Growth:
    // KSQL_SECURITY_PROTOCOL:SASL_SSL
    // KSQL_SASL_MECHANISM:PLAIN
    // KSQL_SASL_JAAS_CONFIG="
  };
}

//https://github.com/confluentinc/schema-registry-workshop/blob/master/docker-compose.yml
interface KSQLSchemaCfg extends BaseCfg {
  environment: {
    SCHEMA_REGISTRY_KAFKASTORE_CONNECTION_URL: string;
    SCHEMA_REGISTRY_HOST_NAME: string; //schemaregistry
    SCHEMA_REGISTRY_LISTENERS: string; //localhost:8085
  };
}

interface SpringCfg extends BaseCfg {
  command: string;
  environment: {
    JAVA_OPTS: string;
    SPRING_CONFIG_LOCATION: string;
    'SPRING_KAFKA_BOOTSTRAP-SERVERS': string;
    'SPRING_KAFKA_CONSUMER_BOOTSTRAP-SERVERS': string;
    'SPRING_KAFKA_PRODUCER_BOOTSTRAP-SERVERS': string;
  };
}

//https://hub.docker.com/r/bitnami/spark/
// https://dev.to/mvillarrealb/creating-a-spark-standalone-cluster-with-docker-and-docker-compose-2021-update-6l4
interface SparkCfg extends BaseCfg {
  environment: {
    SPARK_LOCAL_IP: string;
    SPARK_MODE: 'master' | 'worker';
    SPARK_DAEMON_USER: string;
  };
}

// https://hub.docker.com/r/sscaling/jmx-prometheus-exporter
interface JMXConfg extends BaseCfg {
  environment: {
    SERVICE_PORT: number;
    JVM_OPTS?: string;
    CONFIG_YML?: string;
  };
}

interface BaseCfg {
  command?: Array<string>;
  restart?: string;
  image: string;
  ports: Array<string>;
  volumes?: Array<string>;
  depends_on?: Array<string>;
  container_name: string;
}
