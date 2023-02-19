import path from 'path';
import fs from 'fs-extra';
import compose from 'docker-compose';
import type { IDockerComposeResult } from 'docker-compose/dist';
import ymlGenerator from '../ymlgenerator';
import zipper from 'zip-local';
const downloadDir = path.join(process.cwd(), 'src/common/kite/download');

const defaultCfg: KiteConfig = {
  numOfClusters: 2,
  dataSource: 'postgresql',
  sink: 'jupyter',
};

// simple prog for CLI:
// const kite = new Kite({numOfCluster:arg[2], dataSource:arg[3], sink:arg[4]})
// await kite.build()
//

export default class Kite {
  config: KiteConfig;
  configPath: string;
  setup!: KiteSetup;
  /**
   * @param {KiteConfig} config
   * takes the configuration
   * for KITE standalone servers
   * and generates the YAML configuration
   * file locally.
   */
  constructor(config: KiteConfig = defaultCfg) {
    this.config = JSON.parse(JSON.stringify(config));
    this.configPath = path.join(downloadDir, 'docker-compose.yml');
    // launch configuration
    try {
      const generate: Function = ymlGenerator();
      this.setup = generate(this.config);
      zipper.sync
        .zip(downloadDir)
        .compress()
        .save(path.resolve(downloadDir, 'pipeline.zip'));
      // console.log('done zipping...');
    } catch (err) {
      console.log(`KITE failed to initialize: ${err}\nConfiguration ${config}`);
    }
  }
  /**
   * @returns {Promise}
   * Promise object from docker-compose
   * up invokation
   */
  deploy(): Promise<IDockerComposeResult> {
    return compose.upAll({
      cwd: downloadDir,
      log: true,
    });
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
   *
   * @returns {KiteConfigFile}
   * the header content and the
   * file stream for transmission.
   * Use case: const kite = new Kite();
   * const configObj = kite.getConfig();
   * res.writeHead(200, configObj.header);
   * configObj.fileStream.pipe(res);
   */
  getConfig(): KiteConfigFile {
    const stat = fs.statSync(this.configPath);
    const header = {
      'Content-Type': 'text/yml',
      'Content-Length': stat.size,
    };
    const fileStream = fs.createReadStream(this.configPath);
    return { header, fileStream };
  }

  /**
   * @returns {Promise}
   * Promise object from docker-compose
   * down invokation
   */
  disconnect(): Promise<IDockerComposeResult> {
    return compose.down({
      cwd: downloadDir,
      log: true,
    });
  }
}
