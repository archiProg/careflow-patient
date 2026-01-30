import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import languageReducer from "./languageSlice";
import peerReducer from "./peerSlice";

const rootReducer = combineReducers({
    language: languageReducer,
    auth: authReducer,
    peer: peerReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
