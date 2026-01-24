import { ProfileModel } from "@/types/ProfileModel";

class Provider {
  static API_URL: string = "https://archismartsolution.com:5002";
  static SOCKETIO_URL: string = "https://archismartsolution.com:5004";
  static Token: string = "";
  static Profile: ProfileModel | null = null;
  static setToken(token: string) {
    this.Token = token;
  }
  static setProfile(profile: ProfileModel | null) {
    this.Profile = profile;
  }
}

export default Provider;
