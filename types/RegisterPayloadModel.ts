export interface RegisterPayloadModel {
    head: {
        email: string;
        password: string;
        name: string;
        birthday: string;
        sex: string;
        id_card: string;
        drug_allergy?: string;
        congenital_disease?: string;
        blood_group?: string;
    };
    file?: {
        image?: string;
    };
}