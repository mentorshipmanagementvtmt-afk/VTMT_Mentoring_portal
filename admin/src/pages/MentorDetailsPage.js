import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import { Avatar, Button, Card, Empty, Spin, Tag } from 'antd';
import { TeamOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api';

function MentorDetailsPage() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const response = await api.get(`/users/mentor/${mentorId}`);
        setMentor(response.data);
      } catch (error) {
        toast.error('Failed to load mentor details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId]);

  if (loading) {
    return <Spin />;
  }

  if (!mentor) {
    return (
      <Card className="surface-panel">
        <Empty description="Mentor not found.">
          <Link to="/departments">
            <Button type="primary">Back to Departments</Button>
          </Link>
        </Empty>
      </Card>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Mentor Profile</div>
          <h1 className="admin-page-title">{mentor.name}</h1>
          <p className="admin-page-description">
            Faculty details, department assignment, and quick actions for mentee tracking.
          </p>
        </div>
      </div>

      <Card className="surface-panel" variant="borderless">
        <div className="profile-hero">
          <Avatar src={mentor.profileImage?.url || undefined} size={110} icon={!mentor.profileImage?.url && <UserOutlined />}>
            {mentor.name?.slice(0, 2).toUpperCase()}
          </Avatar>

          <div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 30, color: '#111c2d' }}>{mentor.name}</div>
            <div style={{ color: '#5f6675', marginTop: 6 }}>{mentor.email}</div>
            <div className="chip-group" style={{ marginTop: 12 }}>
              <span className="reference-chip">{mentor.department}</span>
              <span className="reference-chip">{mentor.designation || 'Faculty'}</span>
              <span className="reference-chip">{mentor.mtsNumber || 'N/A'}</span>
            </div>
          </div>

          <div className="chip-group" style={{ justifyContent: 'flex-end' }}>
            <Tag color="default" style={{ borderRadius: 999, paddingInline: 12 }}>
              Faculty
            </Tag>
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to={`/departments/${mentor.department}`}>
            <Button>Back to {mentor.department}</Button>
          </Link>
          <Link to={`/mentor/${mentor._id}/mentees`}>
            <Button type="primary" icon={<TeamOutlined />}>
              View Mentees
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default MentorDetailsPage;
