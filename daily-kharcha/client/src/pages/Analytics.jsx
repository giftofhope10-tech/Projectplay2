import React, { useState, useEffect } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { 
  TrendingUp, TrendingDown, Activity, AlertTriangle, 
  CheckCircle, Info, Zap, PiggyBank, Target, Calendar
} from 'lucide-react'
import { format } from 'date-fns'

function Analytics() {
  const { transactions, incomeCategories, expenseCategories } = useExpense()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [transactions])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const getCategory = (categoryId, type) => {
    const categories = type === 'income' ? incomeCategories : expenseCategories
    return categories.find(c => c.id === categoryId) || { name: categoryId, emoji: '📌' }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />
      case 'warning': return <AlertTriangle size={20} />
      case 'info': return <Info size={20} />
      default: return <Zap size={20} />
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="empty-state">
        <Activity size={48} />
        <h3>No data available</h3>
        <p>Add some transactions to see your analytics</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Insights and patterns from your financial data</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>{analytics.totalTransactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <PiggyBank size={24} />
          </div>
          <div className="stat-info">
            <h3>{analytics.savingsRate}%</h3>
            <p>Savings Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(analytics.avgDailySpend)}</h3>
            <p>Avg Daily Spend</p>
          </div>
        </div>
      </div>

      {analytics.insights && analytics.insights.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Smart Insights</h3>
            <Zap size={18} style={{ color: 'var(--warning)' }} />
          </div>
          
          <div className="insights-list">
            {analytics.insights.map((insight, index) => (
              <div key={index} className={`insight-item insight-${insight.type}`}>
                <div className="insight-icon">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">This Month</h3>
          </div>
          <div className="analytics-summary">
            <div className="analytics-row">
              <span>Income</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                {formatCurrency(analytics.currentMonth?.income)}
              </span>
            </div>
            <div className="analytics-row">
              <span>Expenses</span>
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                {formatCurrency(analytics.currentMonth?.expense)}
              </span>
            </div>
            <div className="analytics-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Net</span>
              <span style={{ 
                color: (analytics.currentMonth?.income - analytics.currentMonth?.expense) >= 0 ? 'var(--success)' : 'var(--danger)', 
                fontWeight: 700 
              }}>
                {formatCurrency(analytics.currentMonth?.income - analytics.currentMonth?.expense)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Last Month</h3>
          </div>
          <div className="analytics-summary">
            <div className="analytics-row">
              <span>Income</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                {formatCurrency(analytics.lastMonth?.income)}
              </span>
            </div>
            <div className="analytics-row">
              <span>Expenses</span>
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                {formatCurrency(analytics.lastMonth?.expense)}
              </span>
            </div>
            <div className="analytics-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Net</span>
              <span style={{ 
                color: (analytics.lastMonth?.income - analytics.lastMonth?.expense) >= 0 ? 'var(--success)' : 'var(--danger)', 
                fontWeight: 700 
              }}>
                {formatCurrency(analytics.lastMonth?.income - analytics.lastMonth?.expense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Average Transaction</h3>
          </div>
          <div className="analytics-summary">
            <div className="analytics-row">
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <TrendingUp size={16} style={{ color: 'var(--success)' }} />
                <span>Income</span>
              </div>
              <span style={{ fontWeight: 600 }}>{formatCurrency(analytics.avgIncome)}</span>
            </div>
            <div className="analytics-row">
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
                <span>Expense</span>
              </div>
              <span style={{ fontWeight: 600 }}>{formatCurrency(analytics.avgExpense)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Spending Pattern</h3>
          </div>
          {analytics.spendingByDay ? (
            <div className="analytics-summary">
              <div className="analytics-row">
                <span>Highest spending day</span>
                <span style={{ fontWeight: 600, color: 'var(--warning)' }}>
                  {analytics.spendingByDay.day}
                </span>
              </div>
              <div className="analytics-row">
                <span>Total on {analytics.spendingByDay.day}s</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(analytics.spendingByDay.total)}</span>
              </div>
              <div className="analytics-row">
                <span>Transactions</span>
                <span style={{ fontWeight: 600 }}>{analytics.spendingByDay.count}</span>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <p>Not enough data</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {analytics.biggestExpense && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Biggest Expense</h3>
              <TrendingDown size={18} style={{ color: 'var(--danger)' }} />
            </div>
            <div className="highlight-transaction">
              <div className="highlight-emoji">
                {getCategory(analytics.biggestExpense.category, 'expense').emoji}
              </div>
              <div className="highlight-info">
                <h4>{analytics.biggestExpense.description || getCategory(analytics.biggestExpense.category, 'expense').name}</h4>
                <p>{format(new Date(analytics.biggestExpense.date), 'MMM d, yyyy')}</p>
              </div>
              <div className="highlight-amount expense">
                {formatCurrency(analytics.biggestExpense.amount)}
              </div>
            </div>
          </div>
        )}

        {analytics.biggestIncome && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Biggest Income</h3>
              <TrendingUp size={18} style={{ color: 'var(--success)' }} />
            </div>
            <div className="highlight-transaction">
              <div className="highlight-emoji">
                {getCategory(analytics.biggestIncome.category, 'income').emoji}
              </div>
              <div className="highlight-info">
                <h4>{analytics.biggestIncome.description || getCategory(analytics.biggestIncome.category, 'income').name}</h4>
                <p>{format(new Date(analytics.biggestIncome.date), 'MMM d, yyyy')}</p>
              </div>
              <div className="highlight-amount income">
                {formatCurrency(analytics.biggestIncome.amount)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
