import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SessionStore } from './contracts';
const key = 'ema.session';
// Web preview intentionally keeps its session in memory; never localStorage.
let previewToken: string | null = null;
export const sessionStore: SessionStore = {
  read: () =>
    Platform.OS === 'web'
      ? Promise.resolve(previewToken)
      : SecureStore.getItemAsync(key),
  write: async (token) => {
    if (Platform.OS === 'web') previewToken = token;
    else await SecureStore.setItemAsync(key, token);
  },
  clear: async () => {
    if (Platform.OS === 'web') previewToken = null;
    else await SecureStore.deleteItemAsync(key);
  },
};
