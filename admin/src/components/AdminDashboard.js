import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Empty,
  Progress,
  Typography
} from 'antd';
import {
  BankOutlined,
  BarChartOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  WarningOutlined,
  RiseOutlined,
  PlusOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import api from '../api';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

const chartColors = ['#4b41e1', '#645efb', '#0f766e', '#f59e0b', '#1e293b', '#ef4444'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    hods: 0,
    mentors: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, attendanceRes, hodsRes, mentorsRes, studentsRes] = await Promise.all([
          api.get('/analytics/departments'),
          api.get('/attendance/monitor'),
          api.get('/users/hods'),
          api.get('/users/mentors'),
          api.get('/students')
        ]);

        const attendanceData = attendanceRes.data || [];
        const flagged = attendanceData.filter(item => item.isFlagged);

        setAnalytics(analyticsRes.data || []);
        setAlerts(flagged);
        setStats({
          hods: (hodsRes.data || []).length,
          mentors: (mentorsRes.data || []).length,
          students: (studentsRes.data || []).length
        });
      } catch (err) {
        toast.error('Failed to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const complianceRate = useMemo(() => {
    if (!alerts.length && !analytics.length && !stats.mentors) return 0;
    const assumedTotal = Math.max(stats.mentors, alerts.length);
    if (!assumedTotal) return 100;
    return Math.max(0, Math.round(((assumedTotal - alerts.length) / assumedTotal) * 100));
  }, [alerts.length, analytics.length, stats.mentors]);

  const metricCards = [
    {
      label: 'Total HODs',
      value: stats.hods,
      icon: <BankOutlined />,
      footnote: '+ active profiles',
      tone: 'positive'
    },
    {
      label: 'Total Mentors',
      value: stats.mentors,
      icon: <UsergroupAddOutlined />,
      footnote: `${alerts.length} flagged`,
      tone: alerts.length ? 'warning' : 'positive'
    },
    {
      label: 'Total Students',
      value: stats.students,
      icon: <TeamOutlined />,
      footnote: 'Directory synced',
      tone: 'positive'
    },
    {
      label: 'Compliance Rate',
      value: `${complianceRate}%`,
      icon: <BarChartOutlined />,
      footnote: alerts.length ? 'Needs follow-up' : 'Healthy',
      tone: alerts.length ? 'danger' : 'positive'
    }
  ];

  const quickActions = [
    { label: 'Manage HODs', to: '/hods' },
    { label: 'Manage Faculty', to: '/departments' },
    { label: 'Manage Students', to: '/students' },
    { label: 'Attendance Review', to: '/attendance/monitor' }
  ];

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">System Overview</div>
          <h1 className="admin-page-title">System Admin Dashboard</h1>
          <p className="admin-page-description">
            Overview of mentorship operations, faculty compliance, and department activity across the institution.
          </p>
        </div>

        <div className="admin-actions">
          <Button icon={<BarChartOutlined />}>Current Term: Fall 2024</Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Export Report
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          message="Attention required"
          description={`${alerts.length} mentor records are flagged for missing logs or low attendance and should be reviewed.`}
          className="surface-panel"
          style={{ marginBottom: 18 }}
        />
      )}

      <div className="metric-grid" style={{ marginBottom: 18 }}>
        {metricCards.map(card => (
          <Card key={card.label} className="surface-panel metric-card" variant="borderless">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: '#eef2ff',
                  color: '#4b41e1',
                  fontSize: 18
                }}
              >
                {card.icon}
              </div>
              <div className="metric-label" style={{ marginTop: 18 }}>{card.label}</div>
              <div className="metric-value">{card.value}</div>
              <div className={`metric-footnote ${card.tone}`}>
                <RiseOutlined />
                {card.footnote}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="split-dashboard">
        <Card
          className="surface-panel"
          title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Department Contribution</span>}
          extra={<Text type="secondary">Activity points based on mentor and student logging</Text>}
        >
          {loading && analytics.length > 0 ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
              <Text type="secondary">Loading records...</Text>
            </div>
          ) : analytics.length === 0 ? (
            <Empty description="No records found for department contribution." />
          ) : (
            <div style={{ height: 330 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece8ee" />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f4f1f8' }}
                    contentStyle={{ borderRadius: 14, border: '1px solid #ece8ee', boxShadow: '0 18px 30px rgba(9,20,38,0.08)' }}
                  />
                  <Bar dataKey="departmentScore" radius={[8, 8, 0, 0]}>
                    {analytics.map((entry, index) => (
                      <Cell key={entry.department} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="dashboard-side-stack">
          <Card className="surface-panel danger-panel" variant="borderless">
            <Title level={4} style={{ marginTop: 0, marginBottom: 6, fontFamily: 'Manrope, sans-serif' }}>
              Attention Required
            </Title>
            <Text style={{ color: '#7f1d1d' }}>Critical compliance issues detected in recent attendance activity.</Text>

            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              {alerts.slice(0, 4).map(alert => (
                <div
                  key={alert.mentorId}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.72)',
                    border: '1px solid rgba(186,26,26,0.12)'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#7f1d1d' }}>{alert.mentorName}</div>
                  <div style={{ marginTop: 4, color: '#8b3a3a', fontSize: 13 }}>
                    {alert.missingWeeksFlag
                      ? 'Missing recent attendance logs'
                      : `Average mentee attendance at ${alert.avgMenteePercentage}%`}
                  </div>
                </div>
              ))}
            </div>

            <Link to="/attendance/monitor">
              <Button danger type="primary" block style={{ marginTop: 16, borderRadius: 12 }}>
                View All Alerts
              </Button>
            </Link>
          </Card>

          <Card className="surface-panel" title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Quick Actions</span>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {quickActions.map(action => (
                <Link key={action.label} to={action.to} className="activity-card-link">
                  <Card className="activity-card" style={{ borderRadius: 18, minHeight: 128 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        display: 'grid',
                        placeItems: 'center',
                        background: '#eef2ff',
                        color: '#4b41e1',
                        marginBottom: 16
                      }}
                    >
                      <ArrowRightOutlined />
                    </div>
                    <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#111c2d' }}>{action.label}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="surface-panel" title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Compliance Snapshot</span>}>
            <Text type="secondary">Mentor submission health based on the latest attendance monitoring sweep.</Text>
            <Progress percent={complianceRate} strokeColor="#4b41e1" railColor="#ece8ee" style={{ marginTop: 18 }} />
            <div className="chip-group" style={{ marginTop: 8 }}>
              <span className="reference-chip">{alerts.length} flagged mentors</span>
              <span className="reference-chip">{stats.mentors || 0} total mentors</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
