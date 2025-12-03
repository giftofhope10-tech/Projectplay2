import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { categories } from '../config/currencies';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { transactions } = useExpense();
  const { getCurrency } = useSettings();
  const currency = getCurrency();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const formatAmount = (amount) => {
    return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
  };

  const monthlyData = useMemo(() => {
    const filtered = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === selectedMonth.getMonth() && 
             date.getFullYear() === selectedMonth.getFullYear();
    });

    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = 0;
      }
      categoryBreakdown[t.category] += t.amount;
    });

    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([id, amount]) => ({
        ...categories.find(c => c.id === id) || categories[categories.length - 1],
        amount,
        percentage: expenses > 0 ? (amount / expenses) * 100 : 0
      }));

    const dailyData = {};
    filtered.forEach(t => {
      const day = new Date(t.date).getDate();
      if (!dailyData[day]) {
        dailyData[day] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dailyData[day].income += t.amount;
      } else {
        dailyData[day].expense += t.amount;
      }
    });

    return {
      income,
      expenses,
      savings: income - expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      categoryBreakdown: sortedCategories,
      dailyData,
      transactionCount: filtered.length
    };
  }, [transactions, selectedMonth]);

  const changeMonth = (delta) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedMonth(newDate);
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.monthBtn} onPress={() => changeMonth(-1)}>
          <ChevronLeft size={24} color="#7c3aed" />
        </TouchableOpacity>
        <View style={styles.monthDisplay}>
          <Calendar size={18} color="#9ca3af" />
          <Text style={styles.monthText}>{formatMonth(selectedMonth)}</Text>
        </View>
        <TouchableOpacity style={styles.monthBtn} onPress={() => changeMonth(1)}>
          <ChevronRight size={24} color="#7c3aed" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <TrendingUp size={24} color="#22c55e" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, styles.incomeValue]}>
            {formatAmount(monthlyData.income)}
          </Text>
        </View>
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <TrendingDown size={24} color="#ef4444" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, styles.expenseValue]}>
            {formatAmount(monthlyData.expenses)}
          </Text>
        </View>
      </View>

      <View style={styles.savingsCard}>
        <View style={styles.savingsHeader}>
          <Text style={styles.savingsLabel}>Net Savings</Text>
          <Text style={[
            styles.savingsRate,
            monthlyData.savingsRate >= 0 ? styles.positiveRate : styles.negativeRate
          ]}>
            {monthlyData.savingsRate.toFixed(1)}%
          </Text>
        </View>
        <Text style={[
          styles.savingsValue,
          monthlyData.savings >= 0 ? styles.incomeValue : styles.expenseValue
        ]}>
          {monthlyData.savings >= 0 ? '+' : ''}{formatAmount(monthlyData.savings)}
        </Text>
        <View style={styles.savingsBar}>
          <View 
            style={[
              styles.savingsProgress,
              { 
                width: `${Math.min(Math.abs(monthlyData.savingsRate), 100)}%`,
                backgroundColor: monthlyData.savingsRate >= 0 ? '#22c55e' : '#ef4444'
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {monthlyData.categoryBreakdown.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No expenses this month</Text>
          </View>
        ) : (
          monthlyData.categoryBreakdown.map((cat, index) => (
            <View key={cat.id || index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                <Text style={styles.categoryName}>{cat.name}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryAmount}>{formatAmount(cat.amount)}</Text>
                <Text style={styles.categoryPercent}>{cat.percentage.toFixed(1)}%</Text>
              </View>
              <View style={styles.categoryBar}>
                <View 
                  style={[
                    styles.categoryProgress,
                    { width: `${cat.percentage}%`, backgroundColor: cat.color }
                  ]} 
                />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monthlyData.transactionCount}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {monthlyData.transactionCount > 0 
                ? formatAmount(monthlyData.expenses / Math.max(monthlyData.categoryBreakdown.filter(c => c.amount > 0).length, 1))
                : formatAmount(0)}
            </Text>
            <Text style={styles.statLabel}>Avg per Category</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {monthlyData.categoryBreakdown[0]?.name || 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Top Spending</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  monthBtn: {
    padding: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 8
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 16
  },
  summaryLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 8,
    textTransform: 'uppercase'
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4
  },
  incomeValue: {
    color: '#22c55e'
  },
  expenseValue: {
    color: '#ef4444'
  },
  savingsCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  savingsLabel: {
    fontSize: 14,
    color: '#9ca3af',
    textTransform: 'uppercase'
  },
  savingsRate: {
    fontSize: 16,
    fontWeight: '600'
  },
  positiveRate: {
    color: '#22c55e'
  },
  negativeRate: {
    color: '#ef4444'
  },
  savingsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8
  },
  savingsBar: {
    height: 6,
    backgroundColor: '#3d3d5c',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden'
  },
  savingsProgress: {
    height: '100%',
    borderRadius: 3
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16
  },
  emptyState: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center'
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14
  },
  categoryItem: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  categoryName: {
    fontSize: 15,
    color: '#fff',
    flex: 1
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  categoryPercent: {
    fontSize: 14,
    color: '#9ca3af'
  },
  categoryBar: {
    height: 4,
    backgroundColor: '#3d3d5c',
    borderRadius: 2,
    overflow: 'hidden'
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 2
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center'
  },
  footer: {
    height: 100
  }
});
