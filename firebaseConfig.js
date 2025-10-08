// firebaseConfig.js
import { getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { Platform } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0DvVhKXLRxlyLInMxOLj2-v0LZxa4ZOQ",
  authDomain: "krishimitra-d6a91.firebaseapp.com",
  projectId: "krishimitra-d6a91",
  storageBucket: "krishimitra-d6a91.appspot.com",
  messagingSenderId: "243184231278",
  appId: "1:243184231278:web:4999b7e8d9bc7ec298177f",
};

// Initialize Firebase app only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize auth differently for Web and React Native
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export default app;
