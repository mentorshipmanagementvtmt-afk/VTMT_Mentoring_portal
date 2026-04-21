import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'

import { Layout, Button, Typography, Space, Tag } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'

const { Header, Content } = Layout;
const { Title } = Typography;

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="dash-wrap loading" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Layout className="page-shell">
      <Header role="banner" className="glass-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '64px' }}>
        <Title level={4} className="page-title" style={{ margin: 0 }}>Mentoring Portal</Title>
        <Space size="middle">
          <Tag color="blue" style={{ textTransform: 'uppercase', fontWeight: 600 }}>{user.role}</Tag>
          <Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} className="flex items-center">
            Logout
          </Button>
        </Space>
      </Header>

      <Content role="main" aria-label="Dashboard Content" className="page-container fade-in-up" style={{ padding: '24px 16px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} tabIndex={0} className="page-title" style={{ margin: 0 }}>Welcome, {user.name}</Title>
        </div>

        {/* Dynamic Dashboard Based on Role */}
        <div className="app-card" style={{ padding: '24px' }}>
          {user.role === 'admin' ? <AdminDashboard /> : <div>Access restricted to Admin.</div>}
        </div>
      </Content>
    </Layout>
  )
}

export default DashboardPage
