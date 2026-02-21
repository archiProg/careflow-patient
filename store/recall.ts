import { CaseResumePayload } from "@/types/DoctorConsultModel";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ConsultState = {
    consultId: string | null;
    consultInfo: CaseResumePayload | null;
};

const initialState: ConsultState = {
    consultId: null,
    consultInfo: null,
};

const consultSlice = createSlice({
    name: "consult",
    initialState,
    reducers: {
        setConsultResume(state, action: PayloadAction<CaseResumePayload>) {
            state.consultId = action.payload.caseId;
            state.consultInfo = action.payload;
        },
        clearConsultResume(state) {
            state.consultId = null;
            state.consultInfo = null;
        },
    },
});

export const { setConsultResume, clearConsultResume } = consultSlice.actions;
export default consultSlice.reducer;