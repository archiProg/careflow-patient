interface PatientRequestAck {
    success: boolean;
    caseId: string;
    error?: string;
}

interface JoinRoomResponse {
    success: boolean;
    caseId?: string;
    others?: UserConnected[];
    error?: string;
}


interface UserConnected {
    id: string;
    username: string;
    hasAudio: boolean;
    hasVideo: boolean;
}

export { JoinRoomResponse, PatientRequestAck, UserConnected };

