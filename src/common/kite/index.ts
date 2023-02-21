import path from 'path';
import fs from 'fs-extra';
import compose from 'docker-compose';
import ymlGenerator from '../ymlgenerator';
import zipper from 'zip-local';
const downloadDir = path.join(process.cwd(), 'src/common/kite/download');

const defaultCfg: KiteConfig = {
  numOfClusters: 2,
  dataSource: 'postgresql',
  sink: 'jupyter',
};

const defaultServer = 'localhost:6661'; //TBD

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

export default class Kite {
  config!: KiteConfig;
  configPath!: string;
  setup!: KiteSetup;
  state: KiteState;
  server: string;
  serverState: KiteServerState;
  serverConfig!: KiteConfigFile | Error;
  /**
   * @param {KiteConfig} config
   * takes the configuration
   * for KITE standalone servers
   * and generates the YAML configuration
   * file locally.
   * @param {string} server
   * address of kite server instance
   *
   */
  constructor(config: KiteConfig = defaultCfg, server: string = defaultServer) {
    this.server = server;
    this.state = KiteState.Init;
    this.serverState = KiteServerState.Disconnected;
    this.configPath = path.join(downloadDir, 'docker-compose.yml');
    //check localhost for connection:
    fetch(`${this.server}/getConfig`)
      .then((res) => res.json())
      .then((data) => {
        this.config = data;
        this.serverState = KiteServerState.Connected;
      })
      .catch((err) => {
        console.log(`error getting config from ${this.server}:\n${err}`);
        // use constructor settings
        this.config = JSON.parse(JSON.stringify(config));
      })
      .finally(() => {
        // check localhost for setup
        if (this.serverState === KiteServerState.Connected) {
          fetch(`${this.server}/getSetup`)
            .then((res) => res.json())
            .then((data) => {
              this.setup = data;
              this.state = KiteState.Configured;
            })
            .catch((err) => {
              console.log(`error getting setup from ${this.server}:\n${err}`);
            });
        } else {
          // create config + setup
          try {
            const generate: Function = ymlGenerator();
            this.setup = generate(this.config);
            zipper.sync
              .zip(downloadDir)
              .compress()
              .save(path.resolve(downloadDir, 'pipeline.zip'));
            this.state = KiteState.Configured;
          } catch (err) {
            console.log(
              `KITE failed to initialize: ${err}\nConfiguration ${config}`
            );
          }
        }
      });
  }
  /**
   * invokes docker-compose
   * if kite server not active.
   */
  async deploy() {
    // if server active deployment happens there...
    if (this.serverState === KiteServerState.Connected) return;

    try {
      await compose.upAll({
        cwd: downloadDir,
        log: true,
      });
      this.state = KiteState.Running;
    } catch (err) {
      console.log(`Kite deployment failed:\n${err}`);
    }
  }
  /**
   * @returns {KiteSetup}
   * setup to be used for connecting
   * to a kafka instance and/or database.
   */
  getSetup(): KiteSetup {
    return this.setup;
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
  getConfig(): KiteConfigFile | Error {
    if (this.serverState === KiteServerState.Connected) {
      this.getServerConfig();
      return this.serverConfig;
    } else {
      const stat = fs.statSync(this.configPath);
      const header = {
        'Content-Type': 'text/yml',
        'Content-Length': stat.size,
      };
      const fileStream = fs.createReadStream(this.configPath);
      return { header, fileStream };
    }
  }

  async getServerConfig() {
    try {
      const resp = await fetch(`${this.server}/getConfig`, {
        headers: { Accept: 'application/json' },
      });
      this.serverConfig = await resp.json();
    } catch (err) {
      console.log(`failed to get configFile from ${this.server}:\n${err}`);
      this.serverConfig = new Error(
        `failed to get configFile from ${this.server}`
      );
    }
  }

  /**
   *
   * @returns stae of the Kite Application
   */
  getKiteState(): KiteState {
    return this.state;
  }
  /**
   *
   * @returns state of Kite Server
   */
  getKiteServerState(): KiteServerState {
    return this.serverState;
  }
  /**
   * If the kite server isn't running
   * invokes the docker-compose
   * down method directly. Otherwise
   * makes a request to shutdown remotely.
   */
  async disconnect() {
    try {
      if (this.serverState === KiteServerState.Connected) {
        await fetch(`${this.server}/disconnect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ disconnect: true }),
        });
      } else {
        await compose.down({
          cwd: downloadDir,
          log: true,
        });
      }
      this.state = KiteState.Shutdown;
    } catch (err) {
      console.log(`Could not shutdown docker instances:\n${err}`);
    }
  }
}
