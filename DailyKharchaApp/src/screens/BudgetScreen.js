import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { 
  Plus, 
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react-native';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { categories } from '../config/currencies';

export default function BudgetScreen() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useExpense();
  const { getCurrency, settings } = useSettings();
  const currency = getCurrency();

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const formatAmount = (amount) => {
    return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
  };

  const budgetProgress = useMemo(() => {
    const now = new Date();
    const monthlyExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear();
    });

    return budgets.map(budget => {
      const spent = monthlyExpenses
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const isOverBudget = percentage > 100;
      const isWarning = percentage >= settings.reminders.budgetThreshold;

      return {
        ...budget,
        spent,
        percentage,
        isOverBudget,
        isWarning
      };
    });
  }, [budgets, transactions, settings.reminders.budgetThreshold]);

  const handleAddBudget = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const exists = budgets.find(b => b.category === selectedCategory);
    if (exists) {
      await updateBudget(exists.id, { amount: parseFloat(budgetAmount) });
    } else {
      await addBudget({
        category: selectedCategory,
        amount: parseFloat(budgetAmount)
      });
    }

    setShowModal(false);
    setSelectedCategory('');
    setBudgetAmount('');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteBudget(id)
        }
      ]
    );
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  };

  const availableCategories = categories.filter(
    c => !['salary', 'investment'].includes(c.id) && 
         !budgets.find(b => b.category === c.id)
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {budgetProgress.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No budgets set</Text>
            <Text style={styles.emptyText}>
              Create budgets to track your spending by category
            </Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => setShowModal(true)}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetList}>
            {budgetProgress.map(budget => {
              const category = getCategoryInfo(budget.category);
              return (
                <View 
                  key={budget.id} 
                  style={[
                    styles.budgetCard,
                    budget.isOverBudget && styles.budgetCardDanger,
                    budget.isWarning && !budget.isOverBudget && styles.budgetCardWarning
                  ]}
                >
                  <View style={styles.budgetHeader}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(budget.id)}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.budgetStats}>
                    <Text style={styles.spentAmount}>
                      {formatAmount(budget.spent)}
                    </Text>
                    <Text style={styles.budgetAmount}>
                      / {formatAmount(budget.amount)}
                    </Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.isOverBudget 
                            ? '#ef4444' 
                            : budget.isWarning 
                              ? '#f97316' 
                              : '#22c55e'
                        }
                      ]} 
                    />
                  </View>

                  <View style={styles.budgetFooter}>
                    <Text style={[
                      styles.percentText,
                      budget.isOverBudget && styles.dangerText,
                      budget.isWarning && !budget.isOverBudget && styles.warningText
                    ]}>
                      {budget.percentage.toFixed(0)}% used
                    </Text>
                    {budget.isOverBudget && (
                      <View style={styles.alertBadge}>
                        <AlertTriangle size={14} color="#ef4444" />
                        <Text style={styles.alertText}>Over budget!</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {budgetProgress.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setShowModal(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Budget</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {availableCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && { backgroundColor: cat.color }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id && styles.categoryChipTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Monthly Budget</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <TextInput
                style={styles.amountField}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={budgetAmount}
                onChangeText={setBudgetAmount}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddBudget}>
              <Text style={styles.saveBtnText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  budgetList: {
    padding: 16,
    paddingBottom: 100
  },
  budgetCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  budgetCardWarning: {
    borderWidth: 1,
    borderColor: '#f9731650'
  },
  budgetCardDanger: {
    borderWidth: 1,
    borderColor: '#ef444450'
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  budgetStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },
  spentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  budgetAmount: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 4
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3d3d5c',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  percentText: {
    fontSize: 14,
    color: '#22c55e'
  },
  warningText: {
    color: '#f97316'
  },
  dangerText: {
    color: '#ef4444'
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  alertText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500'
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#2d2d44',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  inputLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8
  },
  categoryScroll: {
    marginBottom: 20
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    marginRight: 8
  },
  categoryChipText: {
    color: '#9ca3af',
    fontSize: 14
  },
  categoryChipTextActive: {
    color: '#fff'
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed'
  },
  amountField: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 16
  },
  saveBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
});
