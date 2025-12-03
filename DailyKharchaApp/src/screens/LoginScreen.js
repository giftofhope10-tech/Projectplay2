import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Wallet, Cloud, Shield, ChevronRight, Chrome } from 'lucide-react-native';

export default function LoginScreen({ onSkip, onGoogleSignIn, loading }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Wallet size={56} color="#7c3aed" />
        </View>
        <Text style={styles.title}>Expenses Controller</Text>
        <Text style={styles.subtitle}>Your Personal Expense Tracker</Text>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Cloud size={24} color="#22c55e" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Cloud Backup</Text>
            <Text style={styles.featureDesc}>Sync across all your devices</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Shield size={24} color="#3b82f6" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Secure & Private</Text>
            <Text style={styles.featureDesc}>Your data is encrypted and safe</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.googleBtn}
          onPress={onGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipBtnText}>Continue without account</Text>
          <ChevronRight size={18} color="#9ca3af" />
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Without sign in, data will only be stored locally.
          Sign in to enable cloud backup & sync.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginTop: 60
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7c3aed20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
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
  features: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  featureText: {
    flex: 1
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4
  },
  featureDesc: {
    fontSize: 14,
    color: '#9ca3af'
  },
  actions: {
    paddingBottom: 40
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleG: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4'
  },
  googleBtnText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600'
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3d5c'
  },
  skipBtnText: {
    color: '#9ca3af',
    fontSize: 16,
    marginRight: 4
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18
  }
});
