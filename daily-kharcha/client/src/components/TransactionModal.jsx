import React, { useState, useEffect } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

function TransactionModal({ onClose, prefillAmount = null, editTransaction = null }) {
  const { incomeCategories, expenseCategories, addTransaction, updateTransaction } = useExpense()
  
  const [type, setType] = useState(editTransaction?.type || 'expense')
  const [amount, setAmount] = useState(editTransaction ? String(editTransaction.amount) : (prefillAmount ? String(prefillAmount) : ''))
  const [category, setCategory] = useState(editTransaction?.category || '')
  const [description, setDescription] = useState(editTransaction?.description || '')
  const [date, setDate] = useState(editTransaction ? format(new Date(editTransaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)

  const isEditing = !!editTransaction

  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  const categories = type === 'income' ? incomeCategories : expenseCategories

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !category) return

    setLoading(true)
    
    const transactionData = {
      type,
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date: new Date(date).toISOString()
    }

    if (isEditing) {
      await updateTransaction(editTransaction.id, transactionData)
    } else {
      await addTransaction(transactionData)
    }

    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                onClick={() => {
                  setType('income')
                  if (!isEditing || editTransaction.type !== 'income') {
                    setCategory('')
                  }
                }}
              >
                <TrendingUp size={18} />
                Income
              </button>
              <button
                type="button"
                className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => {
                  setType('expense')
                  if (!isEditing || editTransaction.type !== 'expense') {
                    setCategory('')
                  }
                }}
              >
                <TrendingDown size={18} />
                Expense
              </button>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <div className="category-grid">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className={`category-item ${category === cat.id ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <span>{cat.emoji}</span>
                    <p>{cat.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className={`btn ${type === 'income' ? 'btn-success' : 'btn-danger'}`}
                disabled={loading || !amount || !category}
              >
                {loading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransactionModal
