import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Avatar, Button, Card, Empty, Table, Tag, Typography } from 'antd';
import { UserOutlined, TeamOutlined, MailOutlined, TrophyOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function DepartmentDetailsPage() {
  const { deptName } = useParams();
  const [hod, setHod] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hodRes, mentorRes, leaderboardRes] = await Promise.all([
          api.get(`/users/hod-by-department?department=${encodeURIComponent(deptName)}`).catch(() => ({ data: null })),
          api.get(`/users/mentors?department=${encodeURIComponent(deptName)}`).catch(() => ({ data: [] })),
          api.get(`/analytics/department/${encodeURIComponent(deptName)}/mentors`).catch(() => ({ data: [] }))
        ]);

        setHod(hodRes.data);
        setMentors(mentorRes.data || []);
        setLeaderboard(leaderboardRes.data || []);
      } catch (error) {
        toast.error('Failed to load department details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deptName]);

  const leaderboardColumns = [
    {
      title: 'Rank & Mentor',
      key: 'mentor',
      render: (_, record, index) => (
        <div className="avatar-cell">
          <Tag color="default">#{index + 1}</Tag>
          <Avatar src={record.profileImage?.url || undefined} icon={!record.profileImage?.url && <UserOutlined />} />
          <div>
            <div style={{ fontWeight: 700 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.mtsNumber}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Feedback Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      align: 'right',
      render: value => <span style={{ fontWeight: 800, color: '#111c2d' }}>{value}</span>
    }
  ];

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Department Details</div>
          <h1 className="admin-page-title">{deptName}</h1>
          <p className="admin-page-description">
            Faculty leadership, mentor contribution, and academic oversight for this department.
          </p>
        </div>

        <div className="admin-actions">
          <Button>Export Report</Button>
          <Button type="primary">Edit Details</Button>
        </div>
      </div>

      <div className="split-dashboard" style={{ marginBottom: 18 }}>
        <Card className="surface-panel" loading={loading} variant="borderless">
          {hod ? (
            <div style={{ textAlign: 'center' }}>
              <div className="reference-chip" style={{ marginBottom: 16 }}>Head of Department</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar src={hod.profileImage?.url || undefined} icon={!hod.profileImage?.url && <UserOutlined />} size={112} />
              </div>
              <div style={{ marginTop: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28 }}>{hod.name}</div>
              <Text type="secondary">{hod.designation || 'Head of Department'}</Text>
              <div className="chip-group" style={{ justifyContent: 'center', marginTop: 12 }}>
                <span className="reference-chip">{deptName}</span>
                <span className="reference-chip">{hod.mtsNumber}</span>
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 22, textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <MailOutlined />
                  <span>{hod.email}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <TeamOutlined />
                  <span>{mentors.length} faculty assigned</span>
                </div>
              </div>
            </div>
          ) : (
            <Empty description="No HOD assigned to this department yet." />
          )}
        </Card>

        <div className="dashboard-side-stack">
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Total Faculty</div>
              <div className="metric-value">{mentors.length}</div>
            </Card>
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Active Mentees</div>
              <div className="metric-value">{mentors.reduce((sum, mentor) => sum + (mentor.menteeCount || 0), 0)}</div>
            </Card>
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Top Score</div>
              <div className="metric-value">{leaderboard[0]?.totalScore || 0}</div>
            </Card>
          </div>

          <Card
            className="surface-panel table-panel"
            variant="borderless"
            title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Mentor Contribution Leaderboard</span>}
          >
            <Table
              columns={leaderboardColumns}
              dataSource={leaderboard}
              rowKey="_id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </div>
      </div>

      <Card
        className="surface-panel"
        variant="borderless"
        title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Faculty Directory</span>}
      >
        {mentors.length === 0 ? (
          <Empty description="No faculty members found in this department." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {mentors.map(mentor => (
              <Card key={mentor._id} className="surface-panel" variant="borderless">
                <div className="avatar-cell" style={{ alignItems: 'flex-start' }}>
                  <Avatar src={mentor.profileImage?.url || undefined} icon={!mentor.profileImage?.url && <UserOutlined />} size={54} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontFamily: 'Manrope, sans-serif', fontSize: 18 }}>{mentor.name}</div>
                    <div style={{ color: '#4b41e1', fontWeight: 600 }}>{mentor.designation || 'Faculty'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{mentor.email}</div>
                  </div>
                </div>
                <div className="chip-group" style={{ marginTop: 14 }}>
                  <span className="reference-chip">{mentor.mtsNumber}</span>
                  <span className="reference-chip">{deptName}</span>
                </div>
                <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#5e6370', fontSize: 13 }}>
                    <TrophyOutlined style={{ marginRight: 6 }} />
                    {leaderboard.find(item => item._id === mentor._id)?.totalScore || 0} points
                  </div>
                  <Link to={`/mentor/${mentor._id}`}>
                    <Button type="link" style={{ paddingInline: 0, fontWeight: 700 }}>View Details</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
