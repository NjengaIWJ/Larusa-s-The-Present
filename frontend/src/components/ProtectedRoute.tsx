import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../stores/useAuth'

type Props = { children: React.ReactElement; adminOnly?: boolean }

export default function ProtectedRoute({ children, adminOnly }: Props) {
  const token = useAuth((s) => s.token)
  const user = useAuth((s) => s.user)
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}
