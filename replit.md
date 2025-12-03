# Expenses Controller - Android App

## Overview
Personal expense tracking Android application built with React Native and Expo. Ready for Google Play Store submission.

## Project Info
- **App Name**: Expenses Controller
- **Package Name**: com.iftechstudio.Expense_Controller
- **Version**: 1.0.0
- **Target SDK**: 35

## Firebase Configuration
- **Project ID**: expenses-controller-558c4
- **Authentication**: Google Sign-In enabled
- **Database**: Firestore
- **SHA-1**: 0E:75:A2:83:D5:D7:65:8F:D0:00:8D:FA:C4:69:E9:A3:12:3B:F6:11

## Features
- Transaction tracking (income/expenses)
- Budget management with alerts
- Savings goals with progress tracking
- Analytics with category breakdown
- Cloud sync via Firebase
- Offline mode with local storage
- 16 currencies supported (INR default)
- PIN/Biometric security lock
- Privacy Policy & Terms of Service

## Project Structure
```
DailyKharchaApp/
├── App.js                 # Main app entry
├── app.json               # Expo configuration
├── google-services.json   # Firebase config
├── assets/                # App icons and splash
└── src/
    ├── components/        # Reusable components
    ├── config/            # Firebase, currencies config
    ├── context/           # Auth, Expenses, Settings contexts
    └── screens/           # All app screens
```

## Screens
1. LoginScreen - Google Sign-In
2. DashboardScreen - Financial overview
3. TransactionsScreen - View/manage transactions
4. AddTransactionScreen - Add/edit transactions
5. AnalyticsScreen - Charts and insights
6. BudgetScreen - Budget tracking
7. GoalsScreen - Savings goals
8. SettingsScreen - App settings
9. LockScreen - PIN/Biometric
10. PrivacyPolicyScreen
11. TermsOfServiceScreen

## Build Commands
```bash
# Install dependencies
cd DailyKharchaApp && npm install

# Build for Android (EAS)
npx eas build -p android

# Get credentials/SHA
npx eas credentials
```

## Developer
IF Tech Studio
support@iftechstudio.com
