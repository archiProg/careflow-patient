import { getJwtExp } from "@/utils/jwt";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  expire: number;
}

const initialState: AuthState = {
  token: null,
  expire: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    setExpire: (state, action: PayloadAction<string>) => {
      state.expire = getJwtExp(action.payload);
    },
    clearExpire: (state) => {
      state.expire = 0;
    },
    clearAll: (state) => {
      state.token = null;
      state.expire = 0;
    },
  },
});

export const { setToken, clearToken, setExpire, clearExpire, clearAll } =
  authSlice.actions;
export default authSlice.reducer;
