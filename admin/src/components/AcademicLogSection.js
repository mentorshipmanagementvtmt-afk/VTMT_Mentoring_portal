import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'api';
import { Card, Typography, Table, Input } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function AcademicLogSection({ studentId }) {
  const [logs, setLogs] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      const res = await api.get(`/academic-logs/${studentId}`, { params });
      setLogs(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load academic logs';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, semesterFilter]);

  // Editing/Adding disabled for Admin

  const columns = [
    { title: 'Sem', dataIndex: 'semester', key: 'semester', width: 80 },
    { title: 'Date', dataIndex: 'date', key: 'date', render: text => text ? dayjs(text).format('DD/MM/YYYY') : '-', width: 100 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 80, render: text => <Text strong color={text === 'AP' ? 'blue' : 'purple'}>{text}</Text> },
    { title: 'Problem', dataIndex: 'problemIdentification', key: 'problemIdentification' },
    { title: 'Remedial Action', dataIndex: 'remedialAction', key: 'remedialAction' },
    { title: 'Progress', dataIndex: 'improvementProgress', key: 'improvementProgress' },
    { title: 'By', dataIndex: ['mentorId', 'name'], key: 'mentorId', render: text => text || '-' }
  ];

  return (
    <Card 
      variant="borderless" 
      title={<Title level={4} style={{ margin: 0 }}>Academic / Personal Problems Log</Title>}
      style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Record AP/PP issues, actions taken and progress for each semester.</Text>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Filter by Semester</Text>
          <Input.Search
            placeholder="e.g., Sem 1, 1, I"
            allowClear
            onSearch={setSemesterFilter}
            style={{ width: 200 }}
            enterButton={<ReloadOutlined />}
            loading={loading}
          />
        </div>


      </div>

      <Title level={5} style={{ marginBottom: 16, color: '#0f172a' }}>Logged Entries</Title>
      <Table 
        columns={columns} 
        dataSource={logs} 
        rowKey="_id" 
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
        size="middle"
        locale={{ emptyText: 'No entries yet for this student.' }}
        style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}
      />
    </Card>
  );
}

export default AcademicLogSection;

