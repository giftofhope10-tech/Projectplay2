import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { 
  Home, 
  Receipt, 
  BarChart3, 
  Target,
  Settings,
  Plus 
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ErrorBoundary from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { ExpenseProvider } from './src/context/ExpenseContext';

import LockScreen from './src/components/LockScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Firebase',
  'Require cycle'
]);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const theme = {
  dark: true,
  colors: {
    primary: '#7c3aed',
    background: '#1a1a2e',
    card: '#2d2d44',
    text: '#ffffff',
    border: '#3d3d5c',
    notification: '#ef4444'
  }
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#1a1a2e',
          elevation: 0,
          shadowOpacity: 0
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#2d2d44',
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 10,
          paddingTop: 5
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Dashboard':
              return <Home size={size} color={color} />;
            case 'Transactions':
              return <Receipt size={size} color={color} />;
            case 'Analytics':
              return <BarChart3 size={size} color={color} />;
            case 'Goals':
              return <Target size={size} color={color} />;
            case 'Settings':
              return <Settings size={size} color={color} />;
            default:
              return null;
          }
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
          elevation: 0,
          shadowOpacity: 0
        },
        headerTintColor: '#fff',
        headerBackTitleVisible: false
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={{ title: 'Add Transaction' }}
      />
      <Stack.Screen 
        name="EditTransaction" 
        component={AddTransactionScreen}
        options={{ title: 'Edit Transaction' }}
      />
      <Stack.Screen 
        name="Budget" 
        component={BudgetScreen}
        options={{ title: 'Budget' }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen 
        name="TermsOfService" 
        component={TermsOfServiceScreen}
        options={{ title: 'Terms of Service' }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { isLocked, loading: settingsLoading } = useSettings();
  const [showLogin, setShowLogin] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seen === 'true');
    } catch (error) {
      console.log('Onboarding check error:', error);
      setHasSeenOnboarding(false);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowLogin(false);
      setHasSeenOnboarding(true);
    } catch (error) {
      console.log('Skip error:', error);
      setHasSeenOnboarding(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
      setShowLogin(false);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading || settingsLoading || hasSeenOnboarding === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!hasSeenOnboarding || showLogin) {
    return (
      <LoginScreen 
        onSkip={handleSkip}
        onGoogleSignIn={handleGoogleSignIn}
        loading={googleLoading}
      />
    );
  }

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <NavigationContainer theme={theme}>
      <MainStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <AuthProvider>
        <SettingsProvider>
          <ExpenseProvider>
            <AppContent />
          </ExpenseProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
