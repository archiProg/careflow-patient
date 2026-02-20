import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import languageReducer from "./languageSlice";

const rootReducer = combineReducers({
    language: languageReducer,
    auth: authReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
