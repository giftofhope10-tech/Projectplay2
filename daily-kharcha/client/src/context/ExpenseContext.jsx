import React, { createContext, useContext, useState, useEffect } from 'react'

const ExpenseContext = createContext()

const incomeCategories = [
  { id: 'salary', name: 'Salary', emoji: '💰' },
  { id: 'freelance', name: 'Freelance', emoji: '💼' },
  { id: 'investment', name: 'Investment', emoji: '📈' },
  { id: 'gift', name: 'Gift', emoji: '🎁' },
  { id: 'rental', name: 'Rental', emoji: '🏠' },
  { id: 'business', name: 'Business', emoji: '🏪' },
  { id: 'refund', name: 'Refund', emoji: '↩️' },
  { id: 'other_income', name: 'Other', emoji: '💵' }
]

const expenseCategories = [
  { id: 'food', name: 'Food', emoji: '🍔' },
  { id: 'transport', name: 'Transport', emoji: '🚗' },
  { id: 'shopping', name: 'Shopping', emoji: '🛒' },
  { id: 'bills', name: 'Bills', emoji: '📄' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬' },
  { id: 'health', name: 'Health', emoji: '💊' },
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'grocery', name: 'Grocery', emoji: '🥬' },
  { id: 'rent', name: 'Rent', emoji: '🏠' },
  { id: 'utilities', name: 'Utilities', emoji: '💡' },
  { id: 'insurance', name: 'Insurance', emoji: '🛡️' },
  { id: 'other_expense', name: 'Other', emoji: '📦' }
]

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [notes, setNotes] = useState([])
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transRes, notesRes, recurringRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/notes'),
        fetch('/api/recurring')
      ])
      
      if (transRes.ok) {
        const transData = await transRes.json()
        setTransactions(transData)
      }
      
      if (notesRes.ok) {
        const notesData = await notesRes.json()
        setNotes(notesData)
      }

      if (recurringRes.ok) {
        const recurringData = await recurringRes.json()
        setRecurring(recurringData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transaction) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
      
      if (res.ok) {
        const newTransaction = await res.json()
        setTransactions(prev => [newTransaction, ...prev])
        return newTransaction
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const updateTransaction = async (id, transaction) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
      
      if (res.ok) {
        const updatedTransaction = await res.json()
        setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t))
        return updatedTransaction
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  const addNote = async (note) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      })
      
      if (res.ok) {
        const newNote = await res.json()
        setNotes(prev => [newNote, ...prev])
        return newNote
      }
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const deleteNote = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const addRecurring = async (recurringTransaction) => {
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recurringTransaction)
      })
      
      if (res.ok) {
        const newRecurring = await res.json()
        setRecurring(prev => [...prev, newRecurring])
        return newRecurring
      }
    } catch (error) {
      console.error('Error adding recurring:', error)
    }
  }

  const deleteRecurring = async (id) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setRecurring(prev => prev.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Error deleting recurring:', error)
    }
  }

  const toggleRecurring = async (id) => {
    try {
      const res = await fetch(`/api/recurring/${id}/toggle`, {
        method: 'PUT'
      })
      
      if (res.ok) {
        const updated = await res.json()
        setRecurring(prev => prev.map(r => r.id === id ? updated : r))
      }
    } catch (error) {
      console.error('Error toggling recurring:', error)
    }
  }

  const exportCSV = async (startDate, endDate) => {
    try {
      let url = '/api/export/csv'
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`
      }
      
      const res = await fetch(url)
      if (res.ok) {
        const blob = await res.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'transactions.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const balance = totalIncome - totalExpense

  const value = {
    transactions,
    notes,
    recurring,
    loading,
    incomeCategories,
    expenseCategories,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addNote,
    deleteNote,
    addRecurring,
    deleteRecurring,
    toggleRecurring,
    exportCSV,
    totalIncome,
    totalExpense,
    balance,
    refreshData: fetchData
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpense() {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpense must be used within ExpenseProvider')
  }
  return context
}
