import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBkxplSWjlK16t6apO2RyMi3NZAztW6NLA",
  authDomain: "expenses-controller-558c4.firebaseapp.com",
  projectId: "expenses-controller-558c4",
  storageBucket: "expenses-controller-558c4.firebasestorage.app",
  messagingSenderId: "507541610012",
  appId: "1:507541610012:android:e443ed40a113f7713389d9"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };
