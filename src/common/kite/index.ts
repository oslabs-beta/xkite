import path from 'path';
import fs from 'fs-extra';
import compose from 'docker-compose';
import ymlGenerator from '../ymlgenerator';
import zipper from 'zip-local';

// const defaultServer = 'localhost:6661';

// simple prog for CLI:
// const kite = new Kite({numOfCluster:arg[2], dataSource:arg[3], sink:arg[4]})
// kite.deploy()
//

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

// export abstract class KiteInstances {
//   public static
// }

export default class Kite {
  private static instance: Kite; //make a singleton
  static downloadDir: string = path.join(
    process.cwd(),
    'src/common/kite/download'
  );
  static configPath: string = path.join(Kite.downloadDir, 'docker-compose.yml');

  static defaultCfg: KiteConfig = {
    numOfClusters: 2,
    dataSource: 'postgresql',
    sink: 'jupyter',
  };

  // parameter types
  config!: KiteConfig;
  server?: string;
  setup!: KiteSetup;
  state!: KiteState;
  serverState!: KiteServerState;
  configFile!: KiteConfigFile;
  /**
   * @param {KiteConfig} config
   * takes the configuration
   * for KITE standalone servers
   * and generates the YAML configuration
   * file locally.
   * @param {string} server
   * the server string of a remote Kite
   * instance for connection.
   * @param {any} arg
   * either the configuration object or
   * the address of kite server instance
   * for remote or local setup.
   */
  private constructor(arg?: any) {
    if (arg === undefined) {
      this.configLocal(Kite.defaultCfg);
    } else {
      const type = typeof arg;
      switch (type) {
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
  private configServer(server: any) {
    this.server = server;
    this.state = KiteState.Init;
    this.serverState = KiteServerState.Disconnected;
    Promise.all([
      fetch(`${server}/getConfig`),
      fetch(`${server}/getSetup`),
      fetch(`${server}/getConfigFile`),
    ])
      .then((resp) => resp.map((elem) => elem.json()))
      .then((results) => {
        [this.config, this.setup, this.configFile] = [
          <KiteConfig>(<unknown>results[0]),
          <KiteSetup>(<unknown>results[1]),
          <KiteConfigFile>(<unknown>results[2]),
        ];
        this.state = KiteState.Configured;
        this.serverState = KiteServerState.Connected;
      })
      .then((data) => {})
      .catch((err) => {
        console.log(`error fetching from ${this.server}:\n${err}`);
      });
  }

  /**
   * @param {KiteConfig} config
   * takes the configuration
   * for KITE standalone servers
   * and generates the YAML configuration
   * file locally.
   */
  private configLocal(config: any) {
    this.config = config;
    this.state = KiteState.Init;
    this.serverState = KiteServerState.Disconnected;
    // create config + setup
    try {
      // generate the docker config
      const generate: Function = ymlGenerator();
      this.setup = generate(config);
      // package the download
      zipper.sync
        .zip(Kite.downloadDir)
        .compress()
        .save(path.resolve(Kite.downloadDir, 'pipeline.zip'));
      // store the config file
      const header = {
        'Content-Type': 'text/yml',
        'Content-Length': fs.statSync(Kite.configPath).size,
      };
      const fileStream = fs.createReadStream(Kite.configPath);
      this.configFile = { header, fileStream };
      this.state = KiteState.Configured;
    } catch (err) {
      console.log(`KITE failed to initialize: ${err}\nConfiguration ${config}`);
    }
  }

  /**
   * @param {any} arg
   * either the configuration object or
   * the address of kite server instance
   * for remote or local setup.
   */
  public static configure(arg: any) {
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
  public static getInstance(arg?: any): Kite {
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
    const kite = this.getInstance(arg);
    // if server active deployment happens there...
    if (kite.serverState === KiteServerState.Connected) {
      await this.deployServer();
    } else {
      await this.deployLocal();
      // insert call to monitor library here
    }
  }

  /**
   * requests the remote server
   * to deploy docker.
   */
  private static async deployServer() {
    const kite = this.getInstance();
    try {
      await fetch(`${kite.server}/deploy`);
      kite.state = KiteState.Running;
    } catch (err) {
      console.log(`Kite deployment failed:\n${err}`);
    }
  }

  /**
   * deploys docker locally
   */
  private static async deployLocal() {
    const kite = this.getInstance();
    try {
      await compose.upAll({
        cwd: Kite.downloadDir,
        log: true,
      });
      kite.state = KiteState.Running;
    } catch (err) {
      console.log(`Kite deployment failed:\n${err}`);
    }
  }

  /**
   * @returns {KiteSetup}
   * setup to be used for connecting
   * to a kafka instance and/or database.
   */
  public static getSetup(): KiteSetup {
    return this.getInstance().setup;
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
  public static getConfig(): KiteConfigFile {
    const kite = this.getInstance();
    return kite.configFile;
  }

  /**
   *
   * @returns state of the Kite Application
   */
  public static getKiteState(): KiteState {
    return this.getInstance().state;
  }

  /**
   *
   * @returns state of Kite Server
   */
  public static getKiteServerState(): KiteServerState {
    return this.getInstance().serverState;
  }

  /**
   * If the kite server isn't running
   * invokes the docker-compose
   * down method directly. Otherwise
   * makes a request to shutdown remotely.
   */
  public static async disconnect() {
    const kite = this.getInstance();
    if (kite.serverState === KiteServerState.Connected) {
      await this.disconnectServer();
      kite.serverState = KiteServerState.Disconnected; //should this be done?
    } else {
      await this.disconnectLocal();
    }
    kite.state = KiteState.Shutdown;
  }

  /**
   * disconnects from the remote server instance
   */
  private static async disconnectServer() {
    try {
      await fetch(`${this.getInstance().server}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ disconnect: true }),
      });
    } catch (err) {
      console.log(`Could not shutdown docker instances on server:\n${err}`);
    }
  }

  /**
   * disconnects from the local instance
   */
  private static async disconnectLocal() {
    try {
      await compose.down({
        cwd: Kite.downloadDir,
        log: true,
      });
    } catch (err) {
      console.log(`Could not shutdown docker instances on local:\n${err}`);
    }
  }
}
