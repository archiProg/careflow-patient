interface DoctorConsultModel {
    id: number;
    name: string;
    description: string;
}

interface DoctorInfoConsultModel {
    affiliated_hospital: string
    doctor_id: number
    license_number: string
    name: string
    profile_detail: string
    profile_image_url: string
    sex: number
    specialization_desc: string
    specialization_id: number
    specialization_name: string
    years_of_experience: string
}


type CaseResumePayload = {
    caseId: string;
    doctorInfo: DoctorInfoConsultModel;
};


export { CaseResumePayload, DoctorConsultModel, DoctorInfoConsultModel };

