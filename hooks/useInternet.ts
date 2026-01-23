import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const useInternet = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable !== false);
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};

export { useInternet };