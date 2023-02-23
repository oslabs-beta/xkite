import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';
import { getIPAddress } from '../utilities';
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
    const { kafka, dataSource, sink } = config;
    const dependencies = [];
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
        dependencies.push('postgres');
      }
      if (sink === 'jupyter') YAML.services.jupyter = JUPYTER;
      if (sink === 'spark') YAML.services.spark = SPARK;
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
      const ipAddr = 'localhost'; //getIPAddress()();

      const numOfZKs = kafka.zookeepers.size > 1 ? kafka.zookeepers.size : 1;
      // get server list
      const servers = (() => {
        let zkServer = '';
        let zkClients = '';
        for (let i = 0; i < numOfZKs; i++) {
          zkServer += `zookeeper${i + 1}:${i + 1}2888:${i + 1}3888;`;
          zkClients += `zookeeper${i + 1}:${i + 1}2181,`;
        }
        zkServer = zkServer.slice(0, -1);
        zkClients = zkClients.slice(0, -1);
        return { zkServer, zkClients };
      })();
      // construct zookeepers
      for (let i = 0; i < numOfZKs; i++) {
        const n = i + 1;
        const name = `zookeeper${n}`;
        let cport = `${n}2181`;
        if (kafka.zookeepers.client_ports !== undefined) {
          cport = String(kafka.zookeepers.client_ports[i]);
        }
        YAML.services[name] = {
          ...ZOOKEEPER,
          environment: {
            ...ZOOKEEPER.environment,
            ZOOKEEPER_SERVER_ID: n,
            ZOOKEEPER_CLIENT_PORT: cport,
            ZOOKEEPER_SERVERS: servers.zkServer,
          },
          ports: [`${cport}:2181`],
          container_name: name,
        };
        dependencies.push(name);
      }

      for (let i = 0; i < kafka.brokers.size; i++) {
        const n = i + 1;
        YAML.services[`jmx-kafka${n}`] = {
          ...JMX,
          ports: [`${5556 + i}:5566`],
          container_name: `jmx-kafka${n}`,
          volumes: [
            `${downloadDir}/jmx/jmxConfigKafka${n}.yml:/etc/myconfig.yml`,
          ],
          depends_on: [`kafka${n}`],
        };

        YAML.services[`kafka${n}`] = {
          ...KAFKA_BROKER,
          ports: [`909${n}:909${n}`, `999${n}:999${n}`],
          container_name: `kafka${n}`,
          environment: {
            ...KAFKA_BROKER.environment,
            KAFKA_BROKER_ID: 101 + i,
            KAFKA_JMX_PORT: 9991 + i,
            KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://kafka${n}:29092,PLAINTEXT_HOST://${ipAddr}:909${n}`,
            KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: kafka.brokers.replicas ?? 1,
            KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR:
              kafka.brokers.replicas ?? 1,
            CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: `kafka${n}:29092`,
            KAFKA_ZOOKEEPER_CONNECT: servers.zkClients,
            CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: servers.zkClients,
          },
          depends_on: dependencies,
        };
        // requires port forwarding on host computer
        setup.kafkaSetup.brokers.push(`${ipAddr}:909${n}`);

        PROMCONFIG.scrape_configs[0].static_configs[0].targets.push(
          `jmx-kafka${n}:5566`
        );

        jmxExporterConfig.hostPort = `kafka${n}:999${n}`;
        fs.writeFileSync(
          path.resolve(
            process.cwd(),
            downloadDir,
            `jmx/jmxConfigKafka${n}.yml`
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
