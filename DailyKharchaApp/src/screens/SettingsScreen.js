import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image
} from 'react-native';
import { 
  Lock, 
  Unlock, 
  Shield, 
  Globe,
  Bell,
  Cloud,
  CloudOff,
  LogOut,
  ChevronRight,
  Fingerprint,
  Eye,
  EyeOff,
  FileText,
  Info
} from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { 
    settings, 
    currencies,
    biometricAvailable,
    setPin, 
    removePin, 
    verifyPin,
    toggleBiometric,
    setCurrency,
    updateReminders,
    toggleSync,
    lock
  } = useSettings();
  const { user, signOut } = useAuth();

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleSetPin = async () => {
    setPinError('');
    
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    
    const success = await setPin(newPin);
    if (success) {
      setNewPin('');
      setConfirmPin('');
      setShowPinSetup(false);
      Alert.alert('Success', 'PIN set successfully!');
    }
  };

  const handleRemovePin = async () => {
    if (settings.pinEnabled) {
      const isValid = await verifyPin(currentPin);
      if (!isValid) {
        setPinError('Incorrect current PIN');
        return;
      }
    }
    
    await removePin();
    setCurrentPin('');
    setPinError('');
    setShowPinSetup(false);
    Alert.alert('Success', 'PIN removed');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const currentCurrency = currencies.find(c => c.code === settings.currency) || currencies[0];

  return (
    <ScrollView style={styles.container}>
      {user && (
        <View style={styles.userCard}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Text style={styles.userInitial}>{user.displayName?.[0] || 'U'}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Shield size={20} color="#7c3aed" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>App Lock</Text>
                <Text style={styles.settingDesc}>
                  {settings.pinEnabled ? 'Protected with PIN' : 'Protect your data'}
                </Text>
              </View>
            </View>
            {settings.pinEnabled ? (
              <View style={styles.settingActions}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={lock}
                >
                  <Lock size={16} color="#7c3aed" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={() => setShowPinSetup('remove')}
                >
                  <Unlock size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => setShowPinSetup('set')}
              >
                <Text style={styles.primaryBtnText}>Set PIN</Text>
              </TouchableOpacity>
            )}
          </View>

          {showPinSetup === 'set' && (
            <View style={styles.pinForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New PIN (4-6 digits)</Text>
                <View style={styles.pinInputWrapper}>
                  <TextInput
                    style={styles.pinInput}
                    secureTextEntry={!showPins}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={newPin}
                    onChangeText={(text) => setNewPin(text.replace(/\D/g, ''))}
                    placeholder="Enter PIN"
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity onPress={() => setShowPins(!showPins)}>
                    {showPins ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  secureTextEntry={!showPins}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={confirmPin}
                  onChangeText={(text) => setConfirmPin(text.replace(/\D/g, ''))}
                  placeholder="Confirm PIN"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowPinSetup(false);
                    setNewPin('');
                    setConfirmPin('');
                    setPinError('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSetPin}>
                  <Text style={styles.saveBtnText}>Set PIN</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showPinSetup === 'remove' && (
            <View style={styles.pinForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Enter Current PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  secureTextEntry={!showPins}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={currentPin}
                  onChangeText={(text) => setCurrentPin(text.replace(/\D/g, ''))}
                  placeholder="Current PIN"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowPinSetup(false);
                    setCurrentPin('');
                    setPinError('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerBtn} onPress={handleRemovePin}>
                  <Text style={styles.saveBtnText}>Remove PIN</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {settings.pinEnabled && biometricAvailable && (
            <>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Fingerprint size={20} color="#7c3aed" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Fingerprint Unlock</Text>
                    <Text style={styles.settingDesc}>Use biometrics to unlock</Text>
                  </View>
                </View>
                <Switch
                  value={settings.biometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: '#4b5563', true: '#7c3aed50' }}
                  thumbColor={settings.biometricEnabled ? '#7c3aed' : '#9ca3af'}
                />
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <TouchableOpacity 
          style={styles.settingCard}
          onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Globe size={20} color="#7c3aed" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Display Currency</Text>
                <Text style={styles.settingDesc}>
                  {currentCurrency.symbol} {currentCurrency.name}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        {showCurrencyPicker && (
          <View style={styles.currencyList}>
            {currencies.map(curr => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyItem,
                  settings.currency === curr.code && styles.currencyItemActive
                ]}
                onPress={() => {
                  setCurrency(curr.code);
                  setShowCurrencyPicker(false);
                }}
              >
                <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                <Text style={styles.currencyName}>{curr.name}</Text>
                <Text style={styles.currencyCode}>{curr.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync & Backup</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              {settings.syncEnabled ? (
                <Cloud size={20} color="#22c55e" />
              ) : (
                <CloudOff size={20} color="#9ca3af" />
              )}
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Cloud Sync</Text>
                <Text style={styles.settingDesc}>
                  {settings.syncEnabled ? 'Auto-sync enabled' : 'Offline only'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.syncEnabled}
              onValueChange={toggleSync}
              trackColor={{ false: '#4b5563', true: '#22c55e50' }}
              thumbColor={settings.syncEnabled ? '#22c55e' : '#9ca3af'}
            />
          </View>
          {settings.lastSync && (
            <Text style={styles.syncInfo}>
              Last synced: {new Date(settings.lastSync).toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#7c3aed" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Bill Reminders</Text>
                <Text style={styles.settingDesc}>Get reminded about bills</Text>
              </View>
            </View>
            <Switch
              value={settings.reminders.billReminders}
              onValueChange={(v) => updateReminders({ billReminders: v })}
              trackColor={{ false: '#4b5563', true: '#7c3aed50' }}
              thumbColor={settings.reminders.billReminders ? '#7c3aed' : '#9ca3af'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#7c3aed" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Budget Alerts</Text>
                <Text style={styles.settingDesc}>
                  Alert at {settings.reminders.budgetThreshold}% of budget
                </Text>
              </View>
            </View>
            <Switch
              value={settings.reminders.budgetAlerts}
              onValueChange={(v) => updateReminders({ budgetAlerts: v })}
              trackColor={{ false: '#4b5563', true: '#7c3aed50' }}
              thumbColor={settings.reminders.budgetAlerts ? '#7c3aed' : '#9ca3af'}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.settingInfo}>
              <FileText size={20} color="#9ca3af" />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <View style={styles.settingInfo}>
              <FileText size={20} color="#9ca3af" />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.aboutSection}>
        <Info size={20} color="#9ca3af" />
        <Text style={styles.aboutText}>Daily Kharcha v1.0.0</Text>
        <Text style={styles.aboutSubtext}>Your personal expense tracker</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    margin: 16,
    padding: 16,
    borderRadius: 16
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  userAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2
  },
  signOutBtn: {
    padding: 8
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  settingCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    overflow: 'hidden'
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingText: {
    marginLeft: 12,
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff'
  },
  settingDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2
  },
  settingActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionBtn: {
    padding: 10,
    backgroundColor: '#7c3aed20',
    borderRadius: 8
  },
  actionBtnDanger: {
    backgroundColor: '#ef444420'
  },
  primaryBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: '#3d3d5c',
    marginHorizontal: 16
  },
  pinForm: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3d3d5c'
  },
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 6
  },
  pinInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingRight: 12
  },
  pinInput: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#3d3d5c',
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '600'
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    alignItems: 'center'
  },
  dangerBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    alignItems: 'center'
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600'
  },
  currencyList: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    marginTop: 8,
    maxHeight: 300
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c'
  },
  currencyItemActive: {
    backgroundColor: '#7c3aed20'
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    width: 40
  },
  currencyName: {
    flex: 1,
    fontSize: 16,
    color: '#fff'
  },
  currencyCode: {
    fontSize: 14,
    color: '#9ca3af'
  },
  syncInfo: {
    fontSize: 12,
    color: '#9ca3af',
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  aboutSection: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 50
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4
  }
});
