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

  const SPRING: SpringCfg = {
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
      `${downloadDir}/spring/app.jar:/app.jar`,
      `${downloadDir}/spring/application.yml:/etc/myconfig.yml`,
    ],
    container_name: 'spring',
    depends_on: ['kafka1'],
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
        clientId: '',
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

      // Checks if directories download, prometheus and jmx exist, if not, then it creates all of them
      fs.ensureDirSync(downloadDir);
      fs.ensureDirSync(path.resolve(downloadDir, 'jmx'));
      fs.ensureDirSync(path.resolve(downloadDir, 'prometheus'));
      // const ipAddr = 'localhost'; //getIPAddress()();

      const servers = createZooKeepers(kafka, dependencies);
      createBrokers(kafka, dependencies, servers, setup);

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

  function createZooKeepers(kafka: KiteKafkaCfg, deps: string[]) {
    const numOfZKs = kafka.zookeepers.size > 1 ? kafka.zookeepers.size : 1;
    // get server list
    const servers = (() => {
      let zkServer = '';
      let zkClients = '';
      const cport = 2181;
      const name = (x: number) => `zookeeper${x}`;
      const sPort = (x: number) => `${x}2888:${x}3888;`;

      for (let i = 0; i < numOfZKs; i++) {
        zkServer += `${name(i + 1)}:`;
        if (kafka.zookeepers.server_ports !== undefined)
          zkServer += kafka.zookeepers.server_ports[i] + ';';
        else zkServer += `${sPort(i + 1)}`;

        zkClients += `${name(i + 1)}:`;
        if (kafka.zookeepers.client_ports !== undefined)
          zkClients += kafka.zookeepers.client_ports[i] + ',';
        else zkClients += `${i + 1}${cport},`;
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
      deps.push(name);
    }
    return servers;
  }

  function createBrokers(
    kafka: KiteKafkaCfg,
    deps: string[],
    servers: { zkServer: string; zkClients: string },
    setup: KiteSetup
  ) {
    const jmxExporterConfig: any = yaml.load(
      fs.readFileSync(
        path.resolve(downloadDir, 'jmx/exporter/template.yml'),
        'utf8'
      )
    );

    const bootstrapServers = [];
    const springDeps = [];
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
      let ports: string[] = [`909${n}:909${n}`, `999${n}:999${n}`];
      if (kafka.brokers.ports !== undefined)
        ports = kafka.brokers.ports[i].split(',') ?? [kafka.brokers.ports[i]];
      const mainPort = ports[0].split(':')[0];
      const name = `kafka${n}`;
      springDeps.push(name);
      const metricsPort = kafka.brokers.metrics_port ?? 29092;
      bootstrapServers.push(`${name}:${mainPort}`);
      const jmxPort = kafka.jmx?.port[i] ?? 9991 + i;
      YAML.services[name] = {
        ...KAFKA_BROKER,
        ports,
        container_name: name,
        environment: {
          ...KAFKA_BROKER.environment,
          KAFKA_BROKER_ID: 101 + i,
          KAFKA_JMX_PORT: jmxPort,
          KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://${name}:${metricsPort},PLAINTEXT_HOST://localhost:${mainPort}`,
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: kafka.brokers.replicas ?? 1,
          KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR:
            kafka.brokers.replicas ?? 1,
          CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: `${name}:${metricsPort}`,
          KAFKA_ZOOKEEPER_CONNECT: servers.zkClients,
          CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: servers.zkClients,
        },
        depends_on: deps,
      };
      // requires port forwarding on host computer
      setup.kafkaSetup.brokers.push(`localhost:${mainPort}`);

      PROMCONFIG.scrape_configs[0].static_configs[0].targets.push(
        `jmx-kafka${n}:5566`
      );

      jmxExporterConfig.hostPort = `kafka${n}:999${n}`;
      fs.writeFileSync(
        path.resolve(process.cwd(), downloadDir, `jmx/jmxConfigKafka${n}.yml`),
        yaml.dump(jmxExporterConfig, { noRefs: true })
      );
    }
    YAML.services.spring = {
      ...SPRING,
      // ports: ['8080:8080'],
      environment: {
        ...SPRING.environment,
        'SPRING_KAFKA_BOOTSTRAP-SERVERS': bootstrapServers.join(','),
        'SPRING_KAFKA_CONSUMER_BOOTSTRAP-SERVERS': bootstrapServers.join(','),
        'SPRING_KAFKA_PRODUCER_BOOTSTRAP-SERVERS': bootstrapServers.join(','),
      },
      depends_on: springDeps,
    };
  }
}
