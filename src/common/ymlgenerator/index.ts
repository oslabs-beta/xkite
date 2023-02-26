import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';
const network = 'localhost'; //change to 0.0.0.0 to expose ports globally
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

  const JMX: JMXConfg = {
    image: 'bitnami/jmx-exporter:latest',
    environment: { SERVICE_PORT: 5556 },
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
      ZOOKEEPER_SERVERS: '',
    },
    ports: ['2182:2182'],
    container_name: 'zookeeper',
  };

  const PROMETHEUS: PrometheusConfig = {
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
      'provisioning:/etc/grafana/provisioning',
      'dashboards:/var/lib/grafana/dashboards',
    ],
    container_name: 'grafana',
    depends_on: ['prometheus'],
  };

  const POSTGRES: PGConfig = {
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

  const KSQL: KSQLConfig = {
    image: 'confluentinc/ksqldb-server',
    environment: {
      KSQL_BOOTSTRAP_SERVERS: '', //kafka1:9092,kafka2:9093, ...
      KSQL_LISTENERS: '',
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
    ports: [],
    container_name: 'ksql',
    depends_on: ['kafka'],
  };

  // # Schema Registry
  const KSQL_SCHEMA: KSQLSchemaCfg = {
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
      `${path.join(downloadDir, 'spring/app.jar')}:/app.jar`,
      `${path.join(downloadDir, 'spring/application.yml')}:/etc/myconfig.yml`,
    ],
    container_name: 'spring',
    depends_on: ['kafka1'],
  };

  const YAML: YAMLConfig = {
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
  const dependencies: string[] = [];
  const setup: KiteSetup = {
    kafkaSetup: {
      clientId: '',
      brokers: [],
      ssl: false,
    },
  };

  return (config: KiteConfig): KiteSetup => {
    console.log('creating Kite Config yml...');
    const { kafka, db, sink, grafana, prometheus } = config;

    try {
      // database
      setup.dataSetup = createDB(db);
      // sink
      if (sink?.name === 'jupyter') YAML.services.jupyter = JUPYTER;
      if (sink?.name === 'spark') YAML.services.spark = SPARK;
      // prometheus
      YAML.services.prometheus = {
        ...PROMETHEUS,
        ports: [`${prometheus?.port ?? 9099}:9090`],
      };
      // grafana
      YAML.services.grafana = {
        ...GRAFANA,
        ports: [`${grafana?.port ?? 3050}:3000`],
      };
      // Checks if directories download, prometheus and jmx exist, if not, then it creates all of them
      fs.ensureDirSync(downloadDir);
      fs.ensureDirSync(path.resolve(downloadDir, 'jmx'));
      fs.ensureDirSync(path.resolve(downloadDir, 'prometheus'));

      const servers = createZooKeepers(kafka);
      createBrokers(kafka, servers);

      fs.writeFileSync(
        path.resolve(downloadDir, 'docker-compose.yml'),
        yaml.dump(YAML, { noRefs: true })
      );

      if (prometheus !== undefined) {
        PROMCONFIG.global.scrape_interval = `${prometheus.scrape_interval}s`;
        PROMCONFIG.global.scrape_timeout =
          prometheus.scrape_interval - 1 <= 0
            ? '1s'
            : `${prometheus.scrape_interval - 1}s`;
        PROMCONFIG.global.evaluation_interval = `${prometheus.evaluation_interval}s`;
      }

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

  function createDB(db?: dbCfg): PGConfig | KSQLConfig | undefined {
    if (db === undefined) return;
    if (db?.dataSource === 'postgresql') {
      dependencies.push(db.dataSource);
      YAML.services.postgresql = {
        ...POSTGRES,
        ports: [`${db.port}:5432`],
        environment: {
          ...POSTGRES.environment,
          POSTGRES_USER: db.postgresql?.username ?? 'admin',
          POSTGRES_PASSWORD: db.postgresql?.password ?? 'admin',
          POSTGRES_DB: db.postgresql?.dbname ?? 'xkiteDB',
        },
      };
      YAML.volumes = {
        ...YAML.volumes,
        postgresql: {
          driver: 'local',
        },
      };
      return YAML.services.postgresql;
    } else if (db?.dataSource === 'ksql') {
      YAML.services.ksql = {
        ...KSQL,
        ports: [`${db.port}:8088`],
        environment: {
          ...KSQL.environment,
          KSQL_KSQL_SCHEMA_REGISTRY_URL: `http://schema-registry:${
            db.ksql?.schema_port ?? 8085
          }`,
        },
      };
      YAML.services.ksql_schema = {
        ...KSQL_SCHEMA,
        ports: [`${db.ksql?.schema_port ?? 8085}:8085`],
      };
      return YAML.services.ksql;
    }
  }

  function createZooKeepers(kafka: KiteKafkaCfg) {
    console.log('creating zookeepers...');
    const numOfZKs = kafka.zookeepers.size > 1 ? kafka.zookeepers.size : 1;
    // get server list
    const internalPort = 2181;
    const name = (x: number) => `zookeeper${x}`;

    const getZKServerPorts: () => {
      zkServer: string;
      zkClients: string;
    } = () => {
      let zkServer: string = '';
      let zkClients: string = '';
      const getServerPort: (x: number) => string = (x) => {
        if (
          kafka.zookeepers.server_ports !== undefined &&
          kafka.zookeepers.election_ports !== undefined
        )
          return `${kafka.zookeepers.server_ports[x]}:${kafka.zookeepers.election_ports[x]};`;
        return `${x + 1}2888:${x + 1}3888;`;
      };
      const getClientPort: (x: number) => string = (x) => {
        if (kafka.zookeepers.client_ports !== undefined)
          return kafka.zookeepers.client_ports[x] + ',';
        return `${x + 1}${internalPort},`;
      };
      for (let i: number = 0; i < numOfZKs; i++) {
        zkServer += `${name(i + 1)}:${getServerPort(i)}`;
        zkClients += `${name(i + 1)}:${getClientPort(i)}`;
      }
      zkServer = zkServer.slice(0, -1);
      zkClients = zkClients.slice(0, -1);
      return { zkServer, zkClients };
    };

    const servers = getZKServerPorts();
    // construct zookeepers
    for (let i = 0; i < numOfZKs; i++) {
      const n = i + 1;
      const name = `zookeeper${n}`;
      let cport = 10000 * n + internalPort;
      if (kafka.zookeepers.client_ports !== undefined) {
        cport = kafka.zookeepers.client_ports[i];
      }

      YAML.services[name] = {
        ...ZOOKEEPER,
        environment: {
          ...ZOOKEEPER.environment,
          ZOOKEEPER_SERVER_ID: n,
          ZOOKEEPER_CLIENT_PORT: cport,
          ZOOKEEPER_SERVERS: servers.zkServer,
        },
        ports: [`${cport}:${internalPort}`],
        container_name: name,
      };
      // update the schema with the zk info
      if (YAML.services.ksql_schema !== undefined) {
        YAML.services.ksql_schema.depends_on?.push(name);
        YAML.services.ksql_schema.environment.SCHEMA_REGISTRY_KAFKASTORE_CONNECTION_URL += `${name}:2181,`; //last comma may be an issue?
      }
      dependencies.push(name);
    }
    return servers;
  }

  function createBrokers(
    kafka: KiteKafkaCfg,
    servers: { zkServer: string; zkClients: string }
  ) {
    console.log('creating brokers...');
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
      // JMX Config:
      let jmxInternalPort = 5556;
      let jmxPort = jmxInternalPort + n;
      const jmxName = `jmx-kafka${n}`;
      if (kafka.jmx !== undefined) {
        jmxPort = kafka.jmx.if_ports[i];
        jmxInternalPort = kafka.jmx.port;
      }
      // update YAML service
      YAML.services[jmxName] = {
        ...JMX,
        command: [`${jmxInternalPort}`, '/etc/myconfig.yml'], // set the port for the service
        ports: [`${jmxPort}:${jmxInternalPort}`],
        environment: {
          ...JMX.environment,
          SERVICE_PORT: jmxInternalPort,
        },
        container_name: jmxName,
        volumes: [
          `${path.join(
            downloadDir,
            `/jmx/jmxConfigKafka${n}.yml`
          )}:/etc/myconfig.yml`,
        ],
        depends_on: [`kafka${n}`],
      };
      // Kafka Config:
      const brokerName = `kafka${n}`;
      // broker ports
      let mainPort = 9090 + n;
      if (kafka.brokers.ports !== undefined) mainPort = kafka.brokers.ports[i];
      // metrics reporter port
      const metricsPort: number = kafka.brokers.metrics_port ?? 29092;
      bootstrapServers.push(`${brokerName}:${mainPort}`);
      // jmx host port
      let jmxHostPort = 9990 + n;
      if (kafka.brokers.jmx_port !== undefined)
        jmxHostPort = kafka.brokers.jmx_port[i];
      // broker id
      let brokerID = 101 + i;
      if (kafka.brokers.id !== undefined) brokerID = kafka.brokers.id[i];
      // update YAML service
      YAML.services[brokerName] = {
        ...KAFKA_BROKER,
        ports: [`${mainPort}:9092`],
        container_name: brokerName,
        environment: {
          ...KAFKA_BROKER.environment,
          KAFKA_BROKER_ID: brokerID,
          KAFKA_JMX_PORT: jmxHostPort,
          KAFKA_ADVERTISED_LISTENERS: `PLAINTEXT://${brokerName}:${metricsPort},PLAINTEXT_HOST://${network}:${mainPort}`,
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: kafka.brokers.replicas ?? 1,
          KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR:
            kafka.brokers.replicas ?? 1,
          CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: `${brokerName}:${metricsPort}`,
          KAFKA_ZOOKEEPER_CONNECT: servers.zkClients,
          CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: servers.zkClients,
        },
        depends_on: dependencies,
      };
      // requires port forwarding on host computer
      setup.kafkaSetup.brokers.push(`${network}:${mainPort}`);

      PROMCONFIG.scrape_configs[0].static_configs[0].targets.push(
        `${jmxName}:${jmxInternalPort}`
      );

      jmxExporterConfig.hostPort = `kafka${n}:${jmxHostPort}`;
      fs.writeFileSync(
        path.resolve(downloadDir, `jmx/jmxConfigKafka${n}.yml`),
        yaml.dump(jmxExporterConfig, { noRefs: true })
      );
      // build dependencies
      springDeps.push(brokerName);
    }
    // set kqsl bootstrap servers
    if (YAML.services.ksql !== undefined) {
      YAML.services.ksql = {
        ...YAML.services.ksql,
        environment: {
          ...YAML.services.ksql.environment,
          KSQL_BOOTSTRAP_SERVERS: bootstrapServers.join(','),
        },
      };
    }
    YAML.services.spring = {
      ...SPRING,
      ports: [`${kafka.spring?.port ?? 8080}:8080`],
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
