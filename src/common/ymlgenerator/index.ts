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
  _ports_,
} from './constants';
import { KafkaConfig } from 'kafkajs';

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
      setup.dBSetup = createDB(db);
      console.log(`dataSetup= ${JSON.stringify(setup.dBSetup)}`);
      // sink //TODO make and call createSink() method
      if (sink?.name === 'jupyter') YAML.services.jupyter = JUPYTER;
      if (sink?.name === 'spark') YAML.services.spark = SPARK;
      // prometheus
      YAML.services.prometheus = {
        ...PROMETHEUS,
        ports: [
          `${prometheus?.port ?? _ports_.prometheus.external}:${
            _ports_.prometheus.internal
          }`,
        ],
      };
      // grafana
      YAML.services.grafana = {
        ...GRAFANA,
        ports: [
          `${grafana?.port ?? _ports_.grafana.external}:${
            _ports_.grafana.internal
          }`,
        ],
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
    if (db?.name === 'postgresql') {
      dependencies.push(db.name);
      YAML.services.postgresql = {
        ...POSTGRES,
        ports: [`${db.port}:${_ports_.postgresql.internal}`],
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
    } else if (db?.name === 'ksql') {
      YAML.services.ksql = {
        ...KSQL,
        ports: [`${db.port}:${_ports_.ksql.internal}`],
        environment: {
          ...KSQL.environment,
          KSQL_LISTENERS: `http://${network}:${db.port}`,
          KSQL_KSQL_SCHEMA_REGISTRY_URL: `http://schema-registry:${
            db.ksql?.schema_port ?? _ports_.ksql_schema.internal //TODO revisit/test
          }`,
        },
      };
      YAML.services.ksql_schema = {
        ...KSQL_SCHEMA,
        ports: [
          `${db.ksql?.schema_port ?? _ports_.ksql_schema.external}:${
            _ports_.ksql_schema.internal
          }`,
        ],
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
    zkClients: string;
    zkPeers: string;
  } {
    console.log('creating zookeepers...');
    const numOfZKs = kafka.zookeepers.size > 1 ? kafka.zookeepers.size : 1;
    // get server list
    const name = (x: number) => `zookeeper${x}`;

    const getZKServerPorts: () => {
      zkClients: string;
      zkPeers: string;
    } = () => {
      let zkClients: string = '';
      let zkPeers: string = '';
      const getPeerPort: (x: number) => string = (x) => {
        if (
          kafka.zookeepers.ports !== undefined &&
          kafka.zookeepers.ports.peer !== undefined
        )
          return `${kafka.zookeepers.ports.peer.external}:${kafka.zookeepers.ports.peer.internal};`;
        return `${x + 1}${_ports_.zookeeper.peer.external}:${x + 1}${
          _ports_.zookeeper.peer.internal
        };`;
      };
      const getClientPort: (x: number) => string = (x) => {
        if (
          kafka.zookeepers.ports !== undefined &&
          kafka.zookeepers.ports.client[x] !== undefined
        )
          return kafka.zookeepers.ports.client[x] + ',';
        return `${x + 1}${_ports_.zookeeper.client.external},`;
      };
      for (let i: number = 0; i < numOfZKs; i++) {
        zkClients += `${name(i + 1)}:${getClientPort(i)}`;
        zkPeers += `${name(i + 1)}:${getPeerPort(i)}`;
      }
      zkClients = zkClients.slice(0, -1);
      zkPeers = zkPeers.slice(0, -1);
      return { zkClients, zkPeers };
    };

    const servers = getZKServerPorts();
    // construct zookeepers
    for (let i = 0; i < numOfZKs; i++) {
      const n = i + 1;
      const name = `zookeeper${n}`;
      let cport = 10000 * n + _ports_.zookeeper.client.external;
      if (
        kafka.zookeepers.ports?.client !== undefined &&
        kafka.zookeepers.ports.client[i] !== undefined
      ) {
        cport = kafka.zookeepers.ports.client[i];
      }

      YAML.services[name] = {
        ...ZOOKEEPER,
        environment: {
          ...ZOOKEEPER.environment,
          ZOOKEEPER_SERVER_ID: n,
          ZOOKEEPER_CLIENT_PORT: cport,
          ZOOKEEPER_SERVERS: servers.zkPeers,
        },
        ports: [`${cport}:${_ports_.zookeeper.client.internal}`],
        container_name: name,
      };
      // update the schema with the zk info
      if (YAML.services.ksql_schema !== undefined) {
        YAML.services.ksql_schema.depends_on?.push(name);
        YAML.services.ksql_schema.environment.SCHEMA_REGISTRY_KAFKASTORE_CONNECTION_URL += `${name}:${_ports_.zookeeper.client.internal},`; //last comma may be an issue?
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
    servers: { zkClients: string; zkPeers: string }
  ) {
    console.log('creating brokers...');
    const jmxExporterConfig: any = yaml.load(
      fs.readFileSync(
        path.resolve(downloadDir, 'jmx/exporter/template.yml'),
        'utf8'
      )
    );

    const springBSServers = [];
    const springDeps = [];
    for (let i = 0; i < kafka.brokers.size; i++) {
      const n = i + 1;
      // JMX Config:
      let jmxPort = _ports_.jmx.internal + n;
      const jmxName = `jmx-kafka${n}`;
      if (kafka.jmx !== undefined && kafka.jmx.ports[i] !== undefined) {
        jmxPort = kafka.jmx.ports[i];
      }
      // update YAML service
      YAML.services[jmxName] = {
        ...JMX,
        command: [`${_ports_.jmx.internal}`, '/etc/myconfig.yml'], // set the port for the service
        ports: [`${jmxPort}:${_ports_.jmx.internal}`],
        environment: {
          ...JMX.environment,
          SERVICE_PORT: _ports_.jmx.internal,
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
      let extPort = _ports_.kafka.broker.external + i;
      if (
        kafka.brokers.ports !== undefined &&
        kafka.brokers.ports.brokers !== undefined &&
        kafka.brokers.ports.brokers[i] !== undefined
      )
        extPort = kafka.brokers.ports.brokers[i];
      // metrics reporter port
      let metricsPort = _ports_.kafka.metrics;
      if (
        kafka.brokers.ports !== undefined &&
        kafka.brokers.ports.metrics !== undefined
      )
        metricsPort = kafka.brokers.ports.metrics;
      springBSServers.push(`${brokerName}:${_ports_.kafka.spring}`);
      // jmx host port
      let jmxHostPort = _ports_.kafka.jmx + i;
      if (
        kafka.brokers.ports !== undefined &&
        kafka.brokers.ports.jmx !== undefined &&
        kafka.brokers.ports.jmx[i] !== undefined
      )
        jmxHostPort = kafka.brokers.ports.jmx[i];
      // broker id
      let brokerID = 101 + i;
      if (kafka.brokers.id !== undefined && kafka.brokers.id[i] !== undefined)
        brokerID = kafka.brokers.id[i];
      // update YAML service
      YAML.services[brokerName] = {
        ...KAFKA_BROKER,
        ports: [`${extPort}:${_ports_.kafka.broker.internal}`],
        container_name: brokerName,
        environment: {
          ...KAFKA_BROKER.environment,
          KAFKA_BROKER_ID: brokerID,
          KAFKA_JMX_PORT: jmxHostPort,
          // KAFKA_LISTENERS: `EXTERNAL://:${extPort}`,
          KAFKA_LISTENERS: `METRICS://:${metricsPort},PLAINTEXT://:${extPort},INTERNAL://:${_ports_.kafka.spring}`,
          KAFKA_ADVERTISED_LISTENERS: `METRICS://${brokerName}:${metricsPort},PLAINTEXT://${network}:${extPort},INTERNAL://${brokerName}:${_ports_.kafka.spring}`,
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR:
            (kafka.brokers.replicas ?? 1) > kafka.brokers.size
              ? kafka.brokers.size
              : kafka.brokers.replicas ?? 1,
          KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR:
            (kafka.brokers.replicas ?? 1) > kafka.brokers.size
              ? kafka.brokers.size
              : kafka.brokers.replicas ?? 1,
          CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: `${brokerName}:${metricsPort}`,
          KAFKA_ZOOKEEPER_CONNECT: servers.zkClients,
          CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: servers.zkClients,
        },
        depends_on: dependencies,
      };
      // requires port forwarding on host computer
      setup.kafkaSetup.brokers.push(`${network}:${extPort}`);

      PROMCONFIG.scrape_configs[0].static_configs[0].targets.push(
        `${jmxName}:${_ports_.jmx.internal}`
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
      ports: [
        `${kafka.spring?.port ?? _ports_.spring.external}:${
          _ports_.spring.external
        }`,
      ],
      environment: {
        ...SPRING.environment,
        'SPRING_KAFKA_BOOTSTRAP-SERVERS': springBSServers.join(','),
        'SPRING_KAFKA_CONSUMER_BOOTSTRAP-SERVERS': springBSServers.join(','),
        'SPRING_KAFKA_PRODUCER_BOOTSTRAP-SERVERS': springBSServers.join(','),
      },
      depends_on: springDeps,
    };
  }
};

export default ymlGenerator;
