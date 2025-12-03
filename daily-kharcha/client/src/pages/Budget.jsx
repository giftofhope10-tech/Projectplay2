import React, { useState, useEffect, useMemo } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { PiggyBank, Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

function Budget() {
  const { transactions, expenseCategories } = useExpense()
  const [budgets, setBudgets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets')
      if (res.ok) {
        const data = await res.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const currentMonthExpenses = useMemo(() => {
    const now = new Date()
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
    
    return transactions
      .filter(t => t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount)
        return acc
      }, {})
  }, [transactions])

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0)
  const totalSpent = Object.values(currentMonthExpenses).reduce((sum, amount) => sum + amount, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCategory || !budgetAmount) return
    
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          amount: parseFloat(budgetAmount),
          period: 'monthly'
        })
      })
      
      if (res.ok) {
        await fetchBudgets()
        setShowForm(false)
        setSelectedCategory('')
        setBudgetAmount('')
      }
    } catch (error) {
      console.error('Error saving budget:', error)
    }
  }

  const deleteBudget = async (id) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBudgets(prev => prev.filter(b => b.id !== id))
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const getCategory = (categoryId) => {
    return expenseCategories.find(c => c.id === categoryId) || { name: categoryId, emoji: '📦' }
  }

  const getBudgetStatus = (budget) => {
    const spent = currentMonthExpenses[budget.category] || 0
    const percentage = (spent / budget.amount) * 100
    
    if (percentage >= 100) return { status: 'exceeded', color: '#ef4444' }
    if (percentage >= 80) return { status: 'warning', color: '#f59e0b' }
    return { status: 'good', color: '#10b981' }
  }

  const categoriesWithoutBudget = expenseCategories.filter(
    cat => !budgets.find(b => b.category === cat.id)
  )

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
          <h2>Budget</h2>
          <p>Set and track your monthly spending limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Set Budget
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <PiggyBank size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(totalBudget)}</h3>
            <p>Total Budget</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(totalSpent)}</h3>
            <p>Spent This Month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ 
            background: totalBudget - totalSpent >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: totalBudget - totalSpent >= 0 ? 'var(--success)' : 'var(--danger)'
          }}>
            {totalBudget - totalSpent >= 0 ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div className="stat-info">
            <h3 style={{ color: totalBudget - totalSpent >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(Math.abs(totalBudget - totalSpent))}
            </h3>
            <p>{totalBudget - totalSpent >= 0 ? 'Remaining' : 'Over Budget'}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Category Budgets</h3>
          <span className="text-muted">{format(new Date(), 'MMMM yyyy')}</span>
        </div>

        {budgets.length === 0 ? (
          <div className="empty-state">
            <PiggyBank size={48} />
            <h3>No budgets set</h3>
            <p>Create budgets to track your spending by category</p>
          </div>
        ) : (
          <div className="budget-list">
            {budgets.map(budget => {
              const category = getCategory(budget.category)
              const spent = currentMonthExpenses[budget.category] || 0
              const percentage = Math.min((spent / budget.amount) * 100, 100)
              const { status, color } = getBudgetStatus(budget)
              
              return (
                <div key={budget.id} className="budget-item">
                  <div className="budget-header">
                    <div className="budget-category">
                      <span className="budget-emoji">{category.emoji}</span>
                      <div>
                        <h4>{category.name}</h4>
                        <p className="budget-amounts">
                          {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="budget-actions">
                      <span className={`budget-status ${status}`}>
                        {status === 'exceeded' && <AlertTriangle size={14} />}
                        {status === 'warning' && <AlertTriangle size={14} />}
                        {status === 'good' && <CheckCircle size={14} />}
                        {Math.round(percentage)}%
                      </span>
                      <button 
                        className="icon-btn" 
                        onClick={() => deleteBudget(budget.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="budget-progress">
                    <div 
                      className="budget-progress-bar" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                  {status === 'exceeded' && (
                    <p className="budget-warning">
                      Over by {formatCurrency(spent - budget.amount)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set Budget</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-control"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categoriesWithoutBudget.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monthly Budget Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter amount"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Budget
