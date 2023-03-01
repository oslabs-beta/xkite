import { createSlice, configureStore } from '@reduxjs/toolkit';
import defaultCfg, {
  KiteState,
  KiteServerState,
} from '@/common/kite/constants';

const kiteSlice = createSlice({
  name: 'kite',
  initialState: {
    packageBuild: false, //change to make pipeline.zip
    config: defaultCfg, //Promise<KiteConfig> | KiteConfig
    server: 'localhost:6661',
    setup: {}, //Promise<KiteSetup> | KiteSetup;
    kafkaSetup: {}, //KafkaSetup
    dBSetup: {}, //dbCfg
    state: KiteState.Init,
    serverState: KiteServerState.Disconnected,
    configFile: {}, //Promise<KiteConfigFile> | KiteConfigFile;
    springPort: 8080, 
  },
  reducers: {
    setPackageBuild: (state, action) => {
      state.packageBuild = action.payload;
    },
    setConfig: (state, action) => {
      // console.log(
      //   `setting state: ${state.config} = ${JSON.stringify(action.payload)}`
      // );
      state.config = Object.assign(action.payload);
      state.springPort = action.payload.kafka.spring.port;
    },
    setServer: (state, action) => {
      // console.log(
      //   `setting state: ${state.server} = ${JSON.stringify(action.payload)}`
      // );
      state.server = action.payload;
    },
    setSetup: (state, action) => {
      // console.log(
      //   `setting state: ${state.setup} = ${JSON.stringify(action.payload)}`
      // );
      state.setup = Object.assign(action.payload);
      state.kafkaSetup = Object.assign(action.payload.kafkaSetup ?? {});
      state.dBSetup = Object.assign(action.payload.dataSetup ?? {});
    },
    setState: (state, action) => {
      // console.log(
      //   `setting state: ${state.state} = ${JSON.stringify(action.payload)}`
      // );
      state.state = action.payload;
    },
    setServerState: (state, action) => {
      // console.log(
      //   `setting state: ${state.serverState} = ${JSON.stringify(
      //     action.payload
      //   )}`
      // );
      state.serverState = action.payload;
    },
    setConfigFile: (state, action) => {
      // console.log(
      //   `setting state: ${state.configFile} = ${JSON.stringify(action.payload)}`
      // );
      state.configFile = Object.assign(action.payload);
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
