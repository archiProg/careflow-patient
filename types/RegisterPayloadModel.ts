export interface RegisterPayloadModel {
    head: {
        email: string;
        password: string;
        name: string;
        birthday: string;
        sex: string;
        id_card: string;
    };
    file?: {
        image?: string;
    };
}