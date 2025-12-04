import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, firestore, firebaseAvailable } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(firebaseAvailable);

  useEffect(() => {
    if (!firebaseAvailable) {
      console.log('Firebase not available, running in offline mode');
      setLoading(false);
      setIsFirebaseAvailable(false);
      return;
    }

    setIsFirebaseAvailable(true);
    
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let userData = {};
          try {
            const userDoc = await firestore()
              .collection('users')
              .doc(firebaseUser.uid)
              .get();
            if (userDoc.exists) {
              userData = userDoc.data();
            }
          } catch (firestoreError) {
            console.log('Could not fetch user data:', firestoreError);
          }
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            ...userData
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (idToken) => {
    if (!firebaseAvailable) {
      return { success: false, error: 'Firebase not available' };
    }
    
    try {
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const result = await auth().signInWithCredential(googleCredential);
      
      try {
        await firestore()
          .collection('users')
          .doc(result.user.uid)
          .set({
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            lastLogin: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp()
          }, { merge: true });
      } catch (firestoreError) {
        console.log('Could not save user data:', firestoreError);
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      if (firebaseAvailable) {
        await auth().signOut();
      }
      await AsyncStorage.removeItem('userSettings');
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isOnline,
    setIsOnline,
    firebaseAvailable: isFirebaseAvailable,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
