import React from 'react'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from '../components/AdminDashboard'

function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="dash-wrap loading" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return user.role === 'admin' ? <AdminDashboard /> : <div>Access restricted to Admin.</div>
}

export default DashboardPage
