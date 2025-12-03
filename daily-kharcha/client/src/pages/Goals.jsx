import React, { useState, useEffect } from 'react'
import { Target, Plus, Trash2, TrendingUp, Calendar, Gift } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

const GOAL_EMOJIS = ['🎯', '🏠', '✈️', '🚗', '💍', '📱', '💻', '🎓', '💪', '🎁', '💰', '🏖️']
const GOAL_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6']

function Goals() {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showAddAmount, setShowAddAmount] = useState(null)
  const [addAmountValue, setAddAmountValue] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    emoji: '🎯',
    color: '#6366f1'
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount) || 0
        })
      })
      
      if (res.ok) {
        await fetchGoals()
        setShowForm(false)
        setFormData({
          name: '',
          targetAmount: '',
          currentAmount: '',
          deadline: '',
          emoji: '🎯',
          color: '#6366f1'
        })
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleAddAmount = async (goalId) => {
    if (!addAmountValue || parseFloat(addAmountValue) <= 0) return
    
    try {
      const res = await fetch(`/api/goals/${goalId}/add-amount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(addAmountValue) })
      })
      
      if (res.ok) {
        await fetchGoals()
        setShowAddAmount(null)
        setAddAmountValue('')
      }
    } catch (error) {
      console.error('Error adding amount:', error)
    }
  }

  const deleteGoal = async (id) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setGoals(prev => prev.filter(g => g.id !== id))
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const getProgress = (goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null
    const days = differenceInDays(new Date(deadline), new Date())
    return days
  }

  const totalSaved = goals.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0)
  const totalTarget = goals.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0)
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length

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
          <h2>Savings Goals</h2>
          <p>Track your savings and achieve your dreams</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          New Goal
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(totalSaved)}</h3>
            <p>Total Saved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>{formatCurrency(totalTarget)}</h3>
            <p>Total Target</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: 'var(--warning)' }}>
            <Gift size={24} />
          </div>
          <div className="stat-info">
            <h3>{completedGoals} / {goals.length}</h3>
            <p>Goals Completed</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Goals</h3>
        </div>

        {goals.length === 0 ? (
          <div className="empty-state">
            <Target size={48} />
            <h3>No savings goals yet</h3>
            <p>Create your first goal to start tracking your savings</p>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map(goal => {
              const progress = getProgress(goal)
              const daysRemaining = getDaysRemaining(goal.deadline)
              const isCompleted = goal.currentAmount >= goal.targetAmount
              
              return (
                <div key={goal.id} className="goal-item" style={{ borderLeftColor: goal.color }}>
                  <div className="goal-header">
                    <div className="goal-info">
                      <span className="goal-emoji">{goal.emoji}</span>
                      <div>
                        <h4>{goal.name}</h4>
                        <p className="goal-amounts">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="goal-actions">
                      {daysRemaining !== null && !isCompleted && (
                        <span className={`goal-deadline ${daysRemaining < 30 ? 'urgent' : ''}`}>
                          <Calendar size={12} />
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="goal-completed">Completed!</span>
                      )}
                      <button 
                        className="icon-btn" 
                        onClick={() => deleteGoal(goal.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="goal-progress">
                    <div 
                      className="goal-progress-bar" 
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: isCompleted ? 'var(--success)' : goal.color
                      }}
                    />
                  </div>
                  
                  <div className="goal-footer">
                    <span className="goal-percentage">{progress.toFixed(0)}% complete</span>
                    {!isCompleted && (
                      showAddAmount === goal.id ? (
                        <div className="add-amount-form">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Amount"
                            value={addAmountValue}
                            onChange={(e) => setAddAmountValue(e.target.value)}
                            style={{ width: '100px', padding: '0.375rem' }}
                          />
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddAmount(goal.id)}
                          >
                            Add
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setShowAddAmount(null)
                              setAddAmountValue('')
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowAddAmount(goal.id)}
                        >
                          <Plus size={14} />
                          Add Savings
                        </button>
                      )
                    )}
                  </div>
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
              <h3>Create Savings Goal</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., New Car, Vacation, Emergency Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Choose Icon</label>
                <div className="emoji-grid">
                  {GOAL_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`emoji-btn ${formData.emoji === emoji ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, emoji })}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Choose Color</label>
                <div className="color-grid">
                  {GOAL_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-btn ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Target Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter target"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Already Saved</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target Date (Optional)</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals
