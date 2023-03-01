import { configureStore } from '@reduxjs/toolkit';
import kiteReducer from '@/common/kite/slice';
const store = configureStore({
  reducer: kiteReducer,
});

export default store;
