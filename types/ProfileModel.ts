export interface ProfileModel {
  id: number;
  id_card: string;
  name: string;
  sex: number;
  email: string;
  password_hash: string;
  role: string;
  profile_image_url?: string;
  auth_image_url: string;
  birthday: string;
  address: string;
  google_id?: string;
  photo?: string;
  doctor_profile?: string;
  patient_profile?: PatientProfile;
}

export interface PatientProfile {
  id: number;
  patient_id: number;
  blood_group?: string;
  congenital_disease?: string;
  drug_allergy?: string;
}
