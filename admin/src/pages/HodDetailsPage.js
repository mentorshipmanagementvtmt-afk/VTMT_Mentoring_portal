import React, { useEffect, useState } from 'react';
import { useParams, Link , useNavigate } from 'react-router-dom';
import api from 'api';
import { Card, Typography, Row, Col, Spin, Empty, Button, Table, Tag } from 'antd';
import { ArrowLeftOutlined, MailOutlined, IdcardOutlined, BankOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function HodDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hod, setHod] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all HODs and Mentors (Admin read privileges allow this)
        const [hodsRes, mentorsRes] = await Promise.all([
          api.get('/users/hods'),
          api.get('/users/mentors')
        ]);
        
        // Find the specific HOD
        const targetHod = hodsRes.data.find(h => h._id === id);
        setHod(targetHod || null);

        // Filter the total mentors list down to THIS specific HOD's department
        if (targetHod) {
          const deptMentors = mentorsRes.data.filter(m => m.department === targetHod.department);
          setMentors(deptMentors);
        }
      } catch (error) {
        console.error("Failed to load HOD details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hod) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', height: '100vh' }}>
        <Title level={4} type="danger">HOD Not Found</Title>
        <Link to="/hods">
          <Button type="primary">Return to HODs</Button>
        </Link>
      </div>
    );
  }

  const mentorColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <span style={{ fontWeight: 500, color: '#0f172a' }}>{text}</span>
    },
    {
      title: 'MTS ID',
      dataIndex: 'mtsNumber',
      key: 'mtsNumber',
      render: text => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>

        {/* HOD Profile Card */}
        <Card 
          variant="borderless" 
          style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: 32 }}
          styles={{ body: { padding: 32 } }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              {hod.profileImage?.url ? (
                <img src={hod.profileImage.url} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#94a3b8', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  {hod.name.charAt(0)}
                </div>
              )}
              <Title level={2} style={{ margin: 0, color: '#0f172a' }}>{hod.name}</Title>
          </div>
    
              <Text style={{ fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <BankOutlined /> Department of {hod.department}
              </Text>
              <Tag color="cyan" style={{ marginTop: 16, fontSize: 14, padding: '4px 12px', borderRadius: 16 }}>{hod.designation}</Tag>
            </div>
            
            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: 12, minWidth: 300 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MailOutlined style={{ color: '#0ea5e9', fontSize: 18 }} />
                  <Text style={{ fontSize: 15 }}>{hod.email}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IdcardOutlined style={{ color: '#0ea5e9', fontSize: 18 }} />
                  <Text style={{ fontSize: 15 }}>MTS ID: <strong style={{ color: '#0f172a' }}>{hod.mtsNumber}</strong></Text>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Mentors Under HOD Section */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <UserOutlined style={{ color: '#0ea5e9' }} />
              <span style={{ fontSize: 18, color: '#0f172a' }}>Assigned Faculty/Mentors for {hod.department}</span>
            </div>
          }
          variant="outlined" 
          style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
        >
          {mentors.length === 0 ? (
            <Empty description="No Mentors assigned to this department yet." style={{ padding: '40px 0' }} />
          ) : (
            <Table 
              dataSource={mentors} 
              columns={mentorColumns} 
              rowKey="_id" 
              pagination={{ pageSize: 10 }}
              style={{ padding: '0' }}
            />
          )}
        </Card>

      </div>
    </div>
  );
}

export default HodDetailsPage;
