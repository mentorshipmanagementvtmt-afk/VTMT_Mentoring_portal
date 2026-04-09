import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Typography, Table, Card, Spin, Avatar, Alert } from 'antd';
import { UserOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../api';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

function HodDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (user?.department) {
      fetchAnalytics();
      fetchAlerts();
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

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/attendance/monitor');
      const flagged = res.data.filter(m => m.isFlagged);
      setAlerts(flagged);
    } catch (err) {
      console.log('Failed to fetch attendance alerts');
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
      
      {alerts.length > 0 && (
        <Alert
          title="Attention Required: Faculty Compliance Issues"
          description={
            <div style={{ marginTop: 8 }}>
              <p>The following faculty members have been flagged for attendance compliance issues:</p>
              <ul style={{ paddingLeft: 20 }}>
                {alerts.map(a => (
                  <li key={a.mentorId}>
                    <strong>{a.mentorName}</strong> - 
                    {a.missingWeeksFlag ? ' Missing recent attendance logs (>7 days).' : ` Low average mentee attendance (${a.avgMenteePercentage}%).`}
                  </li>
                ))}
              </ul>
              <Link to="/attendance/monitor">
                <Button type="primary" danger size="small" style={{ marginTop: 8 }}>Go to Monitoring Dashboard</Button>
              </Link>
            </div>
          }
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2' }}
        />
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingBottom: 32, borderBottom: '1px solid #e2e8f0', marginBottom: 32 }}>
        <div style={{ flex: '1 1 180px', minWidth: 160 }}>
          <Link to={"/departments/"+user.department} style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, height: 44, fontWeight: 500 }}>
              Manage Faculties
            </Button>
          </Link>
        </div>
        <div style={{ flex: '1 1 180px', minWidth: 160 }}>
          <Link to="/mentors/create" style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, height: 44, fontWeight: 500 }}>
              Add New Faculty
            </Button>
          </Link>
        </div>
        <div style={{ flex: '1 1 180px', minWidth: 160 }}>
          <Link to="/students/create" style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: 8, height: 44, fontWeight: 500 }}>
              Add New Student
            </Button>
          </Link>
        </div>
        <div style={{ flex: '1 1 180px', minWidth: 160 }}>
          <Link to="/students" style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#f59e0b', borderColor: '#f59e0b', borderRadius: 8, height: 44, fontWeight: 500 }}>
               View Students
            </Button>
          </Link>
        </div>
        <div style={{ flex: '1 1 180px', minWidth: 160 }}>
          <Link to="/mentee-allocation" style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#6366f1', borderColor: '#6366f1', borderRadius: 8, height: 44, fontWeight: 500 }}>
               Mentee Allocation
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#0f172a', marginBottom: 8 }}>Department Faculty Leaderboard</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Live rankings based on aggregate scores from students mentored by each faculty member in {user.department}.
        </Text>

        <Card variant="borderless" style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} styles={{ body: { padding: 0 } }}>
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
