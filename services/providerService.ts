import { DoctorConsultModel } from "@/types/DoctorConsultModel";
import { ProfileModel } from "@/types/ProfileModel";

class Provider {
  static HostAPI_URL: string = "https://archismartsolution.com:5002";
  static SOCKETIO_URL: string = "https://archismartsolution.com:5004";
  static Token: string = "";
  static Profile: ProfileModel | null = null;
  static DoctorSpecialty: DoctorConsultModel[] = [];
  static setToken(token: string) {
    this.Token = token;
  }
  static setProfile(profile: ProfileModel | null) {
    this.Profile = profile;
  }
  static setDoctorSpecialty(doctorSpecialty: DoctorConsultModel[]) {
    this.DoctorSpecialty = doctorSpecialty;
  }
}

export default Provider;
