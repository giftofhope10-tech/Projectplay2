import React, { useState, useRef } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { 
  Settings as SettingsIcon, Download, Upload, Database, 
  AlertTriangle, CheckCircle, FileJson, Trash2
} from 'lucide-react'

function Settings() {
  const { refreshData } = useExpense()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  const handleExport = async () => {
    setExporting(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/backup')
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `daily-kharcha-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
        setMessage({ type: 'success', text: 'Backup downloaded successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to export data' })
      }
    } catch (error) {
      console.error('Export error:', error)
      setMessage({ type: 'error', text: 'Failed to export data' })
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImporting(true)
    setMessage(null)
    
    try {
      const text = await file.text()
      const backup = JSON.parse(text)
      
      if (!backup.data) {
        throw new Error('Invalid backup file format')
      }
      
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup)
      })
      
      if (res.ok) {
        await refreshData()
        setMessage({ type: 'success', text: 'Data restored successfully! All your data has been imported.' })
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Failed to restore data')
      }
    } catch (error) {
      console.error('Import error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to import data. Please check the file format.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your app settings and data</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Database size={18} style={{ marginRight: '0.5rem' }} />
            Data Backup & Restore
          </h3>
        </div>
        
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>
                <Download size={18} />
                Export Data
              </h4>
              <p>Download all your data as a JSON file. This includes transactions, notes, budgets, recurring items, and savings goals.</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleExport}
              disabled={exporting}
            >
              <FileJson size={16} />
              {exporting ? 'Exporting...' : 'Download Backup'}
            </button>
          </div>

          <div className="settings-divider"></div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>
                <Upload size={18} />
                Import Data
              </h4>
              <p>Restore data from a previously exported backup file. This will replace all existing data.</p>
              <div className="settings-warning">
                <AlertTriangle size={14} />
                <span>Warning: Importing will overwrite all current data</span>
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-file"
              />
              <label htmlFor="import-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={16} />
                {importing ? 'Importing...' : 'Select Backup File'}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <SettingsIcon size={18} style={{ marginRight: '0.5rem' }} />
            About
          </h3>
        </div>
        
        <div className="settings-section">
          <div className="about-info">
            <h4>Daily Kharcha</h4>
            <p>Version 2.0</p>
            <p className="text-muted">Your personal expense tracker to manage finances effectively.</p>
            
            <div className="features-list">
              <h5>Features:</h5>
              <ul>
                <li>Track income and expenses</li>
                <li>Set and monitor budgets</li>
                <li>Create savings goals</li>
                <li>Manage recurring transactions</li>
                <li>View detailed analytics</li>
                <li>Generate reports (PDF/CSV)</li>
                <li>Take notes</li>
                <li>Built-in calculator</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
