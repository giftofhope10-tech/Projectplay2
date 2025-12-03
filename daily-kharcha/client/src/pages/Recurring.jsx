import React, { useState } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { RefreshCw, Plus, Trash2, Power, PowerOff, Calendar } from 'lucide-react'
import { format, addDays, addWeeks, addMonths } from 'date-fns'

const FREQUENCIES = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'biweekly', name: 'Bi-weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'yearly', name: 'Yearly' }
]

function Recurring() {
  const { 
    recurring, 
    incomeCategories, 
    expenseCategories, 
    addRecurring, 
    deleteRecurring, 
    toggleRecurring,
    loading 
  } = useExpense()
  
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('expense')
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    nextDate: format(new Date(), 'yyyy-MM-dd')
  })

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

  const getNextDateLabel = (nextDate, frequency) => {
    const date = new Date(nextDate)
    const today = new Date()
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return format(date, 'MMM d, yyyy')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.category || !formData.amount) return
    
    await addRecurring({
      type,
      ...formData,
      amount: parseFloat(formData.amount)
    })
    
    setShowForm(false)
    setFormData({
      amount: '',
      category: '',
      description: '',
      frequency: 'monthly',
      nextDate: format(new Date(), 'yyyy-MM-dd')
    })
  }

  const categories = type === 'income' ? incomeCategories : expenseCategories
  
  const activeRecurring = recurring.filter(r => r.isActive)
  const inactiveRecurring = recurring.filter(r => !r.isActive)
  
  const monthlyExpenseTotal = recurring
    .filter(r => r.isActive && r.type === 'expense')
    .reduce((sum, r) => {
      let monthlyAmount = parseFloat(r.amount)
      switch(r.frequency) {
        case 'daily': monthlyAmount *= 30; break
        case 'weekly': monthlyAmount *= 4; break
        case 'biweekly': monthlyAmount *= 2; break
        case 'quarterly': monthlyAmount /= 3; break
        case 'yearly': monthlyAmount /= 12; break
      }
      return sum + monthlyAmount
    }, 0)

  const monthlyIncomeTotal = recurring
    .filter(r => r.isActive && r.type === 'income')
    .reduce((sum, r) => {
      let monthlyAmount = parseFloat(r.amount)
      switch(r.frequency) {
        case 'daily': monthlyAmount *= 30; break
        case 'weekly': monthlyAmount *= 4; break
        case 'biweekly': monthlyAmount *= 2; break
        case 'quarterly': monthlyAmount /= 3; break
        case 'yearly': monthlyAmount /= 12; break
      }
      return sum + monthlyAmount
    }, 0)

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
          <h2>Recurring Transactions</h2>
          <p>Manage your regular income and expenses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Recurring
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon income">
            <RefreshCw size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(monthlyIncomeTotal)}</h3>
            <p>Monthly Recurring Income</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expense">
            <RefreshCw size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(monthlyExpenseTotal)}</h3>
            <p>Monthly Recurring Expenses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon balance">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{recurring.length}</h3>
            <p>Total Recurring Items</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Active Recurring</h3>
          <span className="text-muted">{activeRecurring.length} items</span>
        </div>

        {activeRecurring.length === 0 ? (
          <div className="empty-state">
            <RefreshCw size={48} />
            <h3>No recurring transactions</h3>
            <p>Add recurring bills, subscriptions, or income</p>
          </div>
        ) : (
          <div className="transaction-list">
            {activeRecurring.map(item => {
              const category = getCategory(item.category, item.type)
              return (
                <div key={item.id} className="transaction-item">
                  <div className="transaction-info">
                    <div 
                      className="transaction-icon" 
                      style={{ 
                        background: item.type === 'income' 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : 'rgba(239, 68, 68, 0.15)' 
                      }}
                    >
                      {category.emoji}
                    </div>
                    <div className="transaction-details">
                      <h4>{item.description || category.name}</h4>
                      <p>
                        <span className={`badge badge-${item.type}`}>{item.type}</span>
                        {' • '}{FREQUENCIES.find(f => f.id === item.frequency)?.name}
                        {' • '}{getNextDateLabel(item.nextDate, item.frequency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ alignItems: 'center' }}>
                    <span className={`transaction-amount ${item.type}`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </span>
                    <button 
                      className="icon-btn" 
                      onClick={() => toggleRecurring(item.id)}
                      title="Pause"
                      style={{ color: 'var(--warning)' }}
                    >
                      <PowerOff size={16} />
                    </button>
                    <button 
                      className="icon-btn" 
                      onClick={() => deleteRecurring(item.id)}
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

      {inactiveRecurring.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Paused</h3>
            <span className="text-muted">{inactiveRecurring.length} items</span>
          </div>

          <div className="transaction-list">
            {inactiveRecurring.map(item => {
              const category = getCategory(item.category, item.type)
              return (
                <div key={item.id} className="transaction-item" style={{ opacity: 0.6 }}>
                  <div className="transaction-info">
                    <div 
                      className="transaction-icon" 
                      style={{ background: 'rgba(100, 116, 139, 0.15)' }}
                    >
                      {category.emoji}
                    </div>
                    <div className="transaction-details">
                      <h4>{item.description || category.name}</h4>
                      <p>{FREQUENCIES.find(f => f.id === item.frequency)?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ alignItems: 'center' }}>
                    <span className="transaction-amount" style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(item.amount)}
                    </span>
                    <button 
                      className="icon-btn" 
                      onClick={() => toggleRecurring(item.id)}
                      title="Activate"
                      style={{ color: 'var(--success)' }}
                    >
                      <Power size={16} />
                    </button>
                    <button 
                      className="icon-btn" 
                      onClick={() => deleteRecurring(item.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Recurring Transaction</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <div className="type-toggle">
              <button 
                className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => {
                  setType('expense')
                  setFormData({ ...formData, category: '' })
                }}
              >
                Expense
              </button>
              <button 
                className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                onClick={() => {
                  setType('income')
                  setFormData({ ...formData, category: '' })
                }}
              >
                Income
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <div className="category-grid">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className={`category-item ${formData.category === cat.id ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                    >
                      <span>{cat.emoji}</span>
                      <p>{cat.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Netflix, Rent, Salary"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Frequency</label>
                  <select 
                    className="form-control"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Next Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.nextDate}
                    onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Recurring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Recurring
