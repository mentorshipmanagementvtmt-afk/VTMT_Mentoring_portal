import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import api from 'api';
import { Card, Typography, Spin, Button,  Tag } from 'antd';
import { ArrowLeftOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function MentorDetailsPage() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await api.get(`/users/mentor/${mentorId}`);
        setMentor(res.data);
      } catch (err) {
        toast.error('Failed to load mentor details');
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [mentorId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Title level={3}>Mentor Not Found</Title>
        <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link to={`/departments/${mentor.department}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to {mentor.department} Department
        </Link>

        <Card 
          variant="borderless" 
          style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          styles={{ body: { padding: '40px' } }}
        >
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 32, marginBottom: 32 }}>
            {mentor.profileImage?.url ? (
              <img src={mentor.profileImage.url} alt="Profile" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700, color: '#94a3b8', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                {mentor.name.charAt(0)}
              </div>
            )}
            <div>
              <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>{mentor.name}</Title>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <Tag color="cyan" style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{mentor.department}</Tag>
                <Tag color="blue" style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Faculty</Tag>
              </div>
              <Text type="secondary" style={{ display: 'block', fontSize: 16 }}>{mentor.email}</Text>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>MTS Number</Text>
              <Text style={{ fontSize: 16, color: '#1e293b', fontWeight: 600 }}>{mentor.mtsNumber}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Designation</Text>
              <Text style={{ fontSize: 16, color: '#1e293b', fontWeight: 600 }}>{mentor.designation}</Text>
            </div>
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
             <Link to={`/mentor/${mentor._id}/mentees`}>
              <Button type="dashed" size="large" icon={<TeamOutlined />} style={{ borderRadius: 8, color: '#6366f1', borderColor: '#c7d2fe', background: '#eef2ff', fontWeight: 600 }}>
                View Mentees
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MentorDetailsPage;
