import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Typography, Card, Table, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import api from '../api';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

function AdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/departments');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load department analytics.');
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
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: text => <Text strong style={{ color: '#3b82f6' }}>{text}</Text>
    },
    {
      title: 'Total Contribution Score',
      dataIndex: 'departmentScore',
      key: 'departmentScore',
      align: 'right',
      render: val => <Text style={{ color: '#10b981', fontWeight: 600, fontSize: 16 }}>{val} pts</Text>
    }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ marginBottom: 4, color: '#0f172a' }}>Admin Dashboard</Title>
          <Text type="secondary" style={{ display: 'block' }}>
            System Administrator View & Analytics
          </Text>
        </div>
      </div>
      
      <Row gutter={[16, 16]} style={{ paddingBottom: 32, borderBottom: '1px solid #e2e8f0', marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={8}>
          <Link to="/hods" style={{ display: 'block' }}>
            <Button block type="primary" style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, height: 44, fontWeight: 500 }}>
              Manage HOD Profiles
            </Button>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link to="/departments" style={{ display: 'block' }}>
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
      </Row>

      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ color: '#0f172a', marginBottom: 8 }}>Department Contribution Leaderboard</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Rankings based on aggregated mentor and student activity points.
        </Text>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}><Spin size="large" /></div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
             <Text type="secondary">No activity data available to generate leaderboard.</Text>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} xl={14}>
              <Card title="Analytics Chart" bordered={false} style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ height: 350, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                      <Tooltip 
                        cursor={{ fill: '#f1f5f9' }} 
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="departmentScore" name="Points" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} xl={10}>
              <Card title="Rankings Table" bordered={false} style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} bodyStyle={{ padding: 0 }}>
                <Table 
                  columns={columns} 
                  dataSource={data} 
                  rowKey="department" 
                  pagination={false}
                  size="middle"
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>

    </div>
  );
}

export default AdminDashboard;
