import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Avatar,
  Button,
  Card,
  Input,
  Progress,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd';
import {
  WarningOutlined,
  FileDoneOutlined,
  UserOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function AttendanceMonitorPage() {
  const [data, setData] = useState([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        const { data } = await api.get('/attendance/overview');
        setData(data.monitor || []);
        setLowAttendanceStudents(data.lowAttendanceStudents || []);
      } catch (err) {
        toast.error('Failed to load attendance monitoring data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMonitoringData();
  }, []);

  const overallCompliance = useMemo(() => {
    if (!data.length) return 0;
    const compliant = data.filter(item => !item.isFlagged).length;
    return Math.round((compliant / data.length) * 100);
  }, [data]);

  const summaryCards = [
    {
      label: 'Overall Compliance',
      value: `${overallCompliance}%`,
      tone: 'positive',
      note: `${Math.max(data.length - data.filter(item => item.isFlagged).length, 0)} compliant mentors`
    },
    {
      label: 'Missing Logs',
      value: data.filter(item => item.missingWeeksFlag).length,
      tone: 'danger',
      note: 'Requires immediate action'
    },
    {
      label: 'Total Mentees Monitored',
      value: data.reduce((sum, item) => sum + (item.totalMentees || 0), 0),
      tone: 'warning',
      note: `${new Set(data.map(item => item.department).filter(Boolean)).size} departments in scope`
    }
  ];

  const filteredFaculty = useMemo(() => {
    if (!query) return data;
    const search = query.toLowerCase();
    return data.filter(record =>
      record.mentorName?.toLowerCase().includes(search) ||
      record.department?.toLowerCase().includes(search) ||
      record.mentorEmail?.toLowerCase().includes(search)
    );
  }, [data, query]);

  const filteredStudents = useMemo(() => {
    if (!query) return lowAttendanceStudents;
    const search = query.toLowerCase();
    return lowAttendanceStudents.filter(record =>
      record.studentName?.toLowerCase().includes(search) ||
      record.department?.toLowerCase().includes(search) ||
      record.registerNumber?.toLowerCase().includes(search) ||
      record.attendanceAction?.note?.toLowerCase().includes(search)
    );
  }, [lowAttendanceStudents, query]);

  const columns = [
    {
      title: 'Faculty Profile',
      dataIndex: 'mentorName',
      key: 'mentorName',
      render: (text, record) => (
        <div className="avatar-cell">
          <Link to={`/mentor/${record.mentorId}`}>
            <Avatar
              src={record.mentorProfileImage?.url || undefined}
              icon={!record.mentorProfileImage?.url && <UserOutlined />}
              size={42}
            />
          </Link>
          <div>
            <Link to={`/mentor/${record.mentorId}`} className="muted-link" style={{ fontWeight: 700 }}>
              {text}
            </Link>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{record.department}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Last Logged Date',
      dataIndex: 'lastLoggedDate',
      key: 'lastLoggedDate',
      render: value => (
        <span style={{ color: value ? '#111c2d' : '#6b7280', fontWeight: value ? 600 : 500 }}>
          {value ? dayjs(value).format('DD MMM YYYY') : 'Never'}
        </span>
      )
    },
    {
      title: 'Total Mentees',
      dataIndex: 'totalMentees',
      key: 'totalMentees',
      align: 'center'
    },
    {
      title: 'Avg. Attendance',
      dataIndex: 'avgMenteePercentage',
      key: 'avgMenteePercentage',
      render: value => (
        <div style={{ minWidth: 120 }}>
          <Progress
            percent={value}
            showInfo={false}
            strokeColor={value < 75 ? '#ef4444' : value < 85 ? '#f59e0b' : '#14b8a6'}
            railColor="#ece8ee"
            size={{ height: 7 }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: value < 75 ? '#b91c1c' : '#111c2d' }}>{value}%</span>
        </div>
      )
    },
    {
      title: 'Low Attendance',
      dataIndex: 'lowAttendanceCount',
      key: 'lowAttendanceCount',
      align: 'center',
      render: value => (
        <Tag color={value ? 'warning' : 'default'} style={{ borderRadius: 999, paddingInline: 10 }}>
          {value}
        </Tag>
      )
    },
    {
      title: 'Compliance Status',
      key: 'status',
      render: (_, record) => {
        if (record.isFlagged && record.missingWeeksFlag) {
          return <Tag color="error" icon={<WarningOutlined />}>Missing Logs</Tag>;
        }
        if (record.isFlagged) {
          return <Tag color="warning" icon={<WarningOutlined />}>Low Attendance</Tag>;
        }
        return <Tag color="success" icon={<FileDoneOutlined />}>Compliant</Tag>;
      }
    }
  ];

  const attendanceLogColumns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: value => <Text strong>{value}</Text>
    },
    {
      title: 'Faculty / Mentor',
      key: 'mentor',
      render: (_, record) => (
        <div className="avatar-cell">
          <Avatar
            src={record.mentorProfileImage?.url || undefined}
            icon={!record.mentorProfileImage?.url && <UserOutlined />}
            size={36}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{record.mentorName}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.mentorEmail}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Last Logged',
      dataIndex: 'lastLoggedDate',
      key: 'lastLoggedDate',
      render: value => (value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : 'Never')
    }
  ];

  const lowAttendanceColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.studentName}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Reg: {record.registerNumber}</div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Mentor Details',
      key: 'mentor',
      render: (_, record) =>
        record.mentor ? (
          <div>
            <div style={{ fontWeight: 700 }}>{record.mentor.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.mentor.mtsNumber}</div>
          </div>
        ) : (
          <Text type="secondary">Unassigned</Text>
        )
    },
    {
      title: 'Cumulative Attendance',
      dataIndex: 'cumulativeAttendance',
      key: 'cumulativeAttendance',
      render: value => <Tag color="error">{value}%</Tag>
    },
    {
      title: 'Mentor Action',
      key: 'attendanceAction',
      render: (_, record) =>
        record.attendanceAction?.note ? (
          <div style={{ maxWidth: 320 }}>
            <div style={{ color: '#111c2d', fontWeight: 600 }}>{record.attendanceAction.note}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              {record.attendanceAction.updatedBy?.name || 'Mentor'}
            </div>
          </div>
        ) : (
          <Text type="secondary">No action recorded yet</Text>
        )
    }
  ];

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Compliance Monitor</div>
          <h1 className="admin-page-title">Faculty Attendance Monitoring</h1>
          <p className="admin-page-description">
            Track faculty compliance in submitting weekly attendance logs and surface mentees at risk.
          </p>
        </div>

        <div className="admin-actions">
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
        </div>
      </div>

      <div className="metric-grid" style={{ marginBottom: 18 }}>
        {summaryCards.map(card => (
          <Card key={card.label} className="surface-panel metric-card" variant="borderless">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="metric-label">{card.label}</div>
              <div className="metric-value">{card.value}</div>
              <div className={`metric-footnote ${card.tone}`}>{card.note}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="surface-panel table-panel" variant="borderless">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Compliance Monitor',
              children: (
                <>
                  <div className="table-toolbar">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search faculty..."
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                    />
                    <div className="admin-actions">
                      <Button icon={<FilterOutlined />}>Filter</Button>
                      <Button icon={<DownloadOutlined />}>Export</Button>
                    </div>
                  </div>
                  <Table
                    columns={columns}
                    dataSource={filteredFaculty}
                    rowKey="mentorId"
                    loading={loading && filteredFaculty.length > 0}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 900 }}
                    locale={{ emptyText: 'No records found.' }}
                  />
                </>
              )
            },
            {
              key: '2',
              label: 'Attendance Log',
              children: (
                <Table
                  columns={attendanceLogColumns}
                  dataSource={filteredFaculty}
                  rowKey="mentorId"
                  loading={loading && filteredFaculty.length > 0}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 600 }}
                  locale={{ emptyText: 'No records found.' }}
                />
              )
            },
            {
              key: '3',
              label: 'Low Attendance Students',
              children: (
                <Table
                  columns={lowAttendanceColumns}
                  dataSource={filteredStudents}
                  rowKey="studentId"
                  loading={loading && filteredStudents.length > 0}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                  locale={{ emptyText: 'No records found.' }}
                />
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
