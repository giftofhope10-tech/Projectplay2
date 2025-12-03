import React, { useState, useMemo } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval, subDays, subWeeks, subMonths } from 'date-fns'

function Reports() {
  const { transactions, incomeCategories, expenseCategories } = useExpense()
  const [period, setPeriod] = useState('monthly')
  const [exporting, setExporting] = useState(false)

  const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDateRange = () => {
    const now = new Date()
    let start, end
    
    switch (period) {
      case 'daily':
        start = startOfDay(now)
        end = endOfDay(now)
        break
      case 'weekly':
        start = startOfWeek(now, { weekStartsOn: 1 })
        end = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'monthly':
      default:
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
    }
    
    return { start, end }
  }

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange()
    return transactions.filter(t => {
      const date = new Date(t.date)
      return isWithinInterval(date, { start, end })
    })
  }, [transactions, period])

  const periodStats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    
    return { income, expense, balance: income - expense }
  }, [filteredTransactions])

  const categoryData = useMemo(() => {
    const expenseByCategory = {}
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = expenseCategories.find(c => c.id === t.category)
        const name = cat ? cat.name : t.category
        expenseByCategory[name] = (expenseByCategory[name] || 0) + parseFloat(t.amount)
      })
    
    return Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTransactions])

  const incomeData = useMemo(() => {
    const incomeByCategory = {}
    
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const cat = incomeCategories.find(c => c.id === t.category)
        const name = cat ? cat.name : t.category
        incomeByCategory[name] = (incomeByCategory[name] || 0) + parseFloat(t.amount)
      })
    
    return Object.entries(incomeByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTransactions])

  const trendData = useMemo(() => {
    const data = []
    const now = new Date()
    
    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)
        
        const dayTransactions = transactions.filter(t => 
          isWithinInterval(new Date(t.date), { start: dayStart, end: dayEnd })
        )
        
        data.push({
          name: format(date, 'EEE'),
          income: dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0),
          expense: dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
        })
      }
    } else if (period === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
        const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
        
        const weekTransactions = transactions.filter(t => 
          isWithinInterval(new Date(t.date), { start: weekStart, end: weekEnd })
        )
        
        data.push({
          name: `Week ${4 - i}`,
          income: weekTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0),
          expense: weekTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
        })
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i))
        const monthEnd = endOfMonth(subMonths(now, i))
        
        const monthTransactions = transactions.filter(t => 
          isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
        )
        
        data.push({
          name: format(monthStart, 'MMM'),
          income: monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0),
          expense: monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
        })
      }
    }
    
    return data
  }, [transactions, period])

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const { start, end } = getDateRange()
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        })
      })
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `expense-report-${period}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h2>Reports</h2>
          <p>Analyze your income and expenses</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleExportPDF}
          disabled={exporting}
        >
          <Download size={18} />
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${period === 'daily' ? 'active' : ''}`}
          onClick={() => setPeriod('daily')}
        >
          Daily
        </button>
        <button 
          className={`tab ${period === 'weekly' ? 'active' : ''}`}
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </button>
        <button 
          className={`tab ${period === 'monthly' ? 'active' : ''}`}
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      <div className="report-summary">
        <div className="report-item">
          <h4 style={{ color: 'var(--success)' }}>{formatCurrency(periodStats.income)}</h4>
          <p>Total Income</p>
        </div>
        <div className="report-item">
          <h4 style={{ color: 'var(--danger)' }}>{formatCurrency(periodStats.expense)}</h4>
          <p>Total Expense</p>
        </div>
        <div className="report-item">
          <h4 style={{ color: periodStats.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(periodStats.balance)}
          </h4>
          <p>Net Balance</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Income vs Expense Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Expense by Category</h3>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p>No expense data for this period</p>
              </div>
            )}
          </div>
          <div className="legend">
            {categoryData.slice(0, 5).map((item, index) => (
              <div key={item.name} className="legend-item">
                <div className="legend-color" style={{ background: COLORS[index] }}></div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Income by Category</h3>
        <div className="chart-container" style={{ height: '250px' }}>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-secondary)" />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No income data for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
