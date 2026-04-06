import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import HodDashboard from '../components/HodDashboard'
import { Layout, Button, Typography, Space, Tag } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import MyProfileModal from '../components/MyProfileModal'

const { Header, Content } = Layout;
const { Title } = Typography;

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileModalVisible, setProfileModalVisible] = useState(false)

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
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Header role="banner" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '64px' }}>
        <Title level={4} style={{ margin: 0, color: '#0f172a' }}>Mentoring Portal</Title>
        <Space size="middle">
          <Tag color="blue" style={{ textTransform: 'uppercase', fontWeight: 600 }}>{user.role}</Tag>
          <Button type="default" icon={<UserOutlined />} onClick={() => setProfileModalVisible(true)} className="flex items-center">
            My Profile
          </Button>
          <Button type="default" icon={<LogoutOutlined />} onClick={handleLogout} className="flex items-center">
            Logout
          </Button>
        </Space>
      </Header>

      <Content role="main" aria-label="Dashboard Content" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} tabIndex={0} style={{ margin: 0, color: '#0f172a' }}>Welcome, {user.name}</Title>
        </div>

        {/* Dynamic Dashboard Based on Role */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {user.role === 'hod' ? <HodDashboard /> : <div>Access restricted to HOD.</div>}
        </div>
        <MyProfileModal visible={profileModalVisible} onClose={() => setProfileModalVisible(false)} />
        </Content>
    </Layout>
  )
}

export default DashboardPage