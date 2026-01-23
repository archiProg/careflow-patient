
import { store } from "@/store/index";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { Provider } from "react-redux";
import "./global.css";

const RootLayout = () => {

  return (
    <Provider store={store}>
      <View className="flex-1 bg-white dark:bg-gray-900">
        <StatusBar style="dark" />
        <View className="flex-1 w-full my-10">
          <Slot />
        </View>
      </View>
    </Provider>
  );
}

export default RootLayout;
