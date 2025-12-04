import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBkxplSWjlK16t6apO2RyMi3NZAztW6NLA",
  authDomain: "expenses-controller-558c4.firebaseapp.com",
  projectId: "expenses-controller-558c4",
  storageBucket: "expenses-controller-558c4.firebasestorage.app",
  messagingSenderId: "507541610012",
  appId: "1:507541610012:android:e443ed40a113f7713389d9"
};

let app;
let auth;
let db;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  if (Platform.OS === 'web') {
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error) {
      if (error.code === 'auth/already-initialized') {
        auth = getAuth(app);
      } else {
        console.error('Auth initialization error:', error);
        auth = getAuth(app);
      }
    }
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = null;
  auth = null;
  db = null;
}

export { app, auth, db };
