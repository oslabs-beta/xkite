import { createSlice, configureStore } from '@reduxjs/toolkit';
import path from 'path';
import fs from 'fs-extra';
import defaultCfg, {
  KiteState,
  KiteServerState,
  configFilePath,
} from '@/common/kite/constants';

const initialState = readConfigFromFile();
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

const kiteSlice = createSlice({
  name: 'kite',
  initialState,
  reducers: {
    setPackageBuild: (state, action) => {
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

const store = configureStore({
  reducer: kiteSlice.reducer,
});

export {
  setPackageBuild,
  setConfig,
  setServer,
  setSetup,
  setState,
  setServerState,
  setConfigFile,
};

export default store;

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

function readConfigFromFile(): any {
  try {
    const state = fs.readFileSync(
      path.resolve(configFilePath, 'cfg.json'),
      'utf-8'
    );
    if (state !== undefined) {
      return JSON.parse(state);
    } else {
      return defaultState;
    }
  } catch (err) {
    console.log(`Error reading Kite configFile: ${err}`);
    return defaultState;
  }
}
