import { changeLanguage } from "@/hooks/useI18n";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LanguageState {
    value: string;
}

const initialState: LanguageState = {
    value: "en",
};

const languageSlice = createSlice({
    name: "language",
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<string>) => {
            state.value = action.payload;
            changeLanguage(action.payload);
        },
    },
});

export const { setLanguage } = languageSlice.actions;

export default languageSlice.reducer;
