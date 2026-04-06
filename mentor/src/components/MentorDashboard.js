import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Typography } from 'antd';
import { TeamOutlined, BarChartOutlined, IdcardOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;

function MentorDashboard() {
  return (
    <div style={{ padding: '12px 0' }}>
      <Title level={4} style={{ color: '#475569', marginBottom: 24, fontWeight: 500 }}>Dashboard Navigation Flow</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Link to="/students" style={{ textDecoration: 'none' }}>
            <Card 
              hoverable
              style={{ borderRadius: 16, borderColor: '#e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}
              styles={{ body: { padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' } }}
            >
              <TeamOutlined style={{ fontSize: 48, color: '#0ea5e9', marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>Manage Students</Title>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Filter and assign actions to your mentees directly</Text>
            </Card>
          </Link>
        </Col>

        <Col xs={24} md={8}>
           <Link to="/students" style={{ textDecoration: 'none' }}>
            <Card 
              hoverable
              style={{ borderRadius: 16, borderColor: '#e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}
              styles={{ body: { padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' } }}
            >
              <IdcardOutlined style={{ fontSize: 48, color: '#8b5cf6', marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>View Student Profiles</Title>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>In-depth record tracking, activities, and logs</Text>
            </Card>
          </Link>
        </Col>

        <Col xs={24} md={8}>
          <Link to="/performance" style={{ textDecoration: 'none' }}>
            <Card 
              hoverable
              style={{ borderRadius: 16, borderColor: '#e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: '100%' }}
              styles={{ body: { padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' } }}
            >
              <BarChartOutlined style={{ fontSize: 48, color: '#10b981', marginBottom: 16 }} />
              <Title level={4} style={{ margin: 0, color: '#0f172a' }}>Faculty Contribution Dashboard</Title>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Review your department rank and global score</Text>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}

export default MentorDashboard;