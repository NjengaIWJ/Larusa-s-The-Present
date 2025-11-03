import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  message: string
  type?: ToastType
  onClose?: () => void
  duration?: number
  isVisible?: boolean
}



const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info',
  onClose,
  duration = 3000,
  isVisible = true
}) => {
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  const variants = {
    initial: { opacity: 0, y: 50, scale: 0.3 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-blue-400" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
      default:
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-4 right-4 z-50"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${getStyles()}`}>
            {getIcon()}
            <p className="text-sm font-medium">{message}</p>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast