import * as ImagePicker from "expo-image-picker";
import { PermissionsAndroid, Platform } from "react-native";

export class PermissionService {
    static async requestGalleryPermission(): Promise<boolean> {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: "Gallery Permission",
                        message: "App needs access to your gallery to upload images",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else {
            // iOS handled by Expo Image Picker
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            return status === "granted";
        }
    }

    /**
     * Request camera permission
     */
    static async requestCameraPermission(): Promise<boolean> {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Camera Permission",
                        message: "App needs access to your camera",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            return status === "granted";
        }
    }

    static async requestMicrophonePermission(): Promise<boolean> {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: "Microphone Permission",
                        message: "App needs access to your microphone",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else {
            // iOS (Expo)
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            return status === "granted";
        }
    }
}
