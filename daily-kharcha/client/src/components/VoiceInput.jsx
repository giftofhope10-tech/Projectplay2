import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Check, X, Loader, AlertCircle } from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import { format } from 'date-fns'

function VoiceInput() {
  const { addTransaction, expenseCategories, incomeCategories } = useExpense()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('idle')
  const [parsedData, setParsedData] = useState(null)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-IN'
      
      recognitionInstance.onstart = () => {
        setIsListening(true)
        setStatus('listening')
      }
      
      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const text = result[0].transcript
        setTranscript(text)
        
        if (result.isFinal) {
          parseVoiceCommand(text)
        }
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setStatus('error')
        setTimeout(() => setStatus('idle'), 2000)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
    
    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [])

  const parseVoiceCommand = (text) => {
    setStatus('parsing')
    const lowerText = text.toLowerCase()
    
    const amountMatch = lowerText.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?/i)
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null
    
    const allCategories = [...expenseCategories, ...incomeCategories]
    let foundCategory = null
    let transactionType = 'expense'
    
    const incomeKeywords = ['income', 'earned', 'received', 'salary', 'got', 'payment received']
    const expenseKeywords = ['spent', 'expense', 'paid', 'bought', 'add', 'kharcha']
    
    for (const keyword of incomeKeywords) {
      if (lowerText.includes(keyword)) {
        transactionType = 'income'
        break
      }
    }
    
    for (const cat of allCategories) {
      if (lowerText.includes(cat.name.toLowerCase()) || lowerText.includes(cat.id.toLowerCase())) {
        foundCategory = cat.id
        if (incomeCategories.some(c => c.id === cat.id)) {
          transactionType = 'income'
        }
        break
      }
    }
    
    const categoryAliases = {
      'food': ['food', 'khana', 'lunch', 'dinner', 'breakfast', 'snack', 'meal', 'eat', 'eating'],
      'transport': ['transport', 'auto', 'cab', 'uber', 'ola', 'bus', 'metro', 'travel', 'petrol', 'fuel'],
      'shopping': ['shopping', 'clothes', 'amazon', 'flipkart', 'online'],
      'grocery': ['grocery', 'sabzi', 'vegetables', 'fruits', 'kirana'],
      'bills': ['bill', 'recharge', 'mobile', 'phone', 'wifi', 'internet'],
      'entertainment': ['movie', 'netflix', 'entertainment', 'fun', 'games'],
      'health': ['medicine', 'doctor', 'medical', 'health', 'hospital', 'gym'],
      'education': ['books', 'course', 'education', 'study', 'school', 'college'],
      'rent': ['rent', 'house rent', 'room rent'],
      'utilities': ['electricity', 'water', 'gas', 'utilities'],
      'salary': ['salary', 'sal'],
      'freelance': ['freelance', 'project', 'client'],
      'gift': ['gift', 'birthday'],
      'other_expense': ['other'],
      'other_income': ['other income']
    }
    
    if (!foundCategory) {
      for (const [catId, aliases] of Object.entries(categoryAliases)) {
        for (const alias of aliases) {
          if (lowerText.includes(alias)) {
            foundCategory = catId
            if (incomeCategories.some(c => c.id === catId)) {
              transactionType = 'income'
            }
            break
          }
        }
        if (foundCategory) break
      }
    }
    
    if (!foundCategory) {
      foundCategory = transactionType === 'income' ? 'other_income' : 'other_expense'
    }
    
    if (amount && amount > 0) {
      const parsed = {
        type: transactionType,
        amount: amount,
        category: foundCategory,
        description: text,
        date: format(new Date(), 'yyyy-MM-dd')
      }
      setParsedData(parsed)
      setStatus('confirm')
    } else {
      setStatus('error')
      setTimeout(() => {
        setStatus('idle')
        setTranscript('')
      }, 2000)
    }
  }

  const confirmTransaction = async () => {
    if (parsedData) {
      setStatus('saving')
      try {
        const result = await addTransaction(parsedData)
        if (result) {
          setStatus('success')
          setTimeout(() => {
            setStatus('idle')
            setTranscript('')
            setParsedData(null)
          }, 1500)
        } else {
          setStatus('error')
          setTimeout(() => {
            setStatus('confirm')
          }, 2000)
        }
      } catch (error) {
        console.error('Error saving transaction:', error)
        setStatus('error')
        setTimeout(() => {
          setStatus('confirm')
        }, 2000)
      }
    }
  }

  const cancelTransaction = () => {
    setStatus('idle')
    setTranscript('')
    setParsedData(null)
  }

  const startListening = () => {
    if (recognition) {
      setTranscript('')
      setParsedData(null)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
  }

  const getCategoryName = (catId) => {
    const allCategories = [...expenseCategories, ...incomeCategories]
    const cat = allCategories.find(c => c.id === catId)
    return cat ? `${cat.emoji} ${cat.name}` : catId
  }

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return (
      <div className="voice-input-container">
        <button 
          className="voice-btn" 
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
          title="Voice input not supported in this browser"
          disabled
        >
          <AlertCircle size={20} />
          <span>Voice N/A</span>
        </button>
      </div>
    )
  }

  return (
    <div className="voice-input-container">
      {status === 'idle' && (
        <button 
          className="voice-btn"
          onClick={startListening}
          title="Voice Input - Speak to add expense"
        >
          <Mic size={24} />
          <span>Voice Add</span>
        </button>
      )}

      {status === 'listening' && (
        <div className="voice-active">
          <button className="voice-btn listening" onClick={stopListening}>
            <MicOff size={24} />
            <span>Listening...</span>
          </button>
          {transcript && (
            <div className="voice-transcript">
              "{transcript}"
            </div>
          )}
        </div>
      )}

      {status === 'parsing' && (
        <div className="voice-status">
          <Loader size={20} className="spin" />
          <span>Processing...</span>
        </div>
      )}

      {status === 'confirm' && parsedData && (
        <div className="voice-confirm">
          <div className="voice-parsed">
            <span className={`type-badge ${parsedData.type}`}>
              {parsedData.type === 'income' ? 'Income' : 'Expense'}
            </span>
            <span className="amount">₹{parsedData.amount.toLocaleString('en-IN')}</span>
            <span className="category">{getCategoryName(parsedData.category)}</span>
          </div>
          <div className="voice-actions">
            <button className="icon-btn success" onClick={confirmTransaction} title="Confirm">
              <Check size={20} />
            </button>
            <button className="icon-btn danger" onClick={cancelTransaction} title="Cancel">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {status === 'saving' && (
        <div className="voice-status">
          <Loader size={20} className="spin" />
          <span>Saving...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="voice-status success">
          <Check size={20} />
          <span>Added!</span>
        </div>
      )}

      {status === 'error' && (
        <div className="voice-status error">
          <X size={20} />
          <span>Could not understand. Try again.</span>
        </div>
      )}
    </div>
  )
}

export default VoiceInput
