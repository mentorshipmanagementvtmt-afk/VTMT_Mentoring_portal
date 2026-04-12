import React from 'react';
import { Link , useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Button } from 'antd';
import { ArrowLeftOutlined, BankOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DEPARTMENTS = [
  'AI&DS',
  'IT',
  'CSE',
  'MECH',
  'CSBS',
  'Cyber Security'
];

function ManageDepartmentsPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        
        <Title level={3} style={{ marginBottom: 32, color: '#0f172a' }}>Manage Departments</Title>

        <Row gutter={[24, 24]}>
          {DEPARTMENTS.map(dept => (
            <Col xs={24} sm={12} md={8} key={dept}>
              <Link to={`/departments/${dept}`} style={{ textDecoration: 'none' }}>
                <Card 
                  hoverable 
                  style={{ borderRadius: 16, borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', textAlign: 'center', transition: 'all 0.3s ease' }}
                  styles={{ body: { padding: '40px 24px' } }}
                >
                  <BankOutlined style={{ fontSize: 48, color: '#3b82f6', marginBottom: 16 }} />
                  <Title level={4} style={{ margin: 0, color: '#0f172a' }}>{dept}</Title>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>View HOD & Faculties</Text>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default ManageDepartmentsPage;
