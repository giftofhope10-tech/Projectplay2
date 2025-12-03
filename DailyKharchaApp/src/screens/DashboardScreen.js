import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react-native';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../config/currencies';

export default function DashboardScreen({ navigation }) {
  const { transactions, getStats, syncing, syncWithCloud } = useExpense();
  const { getCurrency } = useSettings();
  const { user, isOnline } = useAuth();
  
  const stats = getStats();
  const currency = getCurrency();

  const formatAmount = (amount) => {
    return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
  };

  const recentTransactions = transactions.slice(0, 5);

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={syncing}
          onRefresh={syncWithCloud}
          tintColor="#7c3aed"
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.subtitle}>Here's your financial overview</Text>
        </View>
        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.incomeCard]}>
          <View style={styles.statIcon}>
            <TrendingUp size={24} color="#22c55e" />
          </View>
          <Text style={styles.statLabel}>Total Income</Text>
          <Text style={[styles.statValue, styles.incomeValue]}>
            {formatAmount(stats.totalIncome)}
          </Text>
        </View>

        <View style={[styles.statCard, styles.expenseCard]}>
          <View style={styles.statIcon}>
            <TrendingDown size={24} color="#ef4444" />
          </View>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={[styles.statValue, styles.expenseValue]}>
            {formatAmount(stats.totalExpenses)}
          </Text>
        </View>

        <View style={[styles.statCard, styles.balanceCard]}>
          <View style={styles.statIcon}>
            <Wallet size={24} color="#7c3aed" />
          </View>
          <Text style={styles.statLabel}>Current Balance</Text>
          <Text style={[styles.statValue, styles.balanceValue]}>
            {formatAmount(stats.balance)}
          </Text>
        </View>
      </View>

      <View style={styles.monthlyStats}>
        <View style={styles.monthlyCard}>
          <Text style={styles.monthlyLabel}>This Month's Income</Text>
          <Text style={[styles.monthlyValue, styles.incomeValue]}>
            {formatAmount(stats.monthlyIncome)}
          </Text>
        </View>
        <View style={styles.monthlyCard}>
          <Text style={styles.monthlyLabel}>This Month's Spending</Text>
          <Text style={[styles.monthlyValue, styles.expenseValue]}>
            {formatAmount(stats.monthlyExpenses)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={48} color="#4b5563" />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your finances by adding your first transaction
            </Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddTransaction')}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentTransactions.map(txn => {
            const category = getCategoryInfo(txn.category);
            return (
              <View key={txn.id} style={styles.transactionItem}>
                <View style={[styles.txnIcon, { backgroundColor: category.color + '20' }]}>
                  {txn.type === 'income' ? (
                    <ArrowUpRight size={20} color="#22c55e" />
                  ) : (
                    <ArrowDownRight size={20} color="#ef4444" />
                  )}
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnDescription}>{txn.description}</Text>
                  <Text style={styles.txnCategory}>{category.name} • {formatDate(txn.date)}</Text>
                </View>
                <Text style={[
                  styles.txnAmount,
                  txn.type === 'income' ? styles.incomeValue : styles.expenseValue
                ]}>
                  {txn.type === 'income' ? '+' : '-'}{formatAmount(txn.amount)}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4
  },
  offlineBadge: {
    backgroundColor: '#ef444420',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  offlineText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 16,
    margin: 4
  },
  balanceCard: {
    minWidth: '96%'
  },
  statIcon: {
    marginBottom: 12
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4
  },
  incomeValue: {
    color: '#22c55e'
  },
  expenseValue: {
    color: '#ef4444'
  },
  balanceValue: {
    color: '#7c3aed'
  },
  monthlyStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12
  },
  monthlyCard: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16
  },
  monthlyLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase'
  },
  monthlyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  viewAll: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#2d2d44',
    borderRadius: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  txnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  txnInfo: {
    flex: 1
  },
  txnDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff'
  },
  txnCategory: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});
