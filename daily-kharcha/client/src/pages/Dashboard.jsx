import React, { useState, useEffect, useMemo } from 'react'
import { useExpense } from '../context/ExpenseContext'
import TransactionModal from '../components/TransactionModal'
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

function Dashboard() {
  const { 
    transactions, 
    totalIncome, 
    totalExpense, 
    balance,
    incomeCategories,
    expenseCategories,
    deleteTransaction,
    loading 
  } = useExpense()
  
  const [showModal, setShowModal] = useState(false)
  const [monthlyStats, setMonthlyStats] = useState(null)

  useEffect(() => {
    fetchMonthlyStats()
  }, [])

  const fetchMonthlyStats = async () => {
    try {
      const res = await fetch('/api/stats/monthly')
      if (res.ok) {
        const data = await res.json()
        setMonthlyStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCategory = (categoryId, type) => {
    const categories = type === 'income' ? incomeCategories : expenseCategories
    return categories.find(c => c.id === categoryId) || { name: categoryId, emoji: '📌' }
  }

  const recentTransactions = transactions.slice(0, 5)

  const thisMonthExpense = useMemo(() => {
    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
    
    return transactions
      .filter(t => t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  }, [transactions])

  const thisMonthIncome = useMemo(() => {
    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
    
    return transactions
      .filter(t => t.type === 'income' && t.date >= monthStart && t.date <= monthEnd)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  }, [transactions])

  const expenseChange = monthlyStats?.lastMonthExpense 
    ? ((thisMonthExpense - monthlyStats.lastMonthExpense) / monthlyStats.lastMonthExpense * 100).toFixed(0)
    : 0

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's your financial overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(totalIncome)}</h3>
            <p>Total Income</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expense">
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(totalExpense)}</h3>
            <p>Total Expenses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon balance">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <h3 style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(balance)}
            </h3>
            <p>Current Balance</p>
          </div>
        </div>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <h4>This Month's Income</h4>
          <div className="value" style={{ color: 'var(--success)' }}>
            {formatCurrency(thisMonthIncome)}
          </div>
        </div>
        
        <div className="insight-card">
          <h4>This Month's Spending</h4>
          <div className="value" style={{ color: 'var(--danger)' }}>
            {formatCurrency(thisMonthExpense)}
          </div>
          {monthlyStats?.lastMonthExpense > 0 && (
            <div className={`change ${parseFloat(expenseChange) <= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(expenseChange) <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              {Math.abs(expenseChange)}% vs last month
            </div>
          )}
        </div>

        <div className="insight-card">
          <h4>Top Spending Categories</h4>
          <div className="top-category-list">
            {monthlyStats?.topCategories?.slice(0, 3).map((cat, index) => {
              const category = getCategory(cat.category, 'expense')
              return (
                <div key={cat.category} className="top-category-item">
                  <span>{category.emoji} {category.name}</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(cat.total)}</span>
                </div>
              )
            })}
            {(!monthlyStats?.topCategories || monthlyStats.topCategories.length === 0) && (
              <p className="text-muted">No expenses this month</p>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <Wallet size={48} />
            <h3>No transactions yet</h3>
            <p>Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="transaction-list">
            {recentTransactions.map(transaction => {
              const category = getCategory(transaction.category, transaction.type)
              return (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div 
                      className="transaction-icon" 
                      style={{ 
                        background: transaction.type === 'income' 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : 'rgba(239, 68, 68, 0.15)' 
                      }}
                    >
                      {category.emoji}
                    </div>
                    <div className="transaction-details">
                      <h4>{transaction.description || category.name}</h4>
                      <p>{category.name} • {format(new Date(transaction.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ alignItems: 'center' }}>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <button 
                      className="icon-btn" 
                      onClick={() => deleteTransaction(transaction.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

export default Dashboard
