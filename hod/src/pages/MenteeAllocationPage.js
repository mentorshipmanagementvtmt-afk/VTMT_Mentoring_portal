import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from 'api';
import { Card, Typography, Table, Select, Button, Row, Col, Tag, Space, Spin, Avatar } from 'antd';
import { ArrowLeftOutlined, TeamOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

function MenteeAllocationPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Filters
  const [batchFilter, setBatchFilter] = useState(undefined);
  const [sectionFilter, setSectionFilter] = useState(undefined);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState(undefined);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, mentorsRes] = await Promise.all([
        api.get('/students'),
        api.get('/users/mentors')
      ]);
      setStudents(studentsRes.data || []);
      setMentors(mentorsRes.data || []);
    } catch (err) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  // Derive unique batches and sections from data
  const batches = [...new Set(students.map(s => s.batch).filter(Boolean))].sort();
  const sections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();

  // Filter students
  const filteredStudents = students.filter(s => {
    if (batchFilter && s.batch !== batchFilter) return false;
    if (sectionFilter && s.section !== sectionFilter) return false;
    if (showUnassignedOnly && s.currentMentor) return false;
    return true;
  });

  const handleAssign = async () => {
    if (selectedStudentIds.length === 0) {
      toast.warning('Please select at least one student.');
      return;
    }
    if (!selectedMentorId) {
      toast.warning('Please select a mentor to assign.');
      return;
    }

    setAssigning(true);
    try {
      const res = await api.put('/students/assign-mentor-bulk-list', {
        studentIds: selectedStudentIds,
        newMentorId: selectedMentorId
      });
      toast.success(res.data.message || 'Students assigned successfully!');
      setSelectedStudentIds([]);
      setSelectedMentorId(undefined);
      fetchData(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign mentor.');
    } finally {
      setAssigning(false);
    }
  };

  const columns = [
    {
      title: 'Student',
      key: 'name',
      render: (_, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.registerNumber}</Text>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'VM No.',
      dataIndex: 'vmNumber',
      key: 'vmNumber',
      width: 120,
    },
    {
      title: 'Batch',
      dataIndex: 'batch',
      key: 'batch',
      width: 100,
      render: text => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      width: 100,
      render: text => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Current Mentor',
      key: 'currentMentor',
      width: 200,
      render: (_, record) => record.currentMentor ? (
        <Space size={8}>
          <Avatar size="small" icon={<UserOutlined />} style={{ background: '#10b981' }} />
          <Text>{record.currentMentor.name}</Text>
        </Space>
      ) : (
        <Tag color="orange">Unassigned</Tag>
      ),
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedStudentIds,
    onChange: (selectedRowKeys) => {
      setSelectedStudentIds(selectedRowKeys);
    },
  };

  const selectedMentor = mentors.find(m => m._id === selectedMentorId);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>

        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: '0 0 4px 0', color: '#0f172a' }}>
            <TeamOutlined style={{ marginRight: 12, color: '#6366f1' }} />
            Mentee Allocation
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Select students by batch/year and assign them to a mentor. A mentor can handle students from multiple batches.
          </Text>
        </div>

        {/* Filter Bar */}
        <Card
          variant="borderless"
          style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={6}>
              <Text strong style={{ display: 'block', marginBottom: 6, color: '#475569' }}>Batch / Year</Text>
              <Select
                allowClear
                placeholder="All Batches"
                style={{ width: '100%' }}
                value={batchFilter}
                onChange={val => { setBatchFilter(val); setSelectedStudentIds([]); }}
              >
                {batches.map(b => <Option key={b} value={b}>{b}</Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Text strong style={{ display: 'block', marginBottom: 6, color: '#475569' }}>Section</Text>
              <Select
                allowClear
                placeholder="All Sections"
                style={{ width: '100%' }}
                value={sectionFilter}
                onChange={val => { setSectionFilter(val); setSelectedStudentIds([]); }}
              >
                {sections.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Text strong style={{ display: 'block', marginBottom: 6, color: '#475569' }}>Show</Text>
              <Select
                style={{ width: '100%' }}
                value={showUnassignedOnly ? 'unassigned' : 'all'}
                onChange={val => { setShowUnassignedOnly(val === 'unassigned'); setSelectedStudentIds([]); }}
              >
                <Option value="all">All Students</Option>
                <Option value="unassigned">Unassigned Only</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Text strong style={{ display: 'block', marginBottom: 6, color: '#475569' }}>Quick Stats</Text>
              <div style={{ display: 'flex', gap: 8 }}>
                <Tag color="blue">{filteredStudents.length} shown</Tag>
                <Tag color="green">{selectedStudentIds.length} selected</Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Assignment Action Bar */}
        <Card
          variant="borderless"
          style={{
            borderRadius: 16, marginBottom: 24,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
          styles={{ body: { padding: '20px 24px' } }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12}>
              <Text strong style={{ display: 'block', marginBottom: 6, color: '#e0e7ff' }}>Assign Selected Students To</Text>
              <Select
                showSearch
                allowClear
                placeholder="Select a Mentor"
                style={{ width: '100%' }}
                value={selectedMentorId}
                onChange={setSelectedMentorId}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {mentors.map(m => (
                  <Option key={m._id} value={m._id}>
                    {m.name} ({m.mtsNumber}) – {m.designation}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                loading={assigning}
                onClick={handleAssign}
                disabled={selectedStudentIds.length === 0 || !selectedMentorId}
                style={{
                  background: '#10b981', borderColor: '#10b981',
                  fontWeight: 700, borderRadius: 10, height: 44,
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                }}
              >
                Assign {selectedStudentIds.length} Student{selectedStudentIds.length !== 1 ? 's' : ''}
              </Button>
            </Col>
          </Row>
          {selectedMentor && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              {selectedMentor.profileImage?.url ? (
                <Avatar src={selectedMentor.profileImage.url} size={32} />
              ) : (
                <Avatar icon={<UserOutlined />} size={32} />
              )}
              <Text style={{ color: '#e0e7ff' }}>
                Assigning to <Text strong style={{ color: '#fff' }}>{selectedMentor.name}</Text> · {selectedMentor.designation}
              </Text>
            </div>
          )}
        </Card>

        {/* Student Table */}
        <Card
          variant="borderless"
          style={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredStudents}
            rowKey="_id"
            pagination={{ pageSize: 25, showSizeChanger: true, showTotal: (total) => `Total ${total} students` }}
            size="middle"
            scroll={{ x: 700 }}
            locale={{ emptyText: 'No students match the selected filters.' }}
          />
        </Card>

      </div>
    </div>
  );
}

export default MenteeAllocationPage;
