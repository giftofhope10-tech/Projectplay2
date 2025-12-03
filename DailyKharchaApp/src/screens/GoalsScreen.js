import React, { useState } from 'react';
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
  Target,
  TrendingUp
} from 'lucide-react-native';
import { useExpense } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';

export default function GoalsScreen() {
  const { goals, addGoal, updateGoal, deleteGoal } = useExpense();
  const { getCurrency } = useSettings();
  const currency = getCurrency();

  const [showModal, setShowModal] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [addAmount, setAddAmount] = useState('');

  const formatAmount = (amount) => {
    return `${currency.symbol}${amount.toLocaleString('en-IN')}`;
  };

  const handleAddGoal = async () => {
    if (!goalName.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }
    if (!goalTarget || parseFloat(goalTarget) <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    await addGoal({
      name: goalName.trim(),
      target: parseFloat(goalTarget),
      saved: 0
    });

    setShowModal(false);
    setGoalName('');
    setGoalTarget('');
  };

  const handleAddFunds = async (goalId) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      await updateGoal(goalId, {
        saved: goal.saved + parseFloat(addAmount)
      });
    }

    setShowAddFunds(null);
    setAddAmount('');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this savings goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteGoal(id)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={64} color="#7c3aed" />
            <Text style={styles.emptyTitle}>No savings goals</Text>
            <Text style={styles.emptyText}>
              Create goals to save for things that matter to you
            </Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => setShowModal(true)}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addBtnText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalList}>
            {goals.map(goal => {
              const percentage = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
              const remaining = goal.target - goal.saved;
              const isComplete = percentage >= 100;

              return (
                <View 
                  key={goal.id} 
                  style={[styles.goalCard, isComplete && styles.goalCardComplete]}
                >
                  <View style={styles.goalHeader}>
                    <View style={styles.goalInfo}>
                      <Target size={20} color={isComplete ? '#22c55e' : '#7c3aed'} />
                      <Text style={styles.goalName}>{goal.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(goal.id)}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.goalStats}>
                    <View>
                      <Text style={styles.savedLabel}>Saved</Text>
                      <Text style={[styles.savedAmount, isComplete && styles.completeText]}>
                        {formatAmount(goal.saved)}
                      </Text>
                    </View>
                    <View style={styles.targetInfo}>
                      <Text style={styles.targetLabel}>Target</Text>
                      <Text style={styles.targetAmount}>{formatAmount(goal.target)}</Text>
                    </View>
                  </View>

                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isComplete ? '#22c55e' : '#7c3aed'
                        }
                      ]} 
                    />
                  </View>

                  <View style={styles.goalFooter}>
                    <Text style={styles.percentText}>
                      {percentage.toFixed(0)}% complete
                    </Text>
                    {!isComplete && (
                      <Text style={styles.remainingText}>
                        {formatAmount(remaining)} left
                      </Text>
                    )}
                  </View>

                  {!isComplete && (
                    <TouchableOpacity 
                      style={styles.addFundsBtn}
                      onPress={() => setShowAddFunds(goal.id)}
                    >
                      <TrendingUp size={18} color="#7c3aed" />
                      <Text style={styles.addFundsBtnText}>Add Funds</Text>
                    </TouchableOpacity>
                  )}

                  {isComplete && (
                    <View style={styles.completeBadge}>
                      <Text style={styles.completeText}>Goal Achieved!</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {goals.length > 0 && (
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
              <Text style={styles.modalTitle}>New Savings Goal</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Goal Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., New Phone, Vacation"
              placeholderTextColor="#9ca3af"
              value={goalName}
              onChangeText={setGoalName}
            />

            <Text style={styles.inputLabel}>Target Amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <TextInput
                style={styles.amountField}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={goalTarget}
                onChangeText={setGoalTarget}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddGoal}>
              <Text style={styles.saveBtnText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddFunds !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds</Text>
              <TouchableOpacity onPress={() => setShowAddFunds(null)}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Amount to Add</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <TextInput
                style={styles.amountField}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={addAmount}
                onChangeText={setAddAmount}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => handleAddFunds(showAddFunds)}
            >
              <Text style={styles.saveBtnText}>Add Funds</Text>
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
    marginTop: 16,
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
  goalList: {
    padding: 16,
    paddingBottom: 100
  },
  goalCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  goalCardComplete: {
    borderWidth: 1,
    borderColor: '#22c55e50'
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  savedLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },
  savedAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginTop: 4
  },
  targetInfo: {
    alignItems: 'flex-end'
  },
  targetLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },
  targetAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4
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
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  percentText: {
    fontSize: 14,
    color: '#7c3aed'
  },
  remainingText: {
    fontSize: 14,
    color: '#9ca3af'
  },
  addFundsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed20',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8
  },
  addFundsBtnText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600'
  },
  completeBadge: {
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#22c55e20',
    borderRadius: 12
  },
  completeText: {
    color: '#22c55e',
    fontWeight: '600'
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
    elevation: 8
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
  textInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16
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
