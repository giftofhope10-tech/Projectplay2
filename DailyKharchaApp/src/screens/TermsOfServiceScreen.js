import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, installing, or using Daily Kharcha ("the App"), you agree to be 
          bound by these Terms of Service. If you do not agree to these terms, please do 
          not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Daily Kharcha is a personal finance management application that allows users to:
          {'\n'}- Track income and expenses
          {'\n'}- Set and monitor budgets
          {'\n'}- Create savings goals
          {'\n'}- View financial analytics
          {'\n'}- Sync data across devices (optional)
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          - You may use the App without creating an account (offline mode only)
          {'\n'}- To enable cloud sync, you must sign in with a Google account
          {'\n'}- You are responsible for maintaining the security of your account
          {'\n'}- You must not share your account credentials
        </Text>

        <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You agree to:
          {'\n'}- Provide accurate information when using the App
          {'\n'}- Use the App only for lawful purposes
          {'\n'}- Not attempt to reverse engineer or hack the App
          {'\n'}- Not use the App to store or transmit malicious content
          {'\n'}- Keep your PIN/biometric security enabled if storing sensitive data
        </Text>

        <Text style={styles.sectionTitle}>5. Data Accuracy</Text>
        <Text style={styles.paragraph}>
          - The App provides tools for personal financial tracking only
          {'\n'}- We do not guarantee the accuracy of financial calculations
          {'\n'}- The App should not be used as a substitute for professional financial advice
          {'\n'}- You are solely responsible for the data you enter
        </Text>

        <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          - The App and its content are owned by IF Tech Studio
          {'\n'}- You may not copy, modify, or distribute the App
          {'\n'}- All trademarks and logos are property of their respective owners
        </Text>

        <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT:
          {'\n'}- The App will be uninterrupted or error-free
          {'\n'}- Data will not be lost
          {'\n'}- The App will meet your requirements
          {'\n'}{'\n'}
          You use the App at your own risk.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, IF Tech Studio shall not be liable for:
          {'\n'}- Any indirect, incidental, or consequential damages
          {'\n'}- Loss of data or profits
          {'\n'}- Any damages arising from the use or inability to use the App
        </Text>

        <Text style={styles.sectionTitle}>9. Data Backup</Text>
        <Text style={styles.paragraph}>
          - We recommend regularly backing up your data
          {'\n'}- Enable cloud sync for automatic backup
          {'\n'}- We are not responsible for data loss due to device failure
        </Text>

        <Text style={styles.sectionTitle}>10. Termination</Text>
        <Text style={styles.paragraph}>
          - You may stop using the App at any time
          {'\n'}- We reserve the right to terminate access for violation of these terms
          {'\n'}- Upon termination, your right to use the App ceases immediately
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms at any time. Continued use of the App after 
          changes constitutes acceptance of the new Terms.
        </Text>

        <Text style={styles.sectionTitle}>12. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with 
          applicable laws.
        </Text>

        <Text style={styles.sectionTitle}>13. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, contact us at:
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
  paragraph: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 24
  },
  footer: {
    height: 50
  }
});
