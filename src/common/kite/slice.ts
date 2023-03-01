import { createSlice } from '@reduxjs/toolkit';
import { KiteState, KiteServerState } from '@/common/kite/constants';
import defaultCfg, { configFilePath } from './constants';
import path from 'path';
import fs from 'fs-extra';
const initialState = readConfigFromFile();

const kiteSlice = createSlice({
  name: 'kite',
  initialState,
  reducers: {
    setPackageBuild: (state, action) => {
      console.log(`setting packageBuild: ${action.payload}`);
      state.packageBuild = action.payload;
      writeConfigToFile(state);
    },
    setConfig: (state, action) => {
      state.config = Object.assign(action.payload);
      state.init = false;
      writeConfigToFile(state);
    },
    setServer: (state, action) => {
      state.server = action.payload;
      writeConfigToFile(state);
    },
    setSetup: (state, action) => {
      state.setup = Object.assign(action.payload);
      state.kafkaSetup = Object.assign(action.payload.kafkaSetup ?? {});
      state.dBSetup = Object.assign(action.payload.dataSetup ?? {});
      writeConfigToFile(state);
    },
    setState: (state, action) => {
      state.state = action.payload;
      writeConfigToFile(state);
    },
    setServerState: (state, action) => {
      state.serverState = action.payload;
      writeConfigToFile(state);
    },
    setConfigFile: (state, action) => {
      state.configFile = Object.assign(action.payload);
      writeConfigToFile(state);
    },
  },
});

const {
  setPackageBuild,
  setConfig,
  setServer,
  setSetup,
  setState,
  setServerState,
  setConfigFile,
} = kiteSlice.actions;

export {
  setPackageBuild,
  setConfig,
  setServer,
  setSetup,
  setState,
  setServerState,
  setConfigFile,
};

export default kiteSlice.reducer;

function readConfigFromFile(): any {
  try {
    const state = fs.readFileSync(
      path.resolve(configFilePath, 'cfg.json'),
      'utf-8'
    );
    if (state !== undefined && Object.keys(state).length !== 0) {
      return JSON.parse(state);
    } else {
      console.log('return default');
      return defaultState;
    }
  } catch (err) {
    console.log(`Error reading Kite configFile: ${err}`);
    return defaultState;
  }
}

const defaultState = {
  init: true,
  packageBuild: false, //change to make pipeline.zip
  config: defaultCfg, //Promise<KiteConfig> | KiteConfig
  server: 'localhost:6661',
  setup: {}, //Promise<KiteSetup> | KiteSetup;
  kafkaSetup: {}, //KafkaSetup
  dBSetup: {}, //dbCfg
  state: KiteState.Init,
  serverState: KiteServerState.Disconnected,
  configFile: {}, //Promise<KiteConfigFile> | KiteConfigFile;
};

function writeConfigToFile(state: any): void {
  try {
    console.log('writing to file...');
    fs.writeFileSync(
      path.resolve(configFilePath, 'cfg.json'),
      JSON.stringify(state)
    );
  } catch (err) {
    console.log(`Error writing Kite configFile ${err}`);
  }
}
