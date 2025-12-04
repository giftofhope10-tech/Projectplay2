import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import NetInfo from '@react-native-community/netinfo';

const ExpenseContext = createContext();

export function useExpense() {
  return useContext(ExpenseContext);
}

export function ExpenseProvider({ children }) {
  const { user, isOnline, firebaseAvailable } = useAuth();
  const { settings, updateLastSync } = useSettings();
  
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState([]);

  useEffect(() => {
    loadLocalData();
  }, []);

  useEffect(() => {
    if (user && isOnline && settings.syncEnabled && firebaseAvailable && db) {
      syncWithCloud();
    }
  }, [user, isOnline, settings.syncEnabled, firebaseAvailable]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && pendingSync.length > 0 && user && firebaseAvailable && db) {
        syncPendingChanges();
      }
    });

    return () => unsubscribe();
  }, [pendingSync, user, firebaseAvailable]);

  const loadLocalData = async () => {
    try {
      const [txns, budgetData, goalData, recurringData, pending] = await Promise.all([
        AsyncStorage.getItem('transactions'),
        AsyncStorage.getItem('budgets'),
        AsyncStorage.getItem('goals'),
        AsyncStorage.getItem('recurring'),
        AsyncStorage.getItem('pendingSync')
      ]);

      if (txns) setTransactions(JSON.parse(txns));
      if (budgetData) setBudgets(JSON.parse(budgetData));
      if (goalData) setGoals(JSON.parse(goalData));
      if (recurringData) setRecurring(JSON.parse(recurringData));
      if (pending) setPendingSync(JSON.parse(pending));
    } catch (error) {
      console.error('Error loading local data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLocalData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving local data:', error);
    }
  };

  const addPendingSync = async (action) => {
    const updated = [...pendingSync, action];
    setPendingSync(updated);
    await AsyncStorage.setItem('pendingSync', JSON.stringify(updated));
  };

  const syncPendingChanges = async () => {
    if (!user || pendingSync.length === 0 || !db) return;

    setSyncing(true);
    try {
      const batch = writeBatch(db);
      
      for (const action of pendingSync) {
        const docRef = doc(db, `users/${user.uid}/${action.collection}`, action.id);
        
        if (action.type === 'delete') {
          batch.delete(docRef);
        } else {
          batch.set(docRef, { ...action.data, updatedAt: serverTimestamp() }, { merge: true });
        }
      }

      await batch.commit();
      setPendingSync([]);
      await AsyncStorage.removeItem('pendingSync');
      await updateLastSync();
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    } finally {
      setSyncing(false);
    }
  };

  const syncWithCloud = async () => {
    if (!user || !db) return;

    setSyncing(true);
    try {
      const transactionsRef = collection(db, `users/${user.uid}/transactions`);
      const budgetsRef = collection(db, `users/${user.uid}/budgets`);
      const goalsRef = collection(db, `users/${user.uid}/goals`);
      const recurringRef = collection(db, `users/${user.uid}/recurring`);

      const [txnSnap, budgetSnap, goalSnap, recurringSnap] = await Promise.all([
        getDocs(query(transactionsRef, orderBy('date', 'desc'))),
        getDocs(budgetsRef),
        getDocs(goalsRef),
        getDocs(recurringRef)
      ]);

      const cloudTxns = txnSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const cloudBudgets = budgetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const cloudGoals = goalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const cloudRecurring = recurringSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setTransactions(cloudTxns);
      setBudgets(cloudBudgets);
      setGoals(cloudGoals);
      setRecurring(cloudRecurring);

      await Promise.all([
        saveLocalData('transactions', cloudTxns),
        saveLocalData('budgets', cloudBudgets),
        saveLocalData('goals', cloudGoals),
        saveLocalData('recurring', cloudRecurring)
      ]);

      await updateLastSync();
    } catch (error) {
      console.error('Error syncing with cloud:', error);
    } finally {
      setSyncing(false);
    }
  };

  const addTransaction = async (transaction) => {
    const id = Date.now().toString();
    const newTransaction = {
      id,
      ...transaction,
      createdAt: new Date().toISOString()
    };

    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    await saveLocalData('transactions', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/transactions`, id), {
          ...newTransaction,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        await addPendingSync({ type: 'add', collection: 'transactions', id, data: newTransaction });
      }
    } else if (user && db) {
      await addPendingSync({ type: 'add', collection: 'transactions', id, data: newTransaction });
    }

    return newTransaction;
  };

  const updateTransaction = async (id, updates) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    setTransactions(updated);
    await saveLocalData('transactions', updated);

    const updatedTxn = updated.find(t => t.id === id);
    
    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/transactions`, id), updatedTxn, { merge: true });
      } catch (error) {
        await addPendingSync({ type: 'update', collection: 'transactions', id, data: updatedTxn });
      }
    } else if (user && db) {
      await addPendingSync({ type: 'update', collection: 'transactions', id, data: updatedTxn });
    }
  };

  const deleteTransaction = async (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await saveLocalData('transactions', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
      } catch (error) {
        await addPendingSync({ type: 'delete', collection: 'transactions', id });
      }
    } else if (user && db) {
      await addPendingSync({ type: 'delete', collection: 'transactions', id });
    }
  };

  const addBudget = async (budget) => {
    const id = Date.now().toString();
    const newBudget = { id, ...budget, spent: 0 };

    const updated = [...budgets, newBudget];
    setBudgets(updated);
    await saveLocalData('budgets', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/budgets`, id), newBudget);
      } catch (error) {
        await addPendingSync({ type: 'add', collection: 'budgets', id, data: newBudget });
      }
    } else if (user && db) {
      await addPendingSync({ type: 'add', collection: 'budgets', id, data: newBudget });
    }

    return newBudget;
  };

  const updateBudget = async (id, updates) => {
    const updated = budgets.map(b => b.id === id ? { ...b, ...updates } : b);
    setBudgets(updated);
    await saveLocalData('budgets', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/budgets`, id), updated.find(b => b.id === id), { merge: true });
      } catch (error) {
        console.error('Error updating budget:', error);
      }
    }
  };

  const deleteBudget = async (id) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    await saveLocalData('budgets', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/budgets`, id));
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const addGoal = async (goal) => {
    const id = Date.now().toString();
    const newGoal = { id, ...goal, saved: 0 };

    const updated = [...goals, newGoal];
    setGoals(updated);
    await saveLocalData('goals', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/goals`, id), newGoal);
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    }

    return newGoal;
  };

  const updateGoal = async (id, updates) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(updated);
    await saveLocalData('goals', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/goals`, id), updated.find(g => g.id === id), { merge: true });
      } catch (error) {
        console.error('Error updating goal:', error);
      }
    }
  };

  const deleteGoal = async (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await saveLocalData('goals', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/goals`, id));
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const addRecurring = async (item) => {
    const id = Date.now().toString();
    const newRecurring = { id, ...item, lastProcessed: null };

    const updated = [...recurring, newRecurring];
    setRecurring(updated);
    await saveLocalData('recurring', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await setDoc(doc(db, `users/${user.uid}/recurring`, id), newRecurring);
      } catch (error) {
        console.error('Error adding recurring:', error);
      }
    }

    return newRecurring;
  };

  const deleteRecurring = async (id) => {
    const updated = recurring.filter(r => r.id !== id);
    setRecurring(updated);
    await saveLocalData('recurring', updated);

    if (user && isOnline && settings.syncEnabled && db) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/recurring`, id));
      } catch (error) {
        console.error('Error deleting recurring:', error);
      }
    }
  };

  const getStats = () => {
    const now = new Date();
    const thisMonth = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const income = thisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = thisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };

  const value = {
    transactions,
    budgets,
    goals,
    recurring,
    loading,
    syncing,
    pendingSync,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addRecurring,
    deleteRecurring,
    getStats,
    syncWithCloud
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}
