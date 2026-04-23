import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Empty, Spin, Table, Tag } from 'antd';
import { MailOutlined, IdcardOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import api from '../api';

function HodDetailsPage() {
  const { id } = useParams();
  const [hod, setHod] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hodsRes, mentorsRes] = await Promise.all([api.get('/users/hods'), api.get('/users/mentors')]);
        const targetHod = (hodsRes.data || []).find((item) => item._id === id);
        setHod(targetHod || null);

        if (targetHod) {
          const departmentMentors = (mentorsRes.data || []).filter((mentor) => mentor.department === targetHod.department);
          setMentors(departmentMentors);
        } else {
          setMentors([]);
        }
      } catch (error) {
        console.error('Failed to load HOD details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <Spin />;
  }

  if (!hod) {
    return (
      <Card className="surface-panel">
        <Empty description="HOD not found.">
          <Link to="/hods">
            <Button type="primary">Return to HODs</Button>
          </Link>
        </Empty>
      </Card>
    );
  }

  const mentorColumns = [
    {
      title: 'Faculty Profile',
      key: 'profile',
      render: (_, record) => (
        <div className="avatar-cell">
          <Avatar src={record.profileImage?.url || undefined} icon={!record.profileImage?.url && <UserOutlined />} size={42}>
            {record.name?.slice(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 700, color: '#111c2d' }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'MTS ID',
      dataIndex: 'mtsNumber',
      key: 'mtsNumber',
      render: (value) => <Tag color="default">{value || 'N/A'}</Tag>
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (value) => value || 'Faculty'
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Link to={`/mentor/${record._id}`}>
          <Button type="link" style={{ paddingInline: 0, fontWeight: 700 }}>
            View Mentor
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">HOD Profile</div>
          <h1 className="admin-page-title">{hod.name}</h1>
          <p className="admin-page-description">
            Department leadership profile, contact details, and assigned faculty roster.
          </p>
        </div>
      </div>

      <Card className="surface-panel" variant="borderless" style={{ marginBottom: 18 }}>
        <div className="profile-hero">
          <Avatar src={hod.profileImage?.url || undefined} size={110} icon={!hod.profileImage?.url && <UserOutlined />}>
            {hod.name?.slice(0, 2).toUpperCase()}
          </Avatar>

          <div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 30, color: '#111c2d' }}>{hod.name}</div>
            <div className="chip-group" style={{ marginTop: 12 }}>
              <span className="reference-chip">{hod.department}</span>
              <span className="reference-chip">{hod.designation || 'HOD'}</span>
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 16, color: '#5f6675' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <MailOutlined />
                <span>{hod.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <IdcardOutlined />
                <span>{hod.mtsNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="chip-group" style={{ justifyContent: 'flex-end' }}>
            <span className="reference-chip">
              <TeamOutlined />
              {mentors.length} Faculty
            </span>
          </div>
        </div>
      </Card>

      <Card
        className="surface-panel table-panel"
        variant="borderless"
        title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Assigned Faculty / Mentors</span>}
      >
        {mentors.length === 0 ? (
          <Empty description="No mentors assigned to this department yet." />
        ) : (
          <Table
            dataSource={mentors}
            columns={mentorColumns}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 600 }}
          />
        )}
      </Card>
    </div>
  );
}

export default HodDetailsPage;
