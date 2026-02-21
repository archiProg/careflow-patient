import { NativeModules, NativeEventEmitter } from 'react-native';

const { SmartcardModule } = NativeModules;
const emitter = new NativeEventEmitter(SmartcardModule);

export default {
  isSmartcardConnected: (): Promise<boolean> =>
    SmartcardModule.isSmartcardConnected(),
  readSmartcardData: (): Promise<any> => SmartcardModule.readSmartcardData(),
};
