import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import PDFDocument from 'pdfkit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createServer as createViteServer } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

const db = new Database('expense_tracker.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL,
    period TEXT DEFAULT 'monthly',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS recurring_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL,
    nextDate TEXT NOT NULL,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    targetAmount REAL NOT NULL,
    currentAmount REAL DEFAULT 0,
    deadline TEXT,
    emoji TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#6366f1',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

app.get('/api/transactions', (req, res) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all()
    res.json(transactions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/transactions', (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body
    
    const stmt = db.prepare(
      'INSERT INTO transactions (type, amount, category, description, date) VALUES (?, ?, ?, ?, ?)'
    )
    const result = stmt.run(type, amount, category, description || '', date)
    
    const newTransaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newTransaction)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params
    db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/notes', (req, res) => {
  try {
    const notes = db.prepare('SELECT * FROM notes ORDER BY createdAt DESC').all()
    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/notes', (req, res) => {
  try {
    const { title, content, createdAt } = req.body
    
    const stmt = db.prepare(
      'INSERT INTO notes (title, content, createdAt) VALUES (?, ?, ?)'
    )
    const result = stmt.run(title, content, createdAt || new Date().toISOString())
    
    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newNote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/notes/:id', (req, res) => {
  try {
    const { id } = req.params
    db.prepare('DELETE FROM notes WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/budgets', (req, res) => {
  try {
    const budgets = db.prepare('SELECT * FROM budgets ORDER BY category').all()
    res.json(budgets)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/budgets', (req, res) => {
  try {
    const { category, amount, period } = req.body
    
    const existing = db.prepare('SELECT * FROM budgets WHERE category = ?').get(category)
    
    if (existing) {
      db.prepare('UPDATE budgets SET amount = ?, period = ? WHERE category = ?').run(amount, period || 'monthly', category)
      const updated = db.prepare('SELECT * FROM budgets WHERE category = ?').get(category)
      res.json(updated)
    } else {
      const stmt = db.prepare('INSERT INTO budgets (category, amount, period) VALUES (?, ?, ?)')
      const result = stmt.run(category, amount, period || 'monthly')
      const newBudget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(result.lastInsertRowid)
      res.status(201).json(newBudget)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/budgets/:id', (req, res) => {
  try {
    const { id } = req.params
    db.prepare('DELETE FROM budgets WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/recurring', (req, res) => {
  try {
    const recurring = db.prepare('SELECT * FROM recurring_transactions ORDER BY nextDate').all()
    res.json(recurring)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/recurring', (req, res) => {
  try {
    const { type, amount, category, description, frequency, nextDate } = req.body
    
    const stmt = db.prepare(
      'INSERT INTO recurring_transactions (type, amount, category, description, frequency, nextDate) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const result = stmt.run(type, amount, category, description || '', frequency, nextDate)
    
    const newRecurring = db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newRecurring)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/recurring/:id/toggle', (req, res) => {
  try {
    const { id } = req.params
    const recurring = db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(id)
    if (recurring) {
      db.prepare('UPDATE recurring_transactions SET isActive = ? WHERE id = ?').run(recurring.isActive ? 0 : 1, id)
      const updated = db.prepare('SELECT * FROM recurring_transactions WHERE id = ?').get(id)
      res.json(updated)
    } else {
      res.status(404).json({ error: 'Not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/recurring/:id', (req, res) => {
  try {
    const { id } = req.params
    db.prepare('DELETE FROM recurring_transactions WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/goals', (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM savings_goals ORDER BY createdAt DESC').all()
    res.json(goals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/goals', (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, emoji, color } = req.body
    
    const stmt = db.prepare(
      'INSERT INTO savings_goals (name, targetAmount, currentAmount, deadline, emoji, color) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const result = stmt.run(name, targetAmount, currentAmount || 0, deadline || null, emoji || '🎯', color || '#6366f1')
    
    const newGoal = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(newGoal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/goals/:id', (req, res) => {
  try {
    const { id } = req.params
    const { name, targetAmount, currentAmount, deadline, emoji, color } = req.body
    
    db.prepare(
      'UPDATE savings_goals SET name = ?, targetAmount = ?, currentAmount = ?, deadline = ?, emoji = ?, color = ? WHERE id = ?'
    ).run(name, targetAmount, currentAmount, deadline, emoji, color, id)
    
    const updated = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/goals/:id/add-amount', (req, res) => {
  try {
    const { id } = req.params
    const { amount } = req.body
    
    db.prepare('UPDATE savings_goals SET currentAmount = currentAmount + ? WHERE id = ?').run(amount, id)
    
    const updated = db.prepare('SELECT * FROM savings_goals WHERE id = ?').get(id)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/goals/:id', (req, res) => {
  try {
    const { id } = req.params
    db.prepare('DELETE FROM savings_goals WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params
    const { type, amount, category, description, date } = req.body
    
    db.prepare(
      'UPDATE transactions SET type = ?, amount = ?, category = ?, description = ?, date = ? WHERE id = ?'
    ).run(type, amount, category, description || '', date, id)
    
    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/backup', (req, res) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions').all()
    const notes = db.prepare('SELECT * FROM notes').all()
    const budgets = db.prepare('SELECT * FROM budgets').all()
    const recurring = db.prepare('SELECT * FROM recurring_transactions').all()
    const goals = db.prepare('SELECT * FROM savings_goals').all()
    
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: { transactions, notes, budgets, recurring, goals }
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename=daily-kharcha-backup.json')
    res.json(backup)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/restore', (req, res) => {
  try {
    const { data } = req.body
    
    if (data.transactions) {
      db.prepare('DELETE FROM transactions').run()
      const stmt = db.prepare('INSERT INTO transactions (type, amount, category, description, date, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
      data.transactions.forEach(t => {
        stmt.run(t.type, t.amount, t.category, t.description, t.date, t.createdAt)
      })
    }
    
    if (data.notes) {
      db.prepare('DELETE FROM notes').run()
      const stmt = db.prepare('INSERT INTO notes (title, content, createdAt) VALUES (?, ?, ?)')
      data.notes.forEach(n => {
        stmt.run(n.title, n.content, n.createdAt)
      })
    }
    
    if (data.budgets) {
      db.prepare('DELETE FROM budgets').run()
      const stmt = db.prepare('INSERT INTO budgets (category, amount, period, createdAt) VALUES (?, ?, ?, ?)')
      data.budgets.forEach(b => {
        stmt.run(b.category, b.amount, b.period, b.createdAt)
      })
    }
    
    if (data.recurring) {
      db.prepare('DELETE FROM recurring_transactions').run()
      const stmt = db.prepare('INSERT INTO recurring_transactions (type, amount, category, description, frequency, nextDate, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      data.recurring.forEach(r => {
        stmt.run(r.type, r.amount, r.category, r.description, r.frequency, r.nextDate, r.isActive, r.createdAt)
      })
    }
    
    if (data.goals) {
      db.prepare('DELETE FROM savings_goals').run()
      const stmt = db.prepare('INSERT INTO savings_goals (name, targetAmount, currentAmount, deadline, emoji, color, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
      data.goals.forEach(g => {
        stmt.run(g.name, g.targetAmount, g.currentAmount, g.deadline, g.emoji, g.color, g.createdAt)
      })
    }
    
    res.json({ success: true, message: 'Data restored successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/analytics', (req, res) => {
  try {
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 7)
    
    const currentMonthStart = `${currentMonth}-01`
    const currentMonthEnd = `${currentMonth}-31`
    const lastMonthStart = `${lastMonth}-01`
    const lastMonthEnd = `${lastMonth}-31`
    
    const totalTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get()
    
    const avgExpense = db.prepare(`
      SELECT AVG(amount) as avg FROM transactions WHERE type = 'expense'
    `).get()
    
    const avgIncome = db.prepare(`
      SELECT AVG(amount) as avg FROM transactions WHERE type = 'income'
    `).get()
    
    const biggestExpense = db.prepare(`
      SELECT * FROM transactions WHERE type = 'expense' ORDER BY amount DESC LIMIT 1
    `).get()
    
    const biggestIncome = db.prepare(`
      SELECT * FROM transactions WHERE type = 'income' ORDER BY amount DESC LIMIT 1
    `).get()
    
    const currentMonthTotal = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions WHERE date >= ? AND date <= ?
    `).get(currentMonthStart, currentMonthEnd)
    
    const lastMonthTotal = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions WHERE date >= ? AND date <= ?
    `).get(lastMonthStart, lastMonthEnd)
    
    const dailyAvgExpense = db.prepare(`
      SELECT date, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'expense' AND date >= ? AND date <= ?
      GROUP BY date
    `).all(currentMonthStart, currentMonthEnd)
    
    const avgDailySpend = dailyAvgExpense.length > 0 
      ? dailyAvgExpense.reduce((sum, d) => sum + d.total, 0) / dailyAvgExpense.length 
      : 0
    
    const spendingByDay = db.prepare(`
      SELECT 
        CASE cast(strftime('%w', date) as integer)
          WHEN 0 THEN 'Sunday'
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
        END as day,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE type = 'expense'
      GROUP BY strftime('%w', date)
      ORDER BY total DESC
      LIMIT 1
    `).get()
    
    const savingsRate = currentMonthTotal.income > 0 
      ? ((currentMonthTotal.income - currentMonthTotal.expense) / currentMonthTotal.income * 100).toFixed(1)
      : 0
    
    const insights = []
    
    if (currentMonthTotal.expense > (lastMonthTotal?.expense || 0)) {
      const increase = lastMonthTotal?.expense > 0 
        ? ((currentMonthTotal.expense - lastMonthTotal.expense) / lastMonthTotal.expense * 100).toFixed(0)
        : 100
      insights.push({
        type: 'warning',
        title: 'Spending Increase',
        message: `Your spending is up ${increase}% compared to last month. Consider reviewing your expenses.`
      })
    } else if (lastMonthTotal?.expense > 0) {
      const decrease = ((lastMonthTotal.expense - currentMonthTotal.expense) / lastMonthTotal.expense * 100).toFixed(0)
      insights.push({
        type: 'success',
        title: 'Great Job!',
        message: `You've reduced spending by ${decrease}% compared to last month. Keep it up!`
      })
    }
    
    if (savingsRate < 20 && currentMonthTotal.income > 0) {
      insights.push({
        type: 'info',
        title: 'Savings Tip',
        message: `Your savings rate is ${savingsRate}%. Financial experts recommend saving at least 20% of your income.`
      })
    } else if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        title: 'Excellent Savings!',
        message: `You're saving ${savingsRate}% of your income this month. You're on track for financial health!`
      })
    }
    
    if (spendingByDay) {
      insights.push({
        type: 'info',
        title: 'Spending Pattern',
        message: `You tend to spend the most on ${spendingByDay.day}s. Being mindful on this day could help save money.`
      })
    }
    
    res.json({
      totalTransactions: totalTransactions.count,
      avgExpense: avgExpense?.avg || 0,
      avgIncome: avgIncome?.avg || 0,
      biggestExpense,
      biggestIncome,
      currentMonth: currentMonthTotal,
      lastMonth: lastMonthTotal,
      avgDailySpend,
      spendingByDay,
      savingsRate: parseFloat(savingsRate),
      insights
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/export/csv', (req, res) => {
  try {
    const { startDate, endDate } = req.query
    
    let query = 'SELECT * FROM transactions'
    let params = []
    
    if (startDate && endDate) {
      query += ' WHERE date >= ? AND date <= ?'
      params = [startDate, endDate]
    }
    
    query += ' ORDER BY date DESC'
    
    const transactions = db.prepare(query).all(...params)
    
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount']
    const csvRows = [headers.join(',')]
    
    transactions.forEach(t => {
      const row = [
        t.date,
        t.type,
        t.category,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount
      ]
      csvRows.push(row.join(','))
    })
    
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv')
    res.send(csvRows.join('\n'))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/stats/monthly', (req, res) => {
  try {
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)
    
    const currentMonthStart = `${currentMonth}-01`
    const currentMonthEnd = `${currentMonth}-31`
    const lastMonthStart = `${lastMonth}-01`
    const lastMonthEnd = `${lastMonth}-31`
    
    const currentExpenses = db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'expense' AND date >= ? AND date <= ?
      GROUP BY category
    `).all(currentMonthStart, currentMonthEnd)
    
    const lastExpenses = db.prepare(`
      SELECT SUM(amount) as total 
      FROM transactions 
      WHERE type = 'expense' AND date >= ? AND date <= ?
    `).get(lastMonthStart, lastMonthEnd)
    
    const currentTotal = db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE date >= ? AND date <= ?
    `).get(currentMonthStart, currentMonthEnd)
    
    const topCategories = db.prepare(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'expense' AND date >= ? AND date <= ?
      GROUP BY category
      ORDER BY total DESC
      LIMIT 5
    `).all(currentMonthStart, currentMonthEnd)
    
    res.json({
      currentMonth: {
        income: currentTotal?.income || 0,
        expense: currentTotal?.expense || 0,
        byCategory: currentExpenses
      },
      lastMonthExpense: lastExpenses?.total || 0,
      topCategories
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const incomeCategories = {
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment',
  gift: 'Gift',
  rental: 'Rental',
  business: 'Business',
  refund: 'Refund',
  other_income: 'Other'
}

const expenseCategories = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills',
  entertainment: 'Entertainment',
  health: 'Health',
  education: 'Education',
  grocery: 'Grocery',
  rent: 'Rent',
  utilities: 'Utilities',
  insurance: 'Insurance',
  other_expense: 'Other'
}

app.post('/api/export/pdf', (req, res) => {
  try {
    const { period, startDate, endDate } = req.body
    
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE date >= ? AND date <= ?
      ORDER BY date DESC
    `).all(startDate, endDate)

    const doc = new PDFDocument({ margin: 50 })
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=expense-report-${period}.pdf`)
    
    doc.pipe(res)

    doc.fontSize(24).fillColor('#6366f1').text('Daily Kharcha', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(16).fillColor('#64748b').text('Expense Report', { align: 'center' })
    doc.moveDown(0.5)
    
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1)
    const startDateFormatted = new Date(startDate).toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })
    const endDateFormatted = new Date(endDate).toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })
    
    doc.fontSize(12).fillColor('#94a3b8').text(
      `${periodLabel} Report: ${startDateFormatted} - ${endDateFormatted}`,
      { align: 'center' }
    )
    doc.moveDown(2)

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balance = totalIncome - totalExpense

    doc.fontSize(14).fillColor('#0f172a').text('Summary', { underline: true })
    doc.moveDown(0.5)

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount)
    }

    doc.fontSize(12)
    doc.fillColor('#10b981').text(`Total Income: ${formatCurrency(totalIncome)}`)
    doc.fillColor('#ef4444').text(`Total Expense: ${formatCurrency(totalExpense)}`)
    doc.fillColor(balance >= 0 ? '#10b981' : '#ef4444').text(`Net Balance: ${formatCurrency(balance)}`)
    doc.moveDown(1.5)

    if (transactions.length > 0) {
      doc.fontSize(14).fillColor('#0f172a').text('Transactions', { underline: true })
      doc.moveDown(0.5)

      const tableTop = doc.y
      const colWidths = [80, 100, 100, 120, 100]
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount']

      doc.fontSize(10).fillColor('#64748b')
      let x = 50
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i] })
        x += colWidths[i]
      })

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#e2e8f0')

      let y = tableTop + 25
      transactions.forEach((t) => {
        if (y > 700) {
          doc.addPage()
          y = 50
        }

        const categories = t.type === 'income' ? incomeCategories : expenseCategories
        const categoryName = categories[t.category] || t.category

        x = 50
        doc.fontSize(9).fillColor('#0f172a')
        
        doc.text(new Date(t.date).toLocaleDateString('en-IN'), x, y, { width: colWidths[0] })
        x += colWidths[0]
        
        doc.fillColor(t.type === 'income' ? '#10b981' : '#ef4444')
        doc.text(t.type.toUpperCase(), x, y, { width: colWidths[1] })
        x += colWidths[1]
        
        doc.fillColor('#0f172a')
        doc.text(categoryName, x, y, { width: colWidths[2] })
        x += colWidths[2]
        
        doc.text(t.description || '-', x, y, { width: colWidths[3] })
        x += colWidths[3]
        
        doc.fillColor(t.type === 'income' ? '#10b981' : '#ef4444')
        doc.text(formatCurrency(t.amount), x, y, { width: colWidths[4] })

        y += 20
      })
    } else {
      doc.fontSize(12).fillColor('#64748b').text('No transactions found for this period.')
    }

    doc.moveDown(2)
    doc.fontSize(8).fillColor('#94a3b8').text(
      `Generated on ${new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })}`,
      { align: 'center' }
    )

    doc.end()
  } catch (error) {
    console.error('PDF export error:', error)
    res.status(500).json({ error: error.message })
  }
})

async function startServer() {
  const vite = await createViteServer({
    root: join(__dirname, '../client'),
    server: { 
      middlewareMode: true,
      allowedHosts: 'all',
      hmr: false
    },
    appType: 'spa'
  })

  app.use(vite.middlewares)

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
  })
}

startServer().catch(console.error)
