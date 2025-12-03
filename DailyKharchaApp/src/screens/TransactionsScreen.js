import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Edit2,
  X,
  Calendar
} from 'lucide-react-native';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { categories } from '../config/currencies';

export default function TransactionsScreen({ navigation }) {
  const { transactions, deleteTransaction } = useExpense();
  const { getCurrency } = useSettings();
  const currency = getCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const formatAmount = (amount) => {
    return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || txn.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, filterType]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(txn => {
      const date = new Date(txn.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(txn);
    });
    return Object.entries(groups).map(([date, items]) => ({
      date,
      data: items
    }));
  }, [filteredTransactions]);

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTransaction(id)
        }
      ]
    );
  };

  const renderTransaction = ({ item: txn }) => {
    const category = getCategoryInfo(txn.category);
    
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.txnIcon, { backgroundColor: category.color + '20' }]}>
          {txn.type === 'income' ? (
            <ArrowUpRight size={20} color="#22c55e" />
          ) : (
            <ArrowDownRight size={20} color="#ef4444" />
          )}
        </View>
        <View style={styles.txnInfo}>
          <Text style={styles.txnDescription}>{txn.description}</Text>
          <Text style={styles.txnCategory}>{category.name}</Text>
        </View>
        <View style={styles.txnRight}>
          <Text style={[
            styles.txnAmount,
            txn.type === 'income' ? styles.incomeValue : styles.expenseValue
          ]}>
            {txn.type === 'income' ? '+' : '-'}{formatAmount(txn.amount)}
          </Text>
          <View style={styles.txnActions}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => navigation.navigate('EditTransaction', { transaction: txn })}
            >
              <Edit2 size={16} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleDelete(txn.id)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDateHeader = (date) => (
    <View style={styles.dateHeader}>
      <Calendar size={14} color="#9ca3af" />
      <Text style={styles.dateText}>{formatDate(date)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? '#7c3aed' : '#9ca3af'} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'income' && styles.filterChipActive]}
            onPress={() => setFilterType('income')}
          >
            <Text style={[styles.filterChipText, filterType === 'income' && styles.filterChipTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'expense' && styles.filterChipActive]}
            onPress={() => setFilterType('expense')}
          >
            <Text style={[styles.filterChipText, filterType === 'expense' && styles.filterChipTextActive]}>
              Expenses
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {groupedTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View>
              {renderDateHeader(item.date)}
              {item.data.map(txn => (
                <View key={txn.id}>
                  {renderTransaction({ item: txn })}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterBtnActive: {
    backgroundColor: '#7c3aed20'
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 20
  },
  filterChipActive: {
    backgroundColor: '#7c3aed'
  },
  filterChipText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500'
  },
  filterChipTextActive: {
    color: '#fff'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8
  },
  dateText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500'
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
  txnRight: {
    alignItems: 'flex-end'
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  incomeValue: {
    color: '#22c55e'
  },
  expenseValue: {
    color: '#ef4444'
  },
  txnActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8
  },
  actionBtn: {
    padding: 6
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16
  }
});
