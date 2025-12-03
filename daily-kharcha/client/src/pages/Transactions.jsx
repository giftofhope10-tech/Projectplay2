import React, { useState, useMemo } from 'react'
import { useExpense } from '../context/ExpenseContext'
import TransactionModal from '../components/TransactionModal'
import { Plus, Trash2, Filter, Search, Download, Calendar, Edit2 } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

function Transactions() {
  const { 
    transactions, 
    incomeCategories, 
    expenseCategories, 
    deleteTransaction,
    exportCSV
  } = useExpense()
  
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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

  const setQuickDateFilter = (days) => {
    const end = new Date()
    const start = subDays(end, days)
    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
  }

  const setThisMonthFilter = () => {
    const now = new Date()
    setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'))
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'))
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      if (startDate && t.date < startDate) return false
      if (endDate && t.date > endDate) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const category = getCategory(t.category, t.type)
        return (
          t.description?.toLowerCase().includes(query) ||
          category.name.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [transactions, typeFilter, categoryFilter, searchQuery, startDate, endDate])

  const handleExportCSV = () => {
    exportCSV(startDate, endDate)
  }

  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2>Transactions</h2>
          <p>View and manage all your transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px', maxWidth: '180px' }}
              />
            </div>
          </div>

          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ maxWidth: '120px' }}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ maxWidth: '150px' }}
          >
            <option value="all">All Categories</option>
            <optgroup label="Income">
              {incomeCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </optgroup>
            <optgroup label="Expense">
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </optgroup>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={16} />
            CSV
          </button>
        </div>

        <div className="filter-bar" style={{ marginTop: '-0.5rem' }}>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ maxWidth: '150px' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ maxWidth: '150px' }}
          />
          <button className="btn btn-secondary btn-sm" onClick={() => setQuickDateFilter(7)}>7 Days</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setQuickDateFilter(30)}>30 Days</button>
          <button className="btn btn-secondary btn-sm" onClick={setThisMonthFilter}>This Month</button>
          {(startDate || endDate) && (
            <button className="btn btn-secondary btn-sm" onClick={clearDateFilter}>Clear</button>
          )}
        </div>

        {(startDate || endDate || typeFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="report-summary" style={{ marginTop: '1rem' }}>
            <div className="report-item">
              <h4 style={{ color: 'var(--success)' }}>{formatCurrency(filteredIncome)}</h4>
              <p>Income</p>
            </div>
            <div className="report-item">
              <h4 style={{ color: 'var(--danger)' }}>{formatCurrency(filteredExpense)}</h4>
              <p>Expense</p>
            </div>
            <div className="report-item">
              <h4 style={{ color: filteredIncome - filteredExpense >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatCurrency(filteredIncome - filteredExpense)}
              </h4>
              <p>Net</p>
            </div>
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <Filter size={48} />
            <h3>No transactions found</h3>
            <p>Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map(transaction => {
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
                      <p>
                        <span className={`badge badge-${transaction.type}`}>
                          {transaction.type}
                        </span>
                        {' • '}{category.name} • {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ alignItems: 'center' }}>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <button 
                      className="icon-btn" 
                      onClick={() => setEditingTransaction(transaction)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
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

      {editingTransaction && (
        <TransactionModal 
          onClose={() => setEditingTransaction(null)} 
          editTransaction={editingTransaction}
        />
      )}
    </div>
  )
}

export default Transactions
