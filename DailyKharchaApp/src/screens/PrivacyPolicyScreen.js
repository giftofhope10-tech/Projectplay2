import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to Daily Kharcha ("we," "our," or "us"). We are committed to protecting your 
          personal information and your right to privacy. This Privacy Policy explains how we 
          collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.subTitle}>Personal Information</Text>
        <Text style={styles.paragraph}>
          When you use our app with Google Sign-In, we may collect:
          {'\n'}- Your name and email address
          {'\n'}- Profile picture (if available)
          {'\n'}- Google account identifier
        </Text>

        <Text style={styles.subTitle}>Financial Data</Text>
        <Text style={styles.paragraph}>
          The app stores financial information you voluntarily enter:
          {'\n'}- Transaction records (income and expenses)
          {'\n'}- Budget information
          {'\n'}- Savings goals
          {'\n'}- Category preferences
        </Text>

        <Text style={styles.subTitle}>Device Information</Text>
        <Text style={styles.paragraph}>
          We may automatically collect:
          {'\n'}- Device type and operating system
          {'\n'}- App version
          {'\n'}- Usage statistics
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
          {'\n'}- Provide and maintain the app's functionality
          {'\n'}- Sync your data across devices via Firebase
          {'\n'}- Send you reminders and notifications (with your permission)
          {'\n'}- Improve our services
          {'\n'}- Respond to your inquiries
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is stored using:
          {'\n'}- Local secure storage on your device
          {'\n'}- Firebase Cloud Firestore (when sync is enabled)
          {'\n'}{'\n'}
          We implement industry-standard security measures including:
          {'\n'}- Encrypted data transmission (HTTPS/TLS)
          {'\n'}- Secure PIN storage using device keychain
          {'\n'}- Biometric authentication support
        </Text>

        <Text style={styles.sectionTitle}>5. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do NOT:
          {'\n'}- Sell your personal information
          {'\n'}- Share your financial data with third parties
          {'\n'}- Use your data for advertising purposes
          {'\n'}{'\n'}
          Your data may be processed by:
          {'\n'}- Google Firebase (for authentication and cloud storage)
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
          {'\n'}- Access your personal data
          {'\n'}- Delete your account and all associated data
          {'\n'}- Export your financial data
          {'\n'}- Opt-out of cloud sync (use offline mode)
          {'\n'}- Disable notifications
        </Text>

        <Text style={styles.sectionTitle}>7. Offline Mode</Text>
        <Text style={styles.paragraph}>
          The app supports full offline functionality. When offline mode is enabled:
          {'\n'}- All data is stored locally on your device only
          {'\n'}- No data is transmitted to our servers
          {'\n'}- Automatic sync occurs when you reconnect (if sync is enabled)
        </Text>

        <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our app is not intended for children under 13 years of age. We do not knowingly 
          collect personal information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any 
          changes by posting the new Privacy Policy on this page and updating the 
          "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
          {'\n'}Email: support@iftechstudio.com
        </Text>

        <View style={styles.footer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  content: {
    padding: 20
  },
  lastUpdated: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
    marginTop: 12,
    marginBottom: 8
  },
  paragraph: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 24
  },
  footer: {
    height: 50
  }
});
