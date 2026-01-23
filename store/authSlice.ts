import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string | null;
}

const initialState: AuthState = {
    token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            AsyncStorage.setItem("token", action.payload);
        },
        clearToken: (state) => {
            state.token = null;
            AsyncStorage.removeItem("token");
        },
    },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
