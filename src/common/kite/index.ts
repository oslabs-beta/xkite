import path from 'path';
import fs from 'fs-extra';
import compose from 'docker-compose';
import ymlGenerator from '@/common/ymlgenerator';
const zipper = require('zip-local');
import Monitor from '@/common/monitor/monitor';
import { KiteState, KiteServerState } from '@/common/kite/constants';
import defaultCfg, { configFilePath } from './constants';
const downloadDir = path.join(process.cwd(), 'src/common/kite/download');
const configPath = path.join(downloadDir, 'docker-compose.yml');
const zipPath = path.join(downloadDir, 'pipeline.zip');

import store from '@/common/kite/store';
import {
  setPackageBuild,
  setConfig,
  setServer,
  setSetup,
  setState,
  setServerState,
  setConfigFile,
} from '@/common/kite/slice';

function KiteCreator() {
  //Private Variable / Methods:

  /**
   * Gets the remote server link configuration.
   * @param {string} server
   * the server string of a remote Kite
   * instance for connection.
   */
  async function configServer(server: string) {
    store.dispatch(setServer(server));
    store.dispatch(setState(KiteState.Init));
    store.dispatch(setServerState(KiteServerState.Disconnected));
    try {
      const res = [
        fetch(`${server}/api/kite/getConfig`),
        fetch(`${server}/api/kite/getSetup`),
        fetch(`${server}/api/kite/getConfigFile`),
        fetch(`${server}/api/kite/getPackageBuild`),
      ];
      store.dispatch(setConfig((await res[0]).json()));
      store.dispatch(setSetup((await res[1]).json()));
      store.dispatch(setConfigFile((await res[2]).json()));
      store.dispatch(setPackageBuild((await res[3]).json()));
      store.dispatch(setServerState(KiteServerState.Connected));
    } catch (err) {
      console.error(`error fetching from ${server}/api/:\n${err}`);
    }
  }

  /**
   * @param {KiteConfig} config
   * takes the configuration
   * for KITE standalone servers
   * and generates the YAML configuration
   * file locally.
   */
  function configLocal(config: KiteConfig) {
    store.dispatch(setState(KiteState.Init));
    store.dispatch(setServerState(KiteServerState.Disconnected));
    // create config + setup
    try {
      // generate the docker config
      const generate: Function = ymlGenerator();
      store.dispatch(setConfig(config));
      store.dispatch(setSetup(generate(config)));
      // package the download, comment out or make optional fro time optimization
      store.dispatch(setPackageBuild(zipPath));
      const header = {
        'Content-Type': 'text/yml',
        'Content-Length': fs.statSync(configPath).size,
      };
      const fileStream = fs.readFileSync(configPath, 'utf-8');
      store.dispatch(setConfigFile({ header, fileStream }));
      store.dispatch(setState(KiteState.Configured));
      console.log('yaml configuration complete...');
    } catch (err) {
      console.error(
        `KITE failed to initialize: ${err}\nConfiguration ${config}`
      );
    }
  }

  /**
   * requests the remote server
   * to deploy docker.
   */
  async function deployServer() {
    try {
      const { server } = store.getState();
      await fetch(`${server}/api/kite/deploy`);
      store.dispatch(setState(KiteState.Running));
    } catch (err) {
      console.error(`Kite deployment failed:\n${JSON.stringify(err)}`);
    }
  }

  /**
   * deploys docker locally
   */
  async function deployLocal() {
    try {
      console.log('deploying docker containers...');
      await compose.upAll({
        cwd: downloadDir,
        log: true,
        callback: (chunk: Buffer) => {
          //progress report
          console.log('job in progress: ', chunk.toString());
        },
      });
      store.dispatch(setState(KiteState.Running));
      console.log('docker deployment successful');
    } catch (err) {
      console.error(`Kite deployment failed:\n${JSON.stringify(err)}`);
    }
  }

  async function shutdownServer() {
    try {
      const { server } = store.getState();
      await fetch(`${server}/api/kite/shutdown`, {
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

  async function shutdownLocal() {
    try {
      await compose.down({
        cwd: downloadDir,
        log: true,
        commandOptions: ['--remove-orphans', '--volumes'], //force stop and delete volumes.
      });
    } catch (err) {
      console.error(`Could not shutdown docker instances on local:\n${err}`);
    }
  }
  /**
   * disconnects from the remote server instance
   */
  async function disconnectServer() {
    try {
      const { server } = store.getState();
      await fetch(`${server}/api/kite/disconnect`, {
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
  async function disconnectLocal() {
    try {
      // await compose.kill({
      //   cwd: downloadDir,
      //   log: true,
      // });
      await compose.down({
        cwd: downloadDir,
        log: true,
        commandOptions: ['--remove-orphans', '--volumes'], //force stop and delete volumes.
      });
    } catch (err) {
      console.error(`Could not disconnect docker instances on local:\n${err}`);
    }
  }

  return {
    //Public Variables / Methods:

    defaultCfg,

    /**
     * @param {string | KiteConfig} arg
     * either the configuration object or
     * the address of kite server instance
     * for remote or local setup.
     */
    configure: function (arg?: string | KiteConfig) {
      if (arg === undefined) {
        configLocal(defaultCfg);
      } else {
        switch (typeof arg) {
          case 'string':
            configServer(arg);
            break;
          default:
            configLocal(arg);
            break;
        }
      }
    },

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
    deploy: async function (arg?: any) {
      // if server active deployment happens there...
      const { serverState } = store.getState();
      if (serverState === KiteServerState.Connected) {
        await deployServer();
      } else {
        await deployLocal();
        // Monitor.initiate();
      }
    },

    /**
     * @returns {KiteSetup}
     * setup to be used for connecting
     * to a kafka instance and/or database.
     */
    getSetup: function (): any {
      return store.getState().setup;
    },

    /**
     * @returns {KafkaSetup}
     * setup to be used for connecting
     * to a kafka instance.
     */
    getKafkaSetup: function (): any {
      return store.getState().kafkaSetup;
    },

    /**
     * @returns {dbCfg}
     * setup to be used for connecting
     * to a database.
     */
    getDBSetup: function (): any {
      return store.getState().dBSetup;
    },

    /**
     * If connected to kite server, gets the config from the server.
     *
     * @returns {KiteConfig}
     *
     */
    getConfig: function (): any {
      return store.getState().config;
    },

    /**
     * If connected to kite server, gets the config from the server.
     *
     * @returns {KiteConfigFile}
     *
     * the header content and the
     * file stream for transmission.
     * Use case: const kite = new Kite();
     * const configObj = getConfig();
     * res.writeHead(200, configObj.header);
     * configObj.fileStream.pipe(res);
     */
    getConfigFile: function (): any {
      return store.getState().configFile;
    },

    /**
     *
     * @returns state of the Kite Application
     */
    getKiteState: function (): KiteState {
      return store.getState().state;
    },

    /**
     *
     * @returns state of Kite Server
     */
    getKiteServerState: function (): KiteServerState {
      return store.getState().serverState;
    },

    getPackageBuild: function (): Promise<KiteConfigFile> {
      if (!fs.existsSync(zipPath)) {
        zipper.sync.zip(downloadDir).compress().save(zipPath);
      }

      return new Promise((res, rej) => {
        const header = {
          'Content-Type': 'application/zip',
          'Content-Length': fs.statSync(zipPath).size,
        };
        const fileStream = fs.readFileSync(zipPath, 'utf-8');
        res({ header, fileStream });
      });
    },
    /**
     * If the kite server isn't running
     * invokes the docker-compose
     * down method directly. Otherwise
     * makes a request to shutdown remotely.
     */
    disconnect: async function (): Promise<any> {
      const { serverState } = store.getState();
      if (serverState === KiteServerState.Connected) {
        store.dispatch(setServerState(KiteServerState.Disconnected));
        disconnectServer();
      } else {
        disconnectLocal();
      }
      store.dispatch(setState(KiteState.Shutdown));
      fs.removeSync(zipPath);
    },

    /**
     * If the kite server isn't running
     * invokes the docker-compose
     * down method directly. Otherwise
     * makes a request to shutdown remotely.
     */
    shutdown: async function (): Promise<any> {
      const { serverState } = store.getState();
      if (serverState === KiteServerState.Connected) {
        store.dispatch(setServerState(KiteServerState.Disconnected));
        shutdownServer();
      } else {
        shutdownLocal();
      }
      store.dispatch(setState(KiteState.Shutdown));
      fs.removeSync(zipPath);
    },
  };
}
const Kite = KiteCreator();
export default Kite;
