import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currencies } from '../config/currencies';

let SecureStore = null;
let LocalAuthentication = null;

if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
  LocalAuthentication = require('expo-local-authentication');
}

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

const defaultSettings = {
  currency: 'INR',
  pinEnabled: false,
  biometricEnabled: false,
  reminders: {
    billReminders: true,
    rentReminder: false,
    rentDay: 1,
    budgetAlerts: true,
    budgetThreshold: 80
  },
  syncEnabled: true,
  lastSync: null
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    if (Platform.OS === 'web' || !LocalAuthentication) {
      setBiometricAvailable(false);
      return;
    }
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Biometric check error:', error);
      setBiometricAvailable(false);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        
        if (Platform.OS === 'web') {
          const storedPin = await AsyncStorage.getItem('userPin');
          if (parsed.pinEnabled && !storedPin) {
            parsed.pinEnabled = false;
            parsed.biometricEnabled = false;
          }
        }
        
        setSettings({ ...defaultSettings, ...parsed });
        
        if (parsed.pinEnabled && Platform.OS !== 'web') {
          setIsLocked(true);
        } else if (parsed.pinEnabled && Platform.OS === 'web') {
          const storedPin = await AsyncStorage.getItem('userPin');
          if (storedPin) {
            setIsLocked(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const setPin = async (pin) => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('userPin', pin);
      } else if (SecureStore) {
        await SecureStore.setItemAsync('userPin', pin);
      }
      const newSettings = { ...settings, pinEnabled: true };
      await saveSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error setting PIN:', error);
      return false;
    }
  };

  const removePin = async () => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('userPin');
      } else if (SecureStore) {
        await SecureStore.deleteItemAsync('userPin');
      }
      const newSettings = { ...settings, pinEnabled: false, biometricEnabled: false };
      await saveSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error removing PIN:', error);
      return false;
    }
  };

  const verifyPin = async (inputPin) => {
    try {
      let savedPin;
      if (Platform.OS === 'web') {
        savedPin = await AsyncStorage.getItem('userPin');
      } else if (SecureStore) {
        savedPin = await SecureStore.getItemAsync('userPin');
      }
      return savedPin === inputPin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  };

  const unlock = async (pin) => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const unlockWithBiometric = async () => {
    if (Platform.OS === 'web' || !LocalAuthentication) {
      return false;
    }
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Expenses Controller',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false
      });
      
      if (result.success) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric error:', error);
      return false;
    }
  };

  const lock = () => {
    if (settings.pinEnabled) {
      setIsLocked(true);
    }
  };

  const toggleBiometric = async (enabled) => {
    const newSettings = { ...settings, biometricEnabled: enabled };
    await saveSettings(newSettings);
  };

  const setCurrency = async (currencyCode) => {
    const newSettings = { ...settings, currency: currencyCode };
    await saveSettings(newSettings);
  };

  const getCurrency = () => {
    return currencies.find(c => c.code === settings.currency) || currencies[0];
  };

  const updateReminders = async (reminderSettings) => {
    const newSettings = { 
      ...settings, 
      reminders: { ...settings.reminders, ...reminderSettings }
    };
    await saveSettings(newSettings);
  };

  const toggleSync = async (enabled) => {
    const newSettings = { ...settings, syncEnabled: enabled };
    await saveSettings(newSettings);
  };

  const updateLastSync = async () => {
    const newSettings = { ...settings, lastSync: new Date().toISOString() };
    await saveSettings(newSettings);
  };

  const value = {
    settings,
    isLocked,
    loading,
    biometricAvailable,
    currencies,
    setPin,
    removePin,
    verifyPin,
    unlock,
    unlockWithBiometric,
    lock,
    toggleBiometric,
    setCurrency,
    getCurrency,
    updateReminders,
    toggleSync,
    updateLastSync
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
