import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee' }
]

const DEFAULT_SETTINGS = {
  currency: 'INR',
  pinEnabled: false,
  pinHash: null,
  reminders: {
    billReminders: true,
    rentReminder: true,
    rentDay: 1,
    budgetAlerts: true,
    budgetThreshold: 80
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dailyKharchaSettings')
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      } catch {
        return DEFAULT_SETTINGS
      }
    }
    return DEFAULT_SETTINGS
  })
  
  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem('dailyKharchaSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.pinEnabled && parsed.pinHash
      } catch {
        return false
      }
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem('dailyKharchaSettings', JSON.stringify(settings))
  }, [settings])

  const hashPin = async (pin) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin + 'dailyKharchaSalt')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const verifyPin = async (pin) => {
    const hash = await hashPin(pin)
    return hash === settings.pinHash
  }

  const setPin = async (pin) => {
    const hash = await hashPin(pin)
    setSettings(prev => ({
      ...prev,
      pinEnabled: true,
      pinHash: hash
    }))
    setIsLocked(false)
  }

  const removePin = () => {
    setSettings(prev => ({
      ...prev,
      pinEnabled: false,
      pinHash: null
    }))
    setIsLocked(false)
  }

  const unlock = async (pin) => {
    const isValid = await verifyPin(pin)
    if (isValid) {
      setIsLocked(false)
      return true
    }
    return false
  }

  const lock = () => {
    if (settings.pinEnabled && settings.pinHash) {
      setIsLocked(true)
    }
  }

  const setCurrency = (code) => {
    setSettings(prev => ({ ...prev, currency: code }))
  }

  const updateReminders = (reminderSettings) => {
    setSettings(prev => ({
      ...prev,
      reminders: { ...prev.reminders, ...reminderSettings }
    }))
  }

  const getCurrency = () => {
    return CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0]
  }

  const formatCurrency = (amount) => {
    const curr = getCurrency()
    return new Intl.NumberFormat(curr.code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: curr.code,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const value = {
    settings,
    isLocked,
    currencies: CURRENCIES,
    getCurrency,
    formatCurrency,
    setCurrency,
    setPin,
    removePin,
    verifyPin,
    unlock,
    lock,
    updateReminders
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
