import React, { useState, useRef } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { useSettings } from '../context/SettingsContext'
import { 
  Settings as SettingsIcon, Download, Upload, Database, 
  AlertTriangle, CheckCircle, FileJson, Lock, Unlock,
  Globe, Bell, BellOff, Wallet, Calendar, Percent,
  Shield, ShieldOff, Eye, EyeOff
} from 'lucide-react'

function Settings() {
  const { refreshData } = useExpense()
  const { 
    settings, 
    currencies, 
    getCurrency, 
    setCurrency, 
    setPin, 
    removePin, 
    verifyPin,
    updateReminders,
    lock
  } = useSettings()
  
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)
  
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [showPins, setShowPins] = useState(false)

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
        setMessage({ type: 'success', text: 'Data restored successfully!' })
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Failed to restore data')
      }
    } catch (error) {
      console.error('Import error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to import data.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSetPin = async () => {
    setPinError('')
    
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 digits')
      return
    }
    
    if (newPin !== confirmPin) {
      setPinError('PINs do not match')
      return
    }
    
    await setPin(newPin)
    setNewPin('')
    setConfirmPin('')
    setShowPinSetup(false)
    setMessage({ type: 'success', text: 'PIN set successfully! Your app is now protected.' })
  }

  const handleRemovePin = async () => {
    if (settings.pinEnabled) {
      const isValid = await verifyPin(currentPin)
      if (!isValid) {
        setPinError('Incorrect current PIN')
        return
      }
    }
    
    removePin()
    setCurrentPin('')
    setPinError('')
    setMessage({ type: 'success', text: 'PIN removed. App is no longer protected.' })
  }

  const handleLockNow = () => {
    lock()
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your app settings and preferences</p>
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
            <Lock size={18} style={{ marginRight: '0.5rem' }} />
            Security & PIN Lock
          </h3>
        </div>
        
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>
                {settings.pinEnabled ? <Shield size={18} /> : <ShieldOff size={18} />}
                App Lock
              </h4>
              <p>
                {settings.pinEnabled 
                  ? 'Your app is protected with a PIN. You will need to enter it to access your data.'
                  : 'Protect your financial data with a PIN code.'}
              </p>
            </div>
            
            {settings.pinEnabled ? (
              <div className="settings-actions">
                <button className="btn btn-secondary btn-sm" onClick={handleLockNow}>
                  <Lock size={16} />
                  Lock Now
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => setShowPinSetup('remove')}
                >
                  <Unlock size={16} />
                  Remove PIN
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => setShowPinSetup('set')}
              >
                <Lock size={16} />
                Set PIN
              </button>
            )}
          </div>

          {showPinSetup === 'set' && (
            <div className="pin-setup-form">
              <div className="form-group">
                <label>New PIN (4-6 digits)</label>
                <div className="pin-input-wrapper">
                  <input
                    type={showPins ? 'text' : 'password'}
                    className="form-control"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter new PIN"
                    maxLength={6}
                  />
                  <button 
                    className="pin-toggle-btn"
                    onClick={() => setShowPins(!showPins)}
                  >
                    {showPins ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm PIN</label>
                <input
                  type={showPins ? 'text' : 'password'}
                  className="form-control"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Confirm PIN"
                  maxLength={6}
                />
              </div>
              {pinError && <p className="field-error">{pinError}</p>}
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => {
                  setShowPinSetup(false)
                  setNewPin('')
                  setConfirmPin('')
                  setPinError('')
                }}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSetPin}>
                  Set PIN
                </button>
              </div>
            </div>
          )}

          {showPinSetup === 'remove' && (
            <div className="pin-setup-form">
              <div className="form-group">
                <label>Enter Current PIN to Remove</label>
                <input
                  type={showPins ? 'text' : 'password'}
                  className="form-control"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter current PIN"
                  maxLength={6}
                />
              </div>
              {pinError && <p className="field-error">{pinError}</p>}
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => {
                  setShowPinSetup(false)
                  setCurrentPin('')
                  setPinError('')
                }}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleRemovePin}>
                  Remove PIN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Globe size={18} style={{ marginRight: '0.5rem' }} />
            Currency Settings
          </h3>
        </div>
        
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>
                <Wallet size={18} />
                Display Currency
              </h4>
              <p>Select the currency for displaying amounts throughout the app.</p>
            </div>
            <select
              className="form-control"
              value={settings.currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ maxWidth: '220px' }}
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="current-currency">
            <span className="currency-preview">
              Current: {getCurrency().symbol} {getCurrency().name}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Bell size={18} style={{ marginRight: '0.5rem' }} />
            Smart Reminders
          </h3>
        </div>
        
        <div className="settings-section">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>
                <Calendar size={18} />
                Bill Payment Reminders
              </h4>
              <p>Get reminded about upcoming bill payments based on your recurring transactions.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.reminders.billReminders}
                onChange={(e) => updateReminders({ billReminders: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-divider"></div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>
                <Calendar size={18} />
                Monthly Rent Reminder
              </h4>
              <p>Get reminded about rent payment on a specific day each month.</p>
            </div>
            <div className="settings-inline">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.reminders.rentReminder}
                  onChange={(e) => updateReminders({ rentReminder: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              {settings.reminders.rentReminder && (
                <select
                  className="form-control"
                  value={settings.reminders.rentDay}
                  onChange={(e) => updateReminders({ rentDay: parseInt(e.target.value) })}
                  style={{ width: '120px', marginLeft: '12px' }}
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="settings-divider"></div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>
                <Percent size={18} />
                Budget Limit Alerts
              </h4>
              <p>Get alerted when spending reaches a certain percentage of your budget.</p>
            </div>
            <div className="settings-inline">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.reminders.budgetAlerts}
                  onChange={(e) => updateReminders({ budgetAlerts: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              {settings.reminders.budgetAlerts && (
                <select
                  className="form-control"
                  value={settings.reminders.budgetThreshold}
                  onChange={(e) => updateReminders({ budgetThreshold: parseInt(e.target.value) })}
                  style={{ width: '100px', marginLeft: '12px' }}
                >
                  <option value={50}>50%</option>
                  <option value={60}>60%</option>
                  <option value={70}>70%</option>
                  <option value={80}>80%</option>
                  <option value={90}>90%</option>
                  <option value={100}>100%</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

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
              <p>Download all your data as a JSON file for backup.</p>
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
              <p>Restore data from a previously exported backup file.</p>
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
            <p>Version 3.0</p>
            <p className="text-muted">Your personal expense tracker with advanced features.</p>
            
            <div className="features-list">
              <h5>Features:</h5>
              <ul>
                <li>Track income and expenses</li>
                <li>PIN lock for security</li>
                <li>Multi-currency support</li>
                <li>Smart reminders & alerts</li>
                <li>Voice input for quick entry</li>
                <li>Set and monitor budgets</li>
                <li>Create savings goals</li>
                <li>View detailed analytics</li>
                <li>Generate reports (PDF/CSV)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
