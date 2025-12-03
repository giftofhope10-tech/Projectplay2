import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calendar,
  Tag,
  FileText,
  Check
} from 'lucide-react-native';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { categories } from '../config/currencies';

export default function AddTransactionScreen({ navigation, route }) {
  const { addTransaction, updateTransaction } = useExpense();
  const { getCurrency } = useSettings();
  const currency = getCurrency();
  
  const editTransaction = route?.params?.transaction;
  const isEditing = !!editTransaction;

  const [type, setType] = useState(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [category, setCategory] = useState(editTransaction?.category || 'other');
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date
    };

    if (isEditing) {
      await updateTransaction(editTransaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
          onPress={() => setType('expense')}
        >
          <ArrowDownCircle size={24} color={type === 'expense' ? '#fff' : '#ef4444'} />
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
          onPress={() => setType('income')}
        >
          <ArrowUpCircle size={24} color={type === 'income' ? '#fff' : '#22c55e'} />
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currencySymbol}>{currency.symbol}</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          placeholderTextColor="#4b5563"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.inputLabel}>
          <FileText size={18} color="#9ca3af" />
          <Text style={styles.labelText}>Description</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Enter description"
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.inputLabel}>
          <Calendar size={18} color="#9ca3af" />
          <Text style={styles.labelText}>Date</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.inputLabel}>
          <Tag size={18} color="#9ca3af" />
          <Text style={styles.labelText}>Category</Text>
        </View>
        <View style={styles.categoryGrid}>
          {categories.filter(c => 
            type === 'income' 
              ? ['salary', 'investment', 'other'].includes(c.id)
              : !['salary', 'investment'].includes(c.id)
          ).map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                category === cat.id && { backgroundColor: cat.color }
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[
                styles.categoryText,
                category === cat.id && styles.categoryTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Check size={24} color="#fff" />
        <Text style={styles.saveBtnText}>
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 16
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    gap: 8
  },
  typeBtnExpense: {
    backgroundColor: '#ef4444'
  },
  typeBtnIncome: {
    backgroundColor: '#22c55e'
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af'
  },
  typeTextActive: {
    color: '#fff'
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 100,
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: 20
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  labelText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500'
  },
  textInput: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2d2d44',
    borderRadius: 20
  },
  categoryText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500'
  },
  categoryTextActive: {
    color: '#fff'
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 40,
    gap: 8
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
});
