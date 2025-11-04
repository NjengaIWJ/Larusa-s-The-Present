
import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Moon, Package, Settings, ShoppingCart, Sun, User, UserPlus, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import useCart from './stores/useCart'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProducts from './pages/AdminProducts'
import AdminProductForm from './pages/AdminProductForm'
import useAuth from './stores/useAuth'
import { useToast } from './stores/useToast'
import Toast from './components/ui/Toast'
import ImageWithFallback from './components/ui/ImageWithFallback'

const App:React.FC=()=> {
  const navigate = useNavigate()
  const user = useAuth(s => s.user)
  const clearAuth = useAuth(s => s.clearAuth)
  const [theme, setTheme] = useState<'light'|'dark'>(() => (typeof window !== 'undefined' && localStorage.getItem('tp_theme') === 'dark') ? 'dark' : 'light')
  const { message, type, isVisible, hideToast } = useToast()
  const cartItems = useCart(s => s.items)
  const cartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  try { localStorage.setItem('tp_theme', theme) } catch (e) { console.warn('failed to save theme', e) }
  }, [theme])

  return (
    <div className="theme-root min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toast 
        message={message}
        type={type}
        isVisible={isVisible}
        onClose={hideToast}
      />
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="container-max flex items-center justify-between gap-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 transition-transform hover:scale-105">
              <ImageWithFallback
                src={'/images/ChatGPT Image Nov 4, 2025, 10_12_38 AM.png'}
                alt="The Present logo"
                className="h-10 w-10 rounded-md object-cover"
              />
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-lg sm:text-2xl font-extrabold text-tpred">The Present</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Gifts & Curios</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-4">
              <Link 
                to="/cart" 
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-200 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-colors"
              >
                <motion.span key={cartCount} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} className="relative inline-flex items-center">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                      {cartCount}
                    </span>
                  )}
                </motion.span>
                <span className="ml-1">Cart</span>
              </Link>
              <Link 
                to="/orders" 
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-200 dark:hover:text-indigo-400 dark:hover:bg-gray-800 transition-colors"
              >
                <Package className="h-4 w-4" />
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin/products" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="sm:hidden ml-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4 inline-block mr-2" />
                  {user.name}
                </span>
                <button 
                  onClick={() => { clearAuth(); navigate('/login'); }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="sm:hidden bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 space-y-2">
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200">
                <ShoppingCart className="h-4 w-4" /> Cart
              </Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200">
                <Package className="h-4 w-4" /> Orders
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/products" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-indigo-600">
                  <Settings className="h-4 w-4" /> Admin
                </Link>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                {user ? (
                  <>
                    <div className="text-sm text-gray-700 dark:text-gray-200">{user.name}</div>
                    <button onClick={() => { clearAuth(); navigate('/login'); setMobileOpen(false) }} className="w-full text-left mt-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md bg-indigo-600 text-white text-center">Sign in</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block mt-2 px-3 py-2 rounded-md border text-center">Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="py-6">
        <div className="container-max">
  <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute>} />
          <Route path="/admin/products/:id" element={<ProtectedRoute adminOnly><AdminProductForm /></ProtectedRoute>} />
        </Routes>
        </div>
      </main>
    </div>
  )
}

export default App