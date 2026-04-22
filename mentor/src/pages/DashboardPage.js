import React from 'react'
import { useAuth } from '../context/AuthContext'
import MentorDashboard from '../components/MentorDashboard'

function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="dash-wrap loading" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return user.role === 'mentor' ? <MentorDashboard /> : <div>Access restricted to Mentors.</div>
}

export default DashboardPage
