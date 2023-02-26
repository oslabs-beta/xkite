import fs from 'fs-extra';
import path from 'path';

export const downloadDir = path.join(process.cwd(), 'src/common/kite/download');
export const network = 'localhost'; //change to 0.0.0.0 to expose ports globally

export const PROMCONFIG: PROMConfig = {
  global: {
    scrape_interval: '26s',
    evaluation_interval: '15s',
    scrape_timeout: '25s',
  },
  rule_files: [null],
  scrape_configs: [
    {
      job_name: 'xkite',
      static_configs: [
        {
          targets: [],
        },
      ],
    },
  ],
};

export const JMX: JMXConfg = {
  image: 'bitnami/jmx-exporter:latest',
  environment: { SERVICE_PORT: 5556 },
  ports: [],
  volumes: [],
  container_name: '',
  depends_on: [],
};

export const KAFKA_BROKER: KafkaBrokerCfg = {
  image: 'confluentinc/cp-kafka',
  environment: {
    KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2182',
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP:
      'PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT',
    KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT',
    CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: 'zookeeper:2182',
    CONFLUENT_METRICS_REPORTER_TOPIC_REPLICAS: 1,
    CONFLUENT_METRICS_ENABLE: 'false',
    KAFKA_HEAP_OPTS: '-Xmx512M -Xms512M',
    KAFKA_BROKER_ID: 101,
    KAFKA_JMX_PORT: 9991,
    KAFKA_ADVERTISED_LISTENERS: '',
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1,
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1,
    CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: '',
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true',
    KAFKA_DELETE_TOPIC_ENABLE: 'true',
    KAFKA_CREATE_TOPICS: 'topic-test:1:1',
  },
  ports: [],
  volumes: [],
  container_name: '',
  depends_on: ['zookeeper', 'postgres'],
};

export const ZOOKEEPER: ZooKeeperCfg = {
  image: 'confluentinc/cp-zookeeper',
  environment: {
    ZOOKEEPER_CLIENT_PORT: 2182,
    ZOOKEEPER_TICK_TIME: 2000,
    ZOOKEEPER_INIT_LIMIT: 5,
    ZOOKEEPER_SYNC_LIMIT: 2,
    ZOOKEEPER_SERVERS: '',
  },
  ports: ['2182:2182'],
  container_name: 'zookeeper',
};

export const PROMETHEUS: PrometheusConfig = {
  image: 'prom/prometheus',
  ports: ['9099:9090'],
  volumes: [
    `${path.join(
      downloadDir,
      'prometheus/prometheus.yml'
    )}:/etc/prometheus/prometheus.yml`,
  ],
  container_name: 'prometheus',
};

export const GRAFANA: GrafanaCfg = {
  image: 'grafana/grafana-oss',
  ports: ['3050:3000'],
  environment: {
    GF_PATHS_DATA: '/var/lib/grafana',
    GF_SECURITY_ALLOW_EMBEDDING: 'true',
    GF_AUTH_ANONYMOUS_ENABLED: 'true',
    GF_SMTP_ENABLED: 'true',
    GF_SECURITY_ADMIN_PASSWORD: 'xkite',
  },
  volumes: [
    'provisioning:/etc/grafana/provisioning',
    'dashboards:/var/lib/grafana/dashboards',
  ],
  container_name: 'grafana',
  depends_on: ['prometheus'],
};

export const POSTGRES: PGConfig = {
  image: 'postgres',
  restart: 'unless-stopped',
  environment: {
    POSTGRES_PASSWORD: 'admin',
    POSTGRES_USER: 'admin',
    POSTGRES_DB: 'xkiteDB',
    PGDATA: '/data/postgres',
  },
  volumes: ['postgresql:/var/lib/postgresql/data'],
  ports: ['5432:5432'],
  container_name: 'postgresql',
};

export const KSQL: KSQLConfig = {
  image: 'confluentinc/ksqldb-server',
  environment: {
    KSQL_BOOTSTRAP_SERVERS: '', //kafka1:9092,kafka2:9092, ...
    KSQL_LISTENERS: `http://${network}:8088`,
    KSQL_KSQL_OUTPUT_TOPIC_NAME_PREFIX: 'ksql_',
    // KSQL_KSQL_SERVICE_ID: 'default_',
    KSQL_KSQL_SCHEMA_REGISTRY_URL: 'http://schema-registry:8085',
    KSQL_KSQL_SINK_REPLICAS: 1, //ex: 3, should be # of brokers
    KSQL_KSQL_STREAMS_REPLICATION_FACTOR: 1, //ex: 3, should be # of brokers
    KSQL_KSQL_INTERNAL_TOPIC_REPLICAS: 1, //ex: 3, should be # of brokers
    KSQL_KSQL_LOGGING_PROCESSING_STREAM_AUTO_CREATE: 'true',
    KSQL_KSQL_LOGGING_PROCESSING_TOPIC_AUTO_CREATE: 'true',
    KSQL_STREAMS_AUTO_OFFSET_RESET: 'latest',
    KSQL_STREAMS_PRODUCER_CONFLUENT_BATCH_EXPIRY_MS: 9223372036854775807,
    KSQL_STREAMS_PRODUCER_MAX_BLOCK_MS: 9223372036854775807,
    KSQL_STREAMS_PRODUCER_RETRIES: 2147483647,
    KSQL_STREAMS_PRODUCER_REQUEST_TIMEOUT_MS: 300000,
  },
  ports: ['8088:8088'],
  container_name: 'ksql',
  depends_on: [],
};
// # could add CLI https://ksqldb.io/quickstart.html

// # Schema Registry
export const KSQL_SCHEMA: KSQLSchemaCfg = {
  image: 'confluentinc/cp-schema-registry',
  restart: 'always',
  depends_on: [],
  environment: {
    SCHEMA_REGISTRY_KAFKASTORE_CONNECTION_URL: '',
    SCHEMA_REGISTRY_HOST_NAME: 'schema-registry',
    SCHEMA_REGISTRY_LISTENERS: `${network}:8085`,
  },
  ports: ['8085:8085'],
  container_name: 'ksql-schema',
};

export const JUPYTER: BaseCfg = {
  image: 'jupyterhub/jupyterhub',
  ports: ['8000:8000'],
  container_name: 'jupyterhub',
};

export const SPARK: BaseCfg = {
  image: 'bitnami/spark',
  ports: [],
  container_name: 'spark',
};

export const SPRING: SpringCfg = {
  image: 'eclipse-temurin:19-jre-alpine',
  ports: ['8080:8080'],
  environment: {
    JAVA_OPTS: '',
    SPRING_CONFIG_LOCATION: '/etc/myconfig.yml',
    'SPRING_KAFKA_BOOTSTRAP-SERVERS': 'kafka1:29091',
    'SPRING_KAFKA_CONSUMER_BOOTSTRAP-SERVERS': 'kafka1:29091',
    'SPRING_KAFKA_PRODUCER_BOOTSTRAP-SERVERS': 'kafka1:29091',
  },
  command: 'java -jar /app.jar',
  volumes: [
    `${path.join(downloadDir, 'spring/app.jar')}:/app.jar`,
    `${path.join(downloadDir, 'spring/application.yml')}:/etc/myconfig.yml`,
  ],
  container_name: 'spring',
  depends_on: ['kafka1'],
};

export const YAML: YAMLConfig = {
  services: {},
  volumes: {
    dashboards: {
      driver: 'local',
      driver_opts: {
        o: 'bind',
        type: 'none',
        device: `${path.join(downloadDir, 'grafana/dashboards')}`,
      },
    },
    provisioning: {
      driver: 'local',
      driver_opts: {
        o: 'bind',
        type: 'none',
        device: `${path.join(downloadDir, 'grafana/provisioning')}`,
      },
    },
  },
};
