import { Platform } from 'react-native';

let auth = null;
let firestore = null;
let firebaseAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const firebase = require('@react-native-firebase/app').default;
    auth = require('@react-native-firebase/auth').default;
    firestore = require('@react-native-firebase/firestore').default;
    firebaseAvailable = firebase.apps.length > 0;
  } catch (error) {
    console.log('Firebase modules not available:', error.message);
    firebaseAvailable = false;
  }
} else {
  console.log('Firebase not supported on web platform');
  firebaseAvailable = false;
}

export { auth, firestore, firebaseAvailable };
