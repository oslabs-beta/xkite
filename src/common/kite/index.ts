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
  serverConfig!: KiteConfigFile | Error;
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
  private constructor(arg?: any[]) {
    if (arg === undefined) {
      this.configLocal(Kite.defaultCfg);
    } else {
      const type = typeof arg;
      switch (type) {
        case 'string':
          this.configServer(arg);
          break;
        case 'object':
          this.configLocal(arg);
          break;
      }
    }
  }

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
  private configServer(server: any) {
    this.server = server;
    this.state = KiteState.Init;
    this.serverState = KiteServerState.Disconnected;
    Promise.all([fetch(`${server}/getConfig`), fetch(`${server}/getSetup`)])
      .then((resp) => resp.map((elem) => elem.json()))
      .then((results) => {
        [this.config, this.setup] = [
          <KiteConfig>(<unknown>results[0]),
          <KiteSetup>(<unknown>results[1]),
        ];
        this.state = KiteState.Configured;
        this.serverState = KiteServerState.Connected;
      })
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
   * @param {string} server
   * the server string of a remote Kite
   * instance for connection.
   * @param {any} arg
   * either the configuration object or
   * the address of kite server instance
   * for remote or local setup.
   */
  private configLocal(config: any) {
    this.config = config;
    this.state = KiteState.Init;
    this.serverState = KiteServerState.Disconnected;
    // create config + setup
    try {
      const generate: Function = ymlGenerator();
      this.setup = generate(config);
      zipper.sync
        .zip(Kite.downloadDir)
        .compress()
        .save(path.resolve(Kite.downloadDir, 'pipeline.zip'));
      this.state = KiteState.Configured;
    } catch (err) {
      console.log(`KITE failed to initialize: ${err}\nConfiguration ${config}`);
    }
  }

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
   * if kite server not active.
   *
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
   *
   */
  public static async deploy(arg?: any) {
    const kite = this.getInstance(arg);
    // if server active deployment happens there...
    if (kite.serverState === KiteServerState.Connected) return;

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
   * @returns {KiteConfigFile | Error }
   *
   * the header content and the
   * file stream for transmission.
   * Use case: const kite = new Kite();
   * const configObj = kite.getConfig();
   * res.writeHead(200, configObj.header);
   * configObj.fileStream.pipe(res);
   */
  public static getConfig(): KiteConfigFile | Error {
    const kite = this.getInstance();
    if (kite.serverState === KiteServerState.Connected) {
      this.getConfigFromServer();
    } else {
      this.getConfigFromLocal();
    }
    return kite.serverConfig;
  }

  private static async getConfigFromServer() {
    const kite = this.getInstance();
    fetch(`${kite.server}/getConfig`, {
      headers: { Accept: 'application/json' },
    })
      .then((resp) => resp.json())
      .then((data) => (kite.serverConfig = data))
      .catch((err) => {
        console.log(`failed to get configFile from ${kite.server}:\n${err}`);
        kite.serverConfig = new Error(
          `failed to get configFile from ${kite.server}`
        );
      });
  }

  private static async getConfigFromLocal() {
    const stat = fs.statSync(Kite.configPath);
    const header = {
      'Content-Type': 'text/yml',
      'Content-Length': stat.size,
    };
    const fileStream = fs.createReadStream(Kite.configPath);
    return { header, fileStream };
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
    try {
      if (kite.serverState === KiteServerState.Connected) {
        await fetch(`${kite.server}/disconnect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ disconnect: true }),
        });
      } else {
        await compose.down({
          cwd: Kite.downloadDir,
          log: true,
        });
      }
      kite.state = KiteState.Shutdown;
    } catch (err) {
      console.log(`Could not shutdown docker instances:\n${err}`);
    }
  }
}
