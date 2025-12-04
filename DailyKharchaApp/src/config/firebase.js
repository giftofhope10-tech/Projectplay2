import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBkxplSWjlK16t6apO2RyMi3NZAztW6NLA",
  authDomain: "expenses-controller-558c4.firebaseapp.com",
  projectId: "expenses-controller-558c4",
  storageBucket: "expenses-controller-558c4.firebasestorage.app",
  messagingSenderId: "507541610012",
  appId: "1:507541610012:android:e443ed40a113f7713389d9"
};

let firebaseAvailable = true;

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (error) {
  console.log('Firebase initialization handled by native config');
  firebaseAvailable = firebase.apps.length > 0;
}

export { auth, firestore, firebaseAvailable };
export default firebase;
