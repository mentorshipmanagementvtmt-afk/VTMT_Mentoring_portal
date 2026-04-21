import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { Card, Typography, Button, Table, Form, Input, Select, DatePicker, Popconfirm,  Row, Col, Alert } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  'Conference', 'Journal Publication', 'Book Publication', 'Patent',
  'Research Proposal', 'Mini Project', 'Workshop', 'Industrial Visit',
  'Inplant Training', 'Culturals', 'Sports'
];

function ActivityLogSection({ studentId }) {
  const [activities, setActivities] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.get(`/activity-logs/${studentId}`, { params });
      setActivities(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load activities';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, semesterFilter, categoryFilter]);

  // Editing/Adding disabled for Admin

  const columns = [
    { title: 'Sem', dataIndex: 'semester', key: 'semester', width: 80 },
    { title: 'Date', dataIndex: 'date', key: 'date', render: text => text ? dayjs(text).format('DD/MM/YYYY') : '-', width: 100 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 150, render: text => <Text code>{text}</Text> },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' },
    { title: 'By', dataIndex: ['mentorId', 'name'], key: 'mentorId', render: text => text || '-' }
  ];

  return (
    <Card 
      variant="borderless" 
      title={<Title level={4} style={{ margin: 0 }}>Co / Extra Curricular Activities</Title>}
      style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Track conferences, projects, sports and other achievements by semester.</Text>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Filter by Semester</Text>
          <Input.Search
            placeholder="e.g., Sem 1"
            allowClear
            onSearch={setSemesterFilter}
            style={{ width: 180 }}
            enterButton={<ReloadOutlined />}
            loading={loading}
          />
        </div>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Filter by Category</Text>
          <Select
            allowClear
            placeholder="All Categories"
            style={{ width: 220 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            {CATEGORY_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
          </Select>
        </div>


      </div>

      <Title level={5} style={{ marginBottom: 16, color: '#0f172a' }}>Logged Activities</Title>
      <Table 
        columns={columns} 
        dataSource={activities} 
        rowKey="_id" 
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
        size="middle"
        locale={{ emptyText: 'No activities recorded yet.' }}
        style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}
      />
    </Card>
  );
}

export default ActivityLogSection;

