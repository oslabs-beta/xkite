import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';
import {
  YAML,
  SPRING,
  SPARK,
  JUPYTER,
  KSQL_SCHEMA,
  KSQL,
  POSTGRES,
  GRAFANA,
  PROMETHEUS,
  ZOOKEEPER,
  KAFKA_BROKER,
  JMX,
  PROMCONFIG,
  downloadDir,
  network,
} from './constants';

const dependencies: string[] = [];
const setup: KiteSetup = {
  kafkaSetup: {
    clientId: '',
    brokers: [],
    ssl: false,
  },
};
/**
 * creates the pertinent yml configuration for docker
 * based on the input config
 * @returns a yaml generator function
 */
const ymlGenerator: () => (c: KiteConfig) => KiteSetup = () => {
  /**
   * creates the pertinent yml configuration for docker
   * based on the input config
   * @param config
   * @returns KiteSetup for use in Kite instance.
   */
  return (config: KiteConfig): KiteSetup => {
    console.log('creating Kite Config yml...');
    const { kafka, db, sink, grafana, prometheus } = config;

    try {
      // database
      setup.dataSetup = createDB(db);
      console.log(`dataSetup= ${JSON.stringify(setup.dataSetup)}`);
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

  /**
   * creates either a PSQL or KSQL database containers
   * based on the db config passed in.
   * @param db
   * @returns the database configuration if one is
   * configured from the yamlGeneration.
   */
  function createDB(db?: dbCfg): dbCfg | undefined {
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
    } else if (db?.dataSource === 'ksql') {
      YAML.services.ksql = {
        ...KSQL,
        ports: [`${db.port}:8088`],
        environment: {
          ...KSQL.environment,
          KSQL_LISTENERS: `http://${network}:${db.port}`,
          KSQL_KSQL_SCHEMA_REGISTRY_URL: `http://schema-registry:${
            db.ksql?.schema_port ?? 8085
          }`,
        },
      };
      YAML.services.ksql_schema = {
        ...KSQL_SCHEMA,
        ports: [`${db.ksql?.schema_port ?? 8085}:8085`],
      };
    }
    return db;
  }

  /**
   * Creates the zookeeper configurations
   * and updates ksql config which relies
   * on the zookeeper.
   *
   * @param kafka
   * @returns object which contains the
   * zookeeper server and client ports
   * for use in other setups reliant on
   * zookeeper (kafka).
   */
  function createZooKeepers(kafka: KiteKafkaCfg): {
    zkServer: string;
    zkClients: string;
  } {
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

  /**
   * Create docker configs for broker related images
   * updates the ksql and spring containers which
   * depend on the kafka brokers.
   * Creates the kafka and JMX configurations.
   * @param kafka
   * @param servers
   *
   */
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

      // set kqsl bootstrap servers
      if (YAML.services.ksql !== undefined)
        YAML.services.ksql.environment.KSQL_BOOTSTRAP_SERVERS += `${brokerName}:29192,`;
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
};

export default ymlGenerator;
