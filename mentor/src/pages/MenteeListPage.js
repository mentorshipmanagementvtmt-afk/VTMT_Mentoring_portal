import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Card, Typography, Button, Popconfirm, Table, Tag, Space, Select } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, FolderOpenOutlined, DownloadOutlined } from '@ant-design/icons';
import { downloadStudentReport } from '../utils/reportGenerator';

const { Title, Text } = Typography;
const { Option } = Select;

function MenteeListPage() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  // Filters
  const [batchFilter, setBatchFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const fetchMentees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/my-mentees`);
      let data = response.data;
      if (batchFilter) data = data.filter(s => s.batch === batchFilter);
      if (sectionFilter) data = data.filter(s => s.section === sectionFilter);

      setMentees(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch mentees.');
      setLoading(false);
    }
  }, [batchFilter, sectionFilter]);

  useEffect(() => {
    fetchMentees();
  }, [fetchMentees]);

  const handleDelete = async (studentId) => {
    try {
      await api.delete(`/students/${studentId}`);
      toast.success('Mentee deleted successfully');
      fetchMentees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  const columns = [
    {
      title: 'Reg Number',
      dataIndex: 'registerNumber',
      key: 'registerNumber',
      sorter: (a, b) => a.registerNumber.localeCompare(b.registerNumber),
      render: text => <Text strong style={{ color: '#0ea5e9' }}>{text}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Year (Batch)',
      dataIndex: 'batch',
      key: 'batch',
      render: text => <Tag color="blue">{text || 'N/A'}</Tag>
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      render: text => <Tag color="purple">{text || 'N/A'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space>
          <Link to={`/mentee/${record._id}`}>
            <Button type="primary" size="small" icon={<FolderOpenOutlined />} style={{ borderRadius: 6, fontWeight: 500 }}>
              Profile & Activities
            </Button>
          </Link>
          <Button 
            type="primary" 
            size="small" 
            icon={<DownloadOutlined />} 
            onClick={() => downloadStudentReport(record._id, (isDl) => setDownloadingId(isDl ? record._id : null))}
            loading={downloadingId === record._id}
            style={{ borderRadius: 6, background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 500 }}
          >
            Download
          </Button>
          <Popconfirm
            title={`Delete ${record.name}?`}
            description="Are you sure you want to completely erase this mentee?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
             <Button danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 6 }} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const uniqueBatches = [...new Set(mentees.map(s => s.batch).filter(Boolean))];
  const uniqueSections = [...new Set(mentees.map(s => s.section).filter(Boolean))];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        
        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Manage Students (Mentees)</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
           View, filter, and edit the profiles of all students officially assigned to you.
        </Text>

        <Card variant="borderless" style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: 24 }}>
           <Space size="large" align="end" wrap>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Year (Batch)</Text>
                <Select
                  allowClear
                  placeholder="All Years"
                  style={{ width: 150 }}
                  onChange={val => setBatchFilter(val)}
                >
                  {uniqueBatches.sort().map(b => (
                     <Option key={b} value={b}>{b}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Section</Text>
                <Select
                  allowClear
                  placeholder="All Sections"
                  style={{ width: 120 }}
                  onChange={val => setSectionFilter(val)}
                >
                  {uniqueSections.sort().map(s => (
                     <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </div>
           </Space>
        </Card>

        <Card variant="borderless" styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <Table 
            columns={columns} 
            dataSource={mentees} 
            rowKey="_id" 
            loading={loading}
            pagination={{ pageSize: 15, showSizeChanger: false }}
            locale={{ emptyText: 'No students assigned to you match these filters.' }}
          />
        </Card>
      </div>
    </div>
  );
}

export default MenteeListPage;
