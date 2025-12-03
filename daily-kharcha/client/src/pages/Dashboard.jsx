import React, { useState, useEffect, useMemo } from 'react'
import { useExpense } from '../context/ExpenseContext'
import TransactionModal from '../components/TransactionModal'
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useNavigate } from 'react-router-dom'

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
  
  const navigate = useNavigate()
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

  const recentTransactions = transactions.slice(0, 6)

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
        <p>Loading your financial data...</p>
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
        <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add Transaction
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon income">
            <TrendingUp size={26} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Income</p>
            <h3 style={{ color: 'var(--success)' }}>{formatCurrency(totalIncome)}</h3>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon expense">
            <TrendingDown size={26} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Expenses</p>
            <h3 style={{ color: 'var(--danger)' }}>{formatCurrency(totalExpense)}</h3>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon balance">
            <Wallet size={26} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Current Balance</p>
            <h3 style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(balance)}
            </h3>
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
          <h4>Top Categories</h4>
          <div className="top-category-list">
            {monthlyStats?.topCategories?.slice(0, 3).map((cat) => {
              const category = getCategory(cat.category, 'expense')
              return (
                <div key={cat.category} className="top-category-item">
                  <span>{category.emoji} {category.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(cat.total)}</span>
                </div>
              )
            })}
            {(!monthlyStats?.topCategories || monthlyStats.topCategories.length === 0) && (
              <p className="text-muted" style={{ padding: '8px 0' }}>No expenses this month</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
          {transactions.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/transactions')}>
              View All
              <ChevronRight size={16} />
            </button>
          )}
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <Wallet size={56} strokeWidth={1.5} />
            <h3>No transactions yet</h3>
            <p>Start tracking your finances by adding your first transaction</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '16px' }}>
              <Plus size={18} />
              Add Transaction
            </button>
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
                          ? 'var(--success-light)' 
                          : 'var(--danger-light)' 
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
                      className="icon-btn danger" 
                      onClick={() => deleteTransaction(transaction.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
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
