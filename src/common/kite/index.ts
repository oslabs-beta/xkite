import path from 'path';
import fs from 'fs-extra';
import compose from 'docker-compose';
import ymlGenerator from '@/common/ymlgenerator';
import zipper from 'zip-local';
import Monitor from '@/common/monitor/monitor';
import defaultCfg from './constants';

enum KiteState {
  Init,
  Configured,
  Running,
  Shutdown,
}

enum KiteServerState {
  Disconnected,
  Connected,
}

export default class Kite {
  private static instance: Kite; //make a singleton
  static downloadDir: string = path.join(
    process.cwd(),
    'src/common/kite/download'
  );
  static configPath: string = path.join(Kite.downloadDir, 'docker-compose.yml');

  public static defaultCfg: KiteConfig = defaultCfg;
  // parameter types
  config!: Promise<KiteConfig> | KiteConfig;
  server?: string;
  setup!: Promise<KiteSetup> | KiteSetup;
  state!: KiteState;
  serverState!: KiteServerState;
  configFile!: Promise<KiteConfigFile> | KiteConfigFile;
  kafkaSetup!: Promise<KafkaSetup> | KafkaSetup
  /**
   * @param {KiteConfig} config
   * takes the configuration
   * for KITE standalone servers
   * and generates the YAML configuration
   * file locally.
   * @param {string} server
   * the server string of a remote Kite
   * instance for connection.
   * @param {string | KiteConfig} arg
   * either the configuration object or
   * the address of kite server instance
   * for remote or local setup.
   */
  private constructor(arg?: string | KiteConfig) {
    if (arg === undefined) {
      this.configLocal(Kite.defaultCfg);
    } else {
      switch (typeof arg) {
        case 'string':
          this.configServer(arg);
          break;
        default:
          this.configLocal(arg);
          break;
      }
    }
  }

  /**
   * Gets the remote server link configuration.
   * @param {string} server
   * the server string of a remote Kite
   * instance for connection.
   */
  private async configServer(server: string) {
    this.server = server;
    this.state = KiteState.Init;
    this.serverState = KiteServerState.Disconnected;

    try {
      this.serverState = KiteServerState.Connected;
      const res = [
        fetch(`${server}/api/kite/getConfig`),
        fetch(`${server}/api/kite/getSetup`),
        fetch(`${server}/api/kite/getConfigFile`),
      ];
      [this.config, this.setup, this.configFile] = res.map(async (r) =>
        (await r).json()
      );
    } catch (err) {
      this.serverState = KiteServerState.Disconnected;
      console.error(`error fetching from ${this.server}/api/:\n${err}`);
    }
  }

  /**
   * @param {KiteConfig} config
   * takes the configuration
   * for KITE standalone servers
   * and generates the YAML configuration
   * file locally.
   */
  private configLocal(config: KiteConfig) {
    this.config = config;
    this.state = KiteState.Init;
    this.serverState = KiteServerState.Disconnected;
    // create config + setup
    try {
      // generate the docker config
      const generate: Function = ymlGenerator();
      this.setup = generate(config);
      this.kafkaSetup = generate(config).kafkaSetup;
      // package the download, comment out or make optional fro time optimization
      zipper.sync
        .zip(Kite.downloadDir)
        .compress()
        .save(path.resolve(Kite.downloadDir, 'pipeline.zip'));
      // store the config file
      const header = {
        'Content-Type': 'text/yml',
        'Content-Length': fs.statSync(Kite.configPath).size,
      };
      const fileStream = fs.readFileSync(Kite.configPath, 'utf-8');
      this.configFile = { header, fileStream };
      this.state = KiteState.Configured;
      console.log('yaml configuration complete...');
    } catch (err) {
      console.error(
        `KITE failed to initialize: ${err}\nConfiguration ${config}`
      );
    }
  }

  /**
   * @param {string | KiteConfig} arg
   * either the configuration object or
   * the address of kite server instance
   * for remote or local setup.
   */
  public static configure(arg: string | KiteConfig) {
    if (!Kite.instance) {
      Kite.instance = new Kite(arg);
    } else {
      switch (typeof arg) {
        case 'string':
          Kite.instance.configServer(arg);
          break;
        default:
          Kite.instance.configLocal(arg);
          break;
      }
    }
  }

  /**
   * @param {any} arg
   * either the configuration object or
   * the address of kite server instance
   * for remote or local setup.
   * @returns
   * the singleton version of Kite
   */
  public static getInstance(arg?: string | KiteConfig): Kite {
    if (!Kite.instance) {
      Kite.instance = new Kite(arg);
    }
    return Kite.instance;
  }

  /**
   * invokes docker-compose
   * locally or on remote server
   *
   * @param {any} arg
   * either the configuration object or
   * the address of kite server instance
   * for remote or local setup.
   *
   */
  public static async deploy(arg?: any) {
    const kite = Kite.getInstance(arg);
    // if server active deployment happens there...
    if (kite.serverState === KiteServerState.Connected) {
      await this.deployServer();
    } else {
      await this.deployLocal();
      Monitor.initiate();
    }
  }

  /**
   * requests the remote server
   * to deploy docker.
   */
  private static async deployServer() {
    const kite = Kite.getInstance();
    try {
      await fetch(`${kite.server}/api/kite/deploy`);
      kite.state = KiteState.Running;
    } catch (err) {
      console.error(`Kite deployment failed:\n${err}`);
    }
  }

  /**
   * deploys docker locally
   */
  private static async deployLocal() {
    const kite = Kite.getInstance();
    try {
      console.log('deploying docker containers...');
      await compose.upAll({
        cwd: Kite.downloadDir,
        log: true,
      });
      kite.state = KiteState.Running;
      console.log('docker deployment successful');
    } catch (err) {
      console.error(`Kite deployment failed:\n${err}`);
    }
  }

  /**
   * @returns {KiteSetup}
   * setup to be used for connecting
   * to a kafka instance and/or database.
   */
  public static getSetup(): Promise<KiteSetup> {
    return new Promise((res) => res(Kite.getInstance().setup));
  }

   /**
   * @returns {KafkaSetup}
   * setup to be used for using kafkaConnector
   * is a substrate of KiteSetup
   */
   public static getKafkaSetup(): Promise<KafkaSetup> {
    return new Promise((res) => res(Kite.getInstance().kafkaSetup));
  }

  /**
   * If connected to kite server, gets the config from the server.
   *
   * @returns {KiteConfig}
   *
   */
  public static getConfig(): Promise<KiteConfig> {
    return new Promise((res) => res(Kite.getInstance().config));
  }

  /**
   * If connected to kite server, gets the config from the server.
   *
   * @returns {KiteConfigFile}
   *
   * the header content and the
   * file stream for transmission.
   * Use case: const kite = new Kite();
   * const configObj = kite.getConfig();
   * res.writeHead(200, configObj.header);
   * configObj.fileStream.pipe(res);
   */
  public static getConfigFile(): Promise<KiteConfigFile> {
    return new Promise((res) => res(Kite.getInstance().configFile));
  }

  /**
   *
   * @returns state of the Kite Application
   */
  public static getKiteState(): KiteState {
    return Kite.getInstance().state;
  }

  /**
   *
   * @returns state of Kite Server
   */
  public static getKiteServerState(): KiteServerState {
    return Kite.getInstance().serverState;
  }

  /**
   * If the kite server isn't running
   * invokes the docker-compose
   * down method directly. Otherwise
   * makes a request to shutdown remotely.
   */
  public static async disconnect(): Promise<any> {
    const kite = Kite.getInstance();
    if (kite.serverState === KiteServerState.Connected) {
      kite.serverState = KiteServerState.Disconnected; //should this be done?
      this.disconnectServer();
    } else {
      this.disconnectLocal();
    }
    kite.state = KiteState.Shutdown;
  }

  /**
   * disconnects from the remote server instance
   */
  private static async disconnectServer() {
    try {
      await fetch(`${Kite.getInstance().server}/api/kite/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ disconnect: true }),
      });
    } catch (err) {
      console.error(`Could not disconnect docker instances on server:\n${err}`);
    }
  }

  /**
   * disconnects from the local instance
   */
  private static async disconnectLocal() {
    try {
      await compose.stop({
        cwd: Kite.downloadDir,
        log: true,
      });
    } catch (err) {
      console.error(`Could not disconnect docker instances on local:\n${err}`);
    }
  }

  /**
   * If the kite server isn't running
   * invokes the docker-compose
   * down method directly. Otherwise
   * makes a request to shutdown remotely.
   */
  public static async shutdown(): Promise<any> {
    const kite = Kite.getInstance();
    if (kite.serverState === KiteServerState.Connected) {
      kite.serverState = KiteServerState.Disconnected; //should this be done?
      this.shutdownServer();
    } else {
      this.shutdownLocal();
    }
    kite.state = KiteState.Shutdown;
  }

  private static async shutdownServer() {
    try {
      await fetch(`${Kite.getInstance().server}/api/kite/shutdown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ disconnect: true }),
      });
    } catch (err) {
      console.error(`Could not shutdown docker instances on server:\n${err}`);
    }
  }

  private static async shutdownLocal() {
    try {
      await compose.down({
        cwd: Kite.downloadDir,
        log: true,
      });
    } catch (err) {
      console.error(`Could not shutdown docker instances on local:\n${err}`);
    }
  }
}
