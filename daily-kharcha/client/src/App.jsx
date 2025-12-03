import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { ExpenseProvider } from './context/ExpenseContext'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Calculator from './pages/Calculator'
import Notes from './pages/Notes'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Recurring from './pages/Recurring'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  BarChart3, 
  Calculator as CalcIcon, 
  StickyNote,
  Wallet,
  PiggyBank,
  Target,
  RefreshCw,
  Activity,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react'

function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate()
  
  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={e => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <h3>More Options</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="mobile-menu-items">
          <button className="mobile-menu-item" onClick={() => handleNavigate('/budget')}>
            <PiggyBank size={20} />
            <span>Budget</span>
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('/recurring')}>
            <RefreshCw size={20} />
            <span>Recurring</span>
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('/reports')}>
            <BarChart3 size={20} />
            <span>Reports</span>
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('/calculator')}>
            <CalcIcon size={20} />
            <span>Calculator</span>
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('/notes')}>
            <StickyNote size={20} />
            <span>Notes</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="app-container">
          <aside className="sidebar">
            <div className="sidebar-logo">
              <Wallet size={32} />
              <h1>Daily Kharcha</h1>
            </div>
            
            <nav>
              <ul className="nav-menu">
                <li>
                  <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/transactions" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ArrowLeftRight size={20} />
                    Transactions
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/budget" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <PiggyBank size={20} />
                    Budget
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/goals" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Target size={20} />
                    Savings Goals
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/recurring" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <RefreshCw size={20} />
                    Recurring
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/analytics" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Activity size={20} />
                    Analytics
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <BarChart3 size={20} />
                    Reports
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/calculator" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <CalcIcon size={20} />
                    Calculator
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/notes" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <StickyNote size={20} />
                    Notes
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                    <SettingsIcon size={20} />
                    Settings
                  </NavLink>
                </li>
              </ul>
            </nav>
          </aside>
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/recurring" element={<Recurring />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

          <nav className="bottom-nav">
            <NavLink to="/" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Home</span>
            </NavLink>
            <NavLink to="/transactions" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <ArrowLeftRight size={20} />
              <span>Transactions</span>
            </NavLink>
            <NavLink to="/goals" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Target size={20} />
              <span>Goals</span>
            </NavLink>
            <NavLink to="/analytics" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={20} />
              <span>Analytics</span>
            </NavLink>
            <button className="bottom-nav-item" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
              <span>More</span>
            </button>
          </nav>
          
          <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </div>
  )
}

function App() {
  return (
    <ExpenseProvider>
      <Router>
        <AppContent />
      </Router>
    </ExpenseProvider>
  )
}

export default App
