import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';
const downloadDir = path.join(process.cwd(), 'src/common/kite/download');

export default function ymlGenerator(): Function {
  const PROMCONFIG: PROMConfig = {
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

  const JMX: BaseCfg = {
    image: 'bitnami/jmx-exporter:latest',
    command: ['5566', '/etc/myconfig.yml'],
    ports: [],
    volumes: [],
    container_name: '',
    depends_on: [],
  };

  const KAFKA_BROKER: KafkaBrokerCfg = {
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
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 2,
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 2,
      CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: '',
    },
    ports: [],
    volumes: [],
    container_name: '',
    depends_on: ['zookeeper', 'postgres'],
  };

  const ZOOKEEPER: ZooKeeperCfg = {
    image: 'confluentinc/cp-zookeeper',
    environment: {
      ZOOKEEPER_CLIENT_PORT: 2182,
      ZOOKEEPER_TICK_TIME: 2000,
      ZOOKEEPER_INIT_LIMIT: 5,
      ZOOKEEPER_SYNC_LIMIT: 2,
    },
    ports: ['2182:2182'],
    container_name: 'zookeeper',
  };

  const PROMETHEUS: BaseCfg = {
    image: 'prom/prometheus',
    ports: ['9099:9090'],
    volumes: [
      `${downloadDir}/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml`,
    ],
    container_name: 'prometheus',
  };

  const GRAFANA: GrafanaCfg = {
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
      `${downloadDir}/grafana/provisioning:/etc/grafana/provisioning`,
      `${downloadDir}/grafana/dashboards:/var/lib/grafana/dashboards`,
    ],
    container_name: 'grafana',
    depends_on: ['prometheus'],
  };

  const POSTGRES: PGConfig = {
    image: 'postgres',
    environment: {
      POSTGRES_PASSWORD: 'admin',
      POSTGRES_USER: 'admin',
      POSTGRES_DB: 'xkiteDB',
    },
    ports: [],
    container_name: 'postgres',
  };

  const JUPYTER: BaseCfg = {
    image: 'jupyterhub/jupyterhub',
    ports: ['8000:8000'],
    container_name: 'jupyterhub',
  };

  const SPARK: BaseCfg = {
    image: 'bitnami/spark',
    ports: [],
    container_name: 'spark',
  };

  const YAML: YAMLConfig = { services: {} };

  return (config: KiteConfig): KiteSetup => {
    const { numOfClusters, dataSource, sink } = config;
    const setup: KiteSetup = {
      dataSetup: {
        dbSrc: '',
        env: {
          username: '',
          password: '',
          dbName: '',
          URI: '',
        },
      },
      kafkaSetup: {
        brokers: [],
        ssl: false,
      },
    };
    try {
      if (dataSource === 'postgresql') {
        YAML.services.postgres = POSTGRES;
        setup.dataSetup = {
          dbSrc: dataSource,
          env: {
            password: POSTGRES.environment.POSTGRES_PASSWORD,
            username: POSTGRES.environment.POSTGRES_USER,
            dbName: POSTGRES.environment.POSTGRES_DB,
            URI: '',
          },
        };
      }
      if (sink === 'jupyter') YAML.services.jupyter = JUPYTER;
      if (sink === 'spark') YAML.services.spark = SPARK;
      YAML.services.zookeeper = ZOOKEEPER;
      YAML.services.prometheus = PROMETHEUS;
      YAML.services.grafana = GRAFANA;
      const jmxExporterConfig: any = yaml.load(
        fs.readFileSync(
          path.resolve(downloadDir, 'jmx/exporter/template.yml'),
          'utf8'
        )
      );

      // Checks if directories download, prometheus and jmx exist, if not, then it creates all of them
      fs.ensureDirSync(downloadDir);
      fs.ensureDirSync(path.resolve(downloadDir, 'jmx'));
      fs.ensureDirSync(path.resolve(downloadDir, 'prometheus'));

      for (let i = 4; i < numOfClusters + 4; i++) {
        YAML.services[`jmx-kafka${i - 3}`] = {
          ...JMX,
          ports: [`${5556 + i}:5566`],
          container_name: `jmx-kafka${i - 3}`,
          volumes: [
            `${downloadDir}/jmx/jmxConfigKafka${i - 3}.yml:/etc/myconfig.yml`,
          ],
          depends_on: [`kafka${i - 3}`],
        };

        YAML.services[`kafka${i - 3}`] = {
          ...KAFKA_BROKER,
          ports: [`909${1 + i}:909${1 + i}`, `999${1 + i}:999${1 + i}`],
          container_name: `kafka${i - 3}`,
          environment: {
            ...KAFKA_BROKER.environment,
            KAFKA_BROKER_ID: 101 + i,
            KAFKA_JMX_PORT: 9991 + i,
            KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://kafka${
              i - 3
            }:29092,PLAINTEXT_HOST://localhost:909${i + 1}`,
            KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR:
              numOfClusters < 3 ? numOfClusters : 3,
            KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR:
              numOfClusters < 3 ? numOfClusters : 3,
            CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: `kafka${i + 1}:29092`,
          },
        };

        setup.kafkaSetup.brokers.push(`localhost:909${1 + i}`);

        PROMCONFIG.scrape_configs[0].static_configs[0].targets.push(
          `jmx-kafka${i - 3}:5566`
        );

        jmxExporterConfig.hostPort = `kafka${i - 3}:999${1 + i}`;
        fs.writeFileSync(
          path.resolve(
            process.cwd(),
            downloadDir,
            `jmx/jmxConfigKafka${i - 3}.yml`
          ),
          yaml.dump(jmxExporterConfig, { noRefs: true })
        );
      }

      fs.writeFileSync(
        path.resolve(downloadDir, 'docker-compose.yml'),
        yaml.dump(YAML, { noRefs: true })
      );

      fs.writeFileSync(
        path.resolve(downloadDir, 'prometheus/prometheus.yml'),
        yaml.dump(PROMCONFIG, { noRefs: true })
      );

      PROMCONFIG.scrape_configs[0].static_configs[0].targets = [];
    } catch (error) {
      console.log(error);
    } finally {
      return setup;
    }
  };
}
