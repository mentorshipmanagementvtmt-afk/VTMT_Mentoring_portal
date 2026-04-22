// src/pages/LoginPage.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from 'api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Typography, Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/users/login', values);
      if (response.data.user.role !== 'mentor') {
        throw new Error('Access Denied: You are not authorized for the Mentor Portal.');
      }
      login(response.data);
      toast.success('Mentor Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main role="main" aria-label="Login Page" style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      padding: '24px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(245, 158, 11, 0.15), 0 10px 20px -5px rgba(245, 158, 11, 0.1)'
        }}
        variant="borderless"
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/brand-home-wordmark.webp"
            alt="Vel Tech Multi Tech"
            style={{ width: '100%', maxWidth: 340, marginBottom: 20 }}
          />
          <Title level={3} style={{ color: '#b45309', margin: 0, fontWeight: 700 }}>
            Vel Tech Faculty Portal
          </Title>
          <Text type="secondary" style={{ color: '#d97706' }}>
            Vel Tech Multi Tech Academic Mentorship Portal
          </Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="you@example.com" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
              placeholder="••••••••" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block 
              style={{ 
                height: '46px', 
                borderRadius: '8px', 
                background: '#f59e0b', 
                borderColor: '#f59e0b',
                fontWeight: 600,
                fontSize: '16px'
              }}
            >
              Sign in as Mentor
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="https://trakshard.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#b45309', textDecoration: 'none' }}>
            Developed by Trakshard
          </a>
        </div>
      </Card>
    </main>
  );
}

export default LoginPage;
