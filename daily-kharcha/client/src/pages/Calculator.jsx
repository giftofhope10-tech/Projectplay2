import React, { useState } from 'react'
import { useExpense } from '../context/ExpenseContext'
import TransactionModal from '../components/TransactionModal'
import { Plus, ArrowRight } from 'lucide-react'

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [justCalculated, setJustCalculated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [prefillAmount, setPrefillAmount] = useState(null)

  const buttons = [
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=', 'AC'
  ]

  const handleButtonClick = (btn) => {
    if (btn === 'AC') {
      setDisplay('0')
      setExpression('')
      setJustCalculated(false)
      return
    }

    if (btn === 'C') {
      if (display.length === 1 || display === '0') {
        setDisplay('0')
      } else {
        setDisplay(display.slice(0, -1))
      }
      setJustCalculated(false)
      return
    }

    if (btn === '=') {
      try {
        const sanitized = display.replace(/[^0-9+\-*/().]/g, '')
        const result = eval(sanitized)
        setExpression(display + ' =')
        setDisplay(String(result))
        setJustCalculated(true)
      } catch (error) {
        setDisplay('Error')
        setJustCalculated(true)
      }
      return
    }

    if (['+', '-', '*', '/'].includes(btn)) {
      setDisplay(display + btn)
      setJustCalculated(false)
      return
    }

    if (justCalculated && !isNaN(btn)) {
      setDisplay(btn)
      setExpression('')
      setJustCalculated(false)
      return
    }

    if (display === '0' && btn !== '.') {
      setDisplay(btn)
    } else {
      setDisplay(display + btn)
    }
    setJustCalculated(false)
  }

  const handleAddTransaction = () => {
    const numValue = parseFloat(display)
    if (!isNaN(numValue) && numValue > 0) {
      setPrefillAmount(numValue)
      setShowModal(true)
    }
  }

  const getButtonClass = (btn) => {
    if (btn === '=' ) return 'calc-btn equals'
    if (btn === 'AC') return 'calc-btn clear'
    if (btn === 'C') return 'calc-btn operator'
    if (['+', '-', '*', '/', '(', ')'].includes(btn)) return 'calc-btn operator'
    return 'calc-btn'
  }

  const isValidAmount = !isNaN(parseFloat(display)) && parseFloat(display) > 0

  return (
    <div>
      <div className="page-header">
        <h2>Calculator</h2>
        <p>Quick calculations for your expenses</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="calculator">
            <div className="calc-display">
              <div className="expression">{expression}</div>
              <div className="result">{display}</div>
            </div>
            
            <div className="calc-buttons">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  className={getButtonClass(btn)}
                  onClick={() => handleButtonClick(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
          
          {isValidAmount && (
            <button 
              className="btn btn-success" 
              onClick={handleAddTransaction}
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
            >
              Add as Transaction <ArrowRight size={18} />
            </button>
          )}
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>Quick Tips</h3>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Basic Operations:</strong><br />
              Use +, -, *, / for calculations
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Brackets:</strong><br />
              Use ( ) for complex calculations
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Clear:</strong><br />
              C to delete last digit, AC to clear all
            </p>
            <p>
              <strong style={{ color: 'var(--text-primary)' }}>Add Transaction:</strong><br />
              After calculating, click the green button to add the result as a new transaction
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <TransactionModal 
          onClose={() => {
            setShowModal(false)
            setPrefillAmount(null)
          }}
          prefillAmount={prefillAmount}
        />
      )}
    </div>
  )
}

export default Calculator
