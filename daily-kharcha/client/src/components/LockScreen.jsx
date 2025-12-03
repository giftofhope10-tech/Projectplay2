import React, { useState, useEffect, useRef } from 'react'
import { Lock, Delete, Eye, EyeOff } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

function LockScreen() {
  const { unlock, settings } = useSettings()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleNumberClick = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num)
      setError('')
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError('')
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const handleUnlock = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    const success = await unlock(pin)
    if (success) {
      setPin('')
      setError('')
      setAttempts(0)
    } else {
      setAttempts(prev => prev + 1)
      setError('Incorrect PIN. Please try again.')
      setPin('')
      
      if (attempts >= 4) {
        setError('Too many failed attempts. Please wait.')
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleNumberClick(e.key)
    } else if (e.key === 'Backspace') {
      handleDelete()
    } else if (e.key === 'Enter' && pin.length >= 4) {
      handleUnlock()
    }
  }

  useEffect(() => {
    if (pin.length === 6) {
      handleUnlock()
    }
  }, [pin])

  return (
    <div className="lock-screen" onKeyDown={handleKeyPress} tabIndex={0} ref={inputRef}>
      <div className="lock-container">
        <div className="lock-header">
          <div className="lock-icon">
            <Lock size={40} />
          </div>
          <h2>Daily Kharcha</h2>
          <p>Enter your PIN to unlock</p>
        </div>

        <div className="pin-display">
          <div className="pin-dots">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`pin-dot ${i < pin.length ? 'filled' : ''} ${error ? 'error' : ''}`}
              >
                {showPin && i < pin.length ? pin[i] : ''}
              </div>
            ))}
          </div>
          <button 
            className="pin-toggle"
            onClick={() => setShowPin(!showPin)}
          >
            {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="lock-error">{error}</p>}

        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              className="keypad-btn"
              onClick={() => handleNumberClick(num.toString())}
              disabled={attempts >= 5}
            >
              {num}
            </button>
          ))}
          <button 
            className="keypad-btn keypad-action"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            className="keypad-btn"
            onClick={() => handleNumberClick('0')}
            disabled={attempts >= 5}
          >
            0
          </button>
          <button 
            className="keypad-btn keypad-action"
            onClick={handleDelete}
          >
            <Delete size={20} />
          </button>
        </div>

        <button 
          className="btn btn-primary unlock-btn"
          onClick={handleUnlock}
          disabled={pin.length < 4 || attempts >= 5}
        >
          Unlock
        </button>
      </div>
    </div>
  )
}

export default LockScreen
