import React from 'react'
import { useAuth } from '../context/AuthContext'
import HodDashboard from '../components/HodDashboard'

function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="dash-wrap loading" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return user.role === 'hod' ? <HodDashboard /> : <div>Access restricted to HOD.</div>
}

export default DashboardPage
