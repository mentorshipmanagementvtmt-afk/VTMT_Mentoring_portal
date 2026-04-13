import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link , useNavigate } from 'react-router-dom';
import api from '../api';
import { Card, Table, Typography, Tag, Avatar, Tabs, Button } from 'antd';
import { ArrowLeftOutlined, WarningOutlined, FileDoneOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function AttendanceMonitorPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const response = await api.get('/attendance/monitor');
      setData(response.data);
    } catch (err) {
      toast.error('Failed to load attendance monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Faculty Profile',
      dataIndex: 'mentorName',
      key: 'mentorName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to={`/mentor/${record.mentorId}`}>
            <Avatar src={record.mentorProfileImage?.url || undefined} icon={!record.mentorProfileImage?.url && <UserOutlined />} size={42} style={{ cursor: 'pointer' }} />
          </Link>
          <div>
            <Link to={`/mentor/${record.mentorId}`} style={{ textDecoration: 'none' }}>
              <Text strong style={{ color: '#0ea5e9' }}>{text}</Text>
            </Link>
            <br/>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.mentorEmail} • {record.mentorMts || 'Faculty'} • {record.department}</Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.mentorName.localeCompare(b.mentorName)
    },
    {
      title: 'Last Logged Date',
      dataIndex: 'lastLoggedDate',
      key: 'lastLoggedDate',
      render: (date) => date ? dayjs(date).format('DD MMM YYYY, hh:mm A') : <Text type="secondary">Never</Text>,
      sorter: (a, b) => new Date(a.lastLoggedDate || 0) - new Date(b.lastLoggedDate || 0)
    },
    {
      title: 'Mentees',
      dataIndex: 'totalMentees',
      key: 'totalMentees',
      align: 'center'
    },
    {
      title: 'Avg. Attendance',
      dataIndex: 'avgMenteePercentage',
      key: 'avgMenteePercentage',
      render: val => <Text strong style={{ color: val < 75 ? '#ef4444' : '#10b981' }}>{val}%</Text>,
      sorter: (a, b) => a.avgMenteePercentage - b.avgMenteePercentage
    },
    {
      title: 'Low Attendance (< 75%)',
      dataIndex: 'lowAttendanceCount',
      key: 'lowAttendanceCount',
      align: 'center',
      render: count => count > 0 ? <Tag color="error">{count} Students</Tag> : <Tag color="success">None</Tag>,
      sorter: (a, b) => a.lowAttendanceCount - b.lowAttendanceCount
    },
    {
      title: 'Compliance Status',
      key: 'complianceStatus',
      render: (_, record) => {
        if (record.isFlagged) {
          if (record.missingWeeksFlag) {
            return <Tag color="red" icon={<WarningOutlined />}>Missing Logs (&gt; 7 days)</Tag>;
          }
          return <Tag color="warning" icon={<WarningOutlined />}>Student Low Attendance</Tag>;
        }
        return <Tag color="green" icon={<FileDoneOutlined />}>Compliant</Tag>;
      },
      filters: [
        { text: 'Flagged', value: true },
        { text: 'Compliant', value: false }
      ],
      onFilter: (value, record) => record.isFlagged === value
    }
  ];

  const logColumns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: text => <Text strong style={{ color: '#3b82f6' }}>{text}</Text>,
      sorter: (a, b) => a.department.localeCompare(b.department)
    },
    {
      title: 'Assigned HOD',
      dataIndex: 'hodName',
      key: 'hodName',
      render: text => <Tag color="blue">{text || 'Unassigned'}</Tag>,
    },
    {
      title: 'Faculty / Mentor',
      key: 'mentor',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to={`/mentor/${record.mentorId}`}>
            <Avatar src={record.mentorProfileImage?.url || undefined} icon={!record.mentorProfileImage?.url && <UserOutlined />} size="small" style={{ cursor: 'pointer' }} />
          </Link>
          <Link to={`/mentor/${record.mentorId}`} style={{ textDecoration: 'none' }}>
            <Text style={{ color: '#0ea5e9', cursor: 'pointer' }}>{record.mentorName}</Text>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        
        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Faculty Attendance Monitoring</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
           Track faculty compliance in submitting weekly attendance logs for their mentees.
        </Text>

        <Card variant="borderless" styles={{ body: { padding: 24 } }} style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Compliance Monitor',
              children: (
                <Table 
                  columns={columns} 
                  dataSource={data} 
                  rowKey="mentorId" 
                  loading={loading}
                  pagination={{ pageSize: 15 }}
                  locale={{ emptyText: 'No faculty records found.' }}
                />
              )
            },
            {
              key: '2',
              label: 'Attendance Log',
              children: (
                <Table 
                  columns={logColumns} 
                  dataSource={data} 
                  rowKey="mentorId" 
                  loading={loading}
                  pagination={{ pageSize: 15 }}
                  locale={{ emptyText: 'No faculty records found.' }}
                />
              )
            }
          ]} />
        </Card>
      </div>
    </div>
  );
}

export default AttendanceMonitorPage;
