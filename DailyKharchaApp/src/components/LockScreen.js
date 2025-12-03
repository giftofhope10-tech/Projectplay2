import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated
} from 'react-native';
import { Fingerprint, Delete, Eye, EyeOff, Lock } from 'lucide-react-native';

import { useSettings } from '../context/SettingsContext';

const vibrate = (duration) => {
  if (Platform.OS !== 'web') {
    const { Vibration } = require('react-native');
    Vibration.vibrate(duration);
  }
};

export default function LockScreen() {
  const { unlock, unlockWithBiometric, settings, biometricAvailable } = useSettings();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shakeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (settings.biometricEnabled && biometricAvailable) {
      handleBiometric();
    }
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleNumberClick = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      if (newPin.length === 6) {
        handleUnlock(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleUnlock = async (inputPin) => {
    const success = await unlock(inputPin || pin);
    if (!success) {
      vibrate(200);
      shake();
      setAttempts(prev => prev + 1);
      setError(attempts >= 4 ? 'Too many failed attempts' : 'Incorrect PIN');
      setPin('');
    }
  };

  const handleBiometric = async () => {
    const success = await unlockWithBiometric();
    if (!success) {
      setError('Biometric authentication failed');
    }
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDots}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.pinDot,
              i < pin.length && styles.pinDotFilled,
              error && styles.pinDotError
            ]}
          >
            {showPin && i < pin.length && (
              <Text style={styles.pinDigit}>{pin[i]}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.lockIcon}>
          <Lock size={48} color="#7c3aed" />
        </View>
        <Text style={styles.title}>Expenses Controller</Text>
        <Text style={styles.subtitle}>Enter your PIN to unlock</Text>
      </View>

      <Animated.View style={[styles.pinContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        {renderPinDots()}
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowPin(!showPin)}>
          {showPin ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
        </TouchableOpacity>
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <TouchableOpacity
            key={num}
            style={styles.keypadBtn}
            onPress={() => handleNumberClick(num.toString())}
            disabled={attempts >= 5}
          >
            <Text style={styles.keypadText}>{num}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.keypadBtn} onPress={handleClear}>
          <Text style={styles.keypadActionText}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.keypadBtn}
          onPress={() => handleNumberClick('0')}
          disabled={attempts >= 5}
        >
          <Text style={styles.keypadText}>0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.keypadBtn} onPress={handleDelete}>
          <Delete size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {settings.biometricEnabled && biometricAvailable && (
        <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
          <Fingerprint size={32} color="#7c3aed" />
          <Text style={styles.biometricText}>Use Fingerprint</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af'
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  pinDots: {
    flexDirection: 'row',
    gap: 12
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pinDotFilled: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  pinDotError: {
    borderColor: '#ef4444'
  },
  pinDigit: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  toggleBtn: {
    marginLeft: 16,
    padding: 8
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 20
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
    gap: 16
  },
  keypadBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2d2d44',
    alignItems: 'center',
    justifyContent: 'center'
  },
  keypadText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600'
  },
  keypadActionText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600'
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 12,
    gap: 12
  },
  biometricText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600'
  }
});
