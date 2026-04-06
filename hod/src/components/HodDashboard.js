import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Typography, Table, Card, Spin, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../api';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

function HodDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.department) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.department]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/department/${user.department}/mentors`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load mentor contribution analytics.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (text, record, index) => <strong>#{index + 1}</strong>,
      width: 80,
    },
    {
      title: 'Mentor',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.profileImage?.url ? (
             <Avatar src={record.profileImage.url} size="large" />
          ) : (
             <Avatar icon={<UserOutlined />} size="large" />
          )}
          <div>
            <Text strong>{record.name}</Text>
            <br/>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.mtsNumber}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Contribution Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      align: 'right',
      render: val => <Text style={{ color: '#10b981', fontWeight: 600, fontSize: 16 }}>{val} pts</Text>
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ marginBottom: 4, color: '#0f172a' }}>HOD Dashboard</Title>
          <Text type="secondary" style={{ display: 'block' }}>
            Department Analytics: {user.department}
          </Text>
        </div>
      </div>
      
      <Row gutter={[16, 16]} style={{ paddingBottom: 32, borderBottom: '1px solid #e2e8f0', marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={8}>
          <Link to={"/departments/"+user.department} style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, height: 44, fontWeight: 500 }}>
              Manage Faculties
            </Button>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link to="/mentors/create" style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, height: 44, fontWeight: 500 }}>
              Add New Faculty
            </Button>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link to="/students/create" style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: 8, height: 44, fontWeight: 500 }}>
              Add New Student
            </Button>
          </Link>
        </Col>
      </Row>

      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#0f172a', marginBottom: 8 }}>Department Faculty Leaderboard</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Live rankings based on aggregate scores from students mentored by each faculty member in {user.department}.
        </Text>

        <Card bordered={false} style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 0 }}>
          {loading ? (
             <div style={{ padding: '60px 0', textAlign: 'center' }}><Spin size="large" /></div>
          ) : (
            <Table 
              columns={columns} 
              dataSource={data} 
              rowKey="_id" 
              pagination={false}
              size="middle"
              locale={{ emptyText: 'No student activities have been logged for this department yet.' }}
            />
          )}
        </Card>
      </div>

    </div>
  );
}

export default HodDashboard;
