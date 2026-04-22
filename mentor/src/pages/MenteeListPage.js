import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api';
import { Card, Typography, Button, Popconfirm, Table, Tag, Space, Select, Modal, Input } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, FolderOpenOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import { downloadStudentReport } from '../utils/reportGenerator';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function MenteeListPage() {
  const [mentees, setMentees] = useState([]);
  const [lowAttendanceByStudent, setLowAttendanceByStudent] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionDraft, setActionDraft] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [savingAction, setSavingAction] = useState(false);

  // Filters
  const [batchFilter, setBatchFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const fetchMentees = useCallback(async () => {
    setLoading(true);
    try {
      const [menteesResponse, attendanceResponse] = await Promise.all([
        api.get('/students/my-mentees'),
        api.get('/attendance/overview')
      ]);

      let data = menteesResponse.data;
      if (batchFilter) data = data.filter(s => s.batch === batchFilter);
      if (sectionFilter) data = data.filter(s => s.section === sectionFilter);

      setMentees(data);
      setLowAttendanceByStudent(
        (attendanceResponse.data?.lowAttendanceStudents || []).reduce((acc, student) => {
          acc[student.studentId] = student;
          return acc;
        }, {})
      );
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch mentees.');
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

  const openActionModal = (student) => {
    const attendanceRecord = lowAttendanceByStudent[student._id];
    setSelectedStudent(student);
    setActionDraft(attendanceRecord?.attendanceAction?.note || '');
    setActionModalOpen(true);
  };

  const handleSaveAttendanceAction = async () => {
    if (!selectedStudent) return;

    const note = actionDraft.trim();
    if (!note) {
      toast.error('Please enter the action taken for this student.');
      return;
    }

    setSavingAction(true);
    try {
      await api.put(`/attendance/student/${selectedStudent._id}/action`, { note });
      toast.success('Attendance action saved successfully.');
      setActionModalOpen(false);
      setSelectedStudent(null);
      setActionDraft('');
      fetchMentees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance action.');
    } finally {
      setSavingAction(false);
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
      title: 'Attendance',
      key: 'attendance',
      render: (_, record) => {
        const attendanceRecord = lowAttendanceByStudent[record._id];

        if (!attendanceRecord) {
          return <Tag color="success">Healthy</Tag>;
        }

        return (
          <Space direction="vertical" size={4}>
            <Tag color="error" icon={<WarningOutlined />}>
              {attendanceRecord.cumulativeAttendance}% - Low
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {attendanceRecord.attendanceAction?.note ? 'Action recorded' : 'Action pending'}
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Mentor Action',
      key: 'attendanceAction',
      render: (_, record) => {
        const attendanceRecord = lowAttendanceByStudent[record._id];

        if (!attendanceRecord) {
          return <Text type="secondary">Not required</Text>;
        }

        if (!attendanceRecord.attendanceAction?.note) {
          return <Text type="warning">No action added yet.</Text>;
        }

        return (
          <Space direction="vertical" size={2}>
            <Text style={{ maxWidth: 260 }}>{attendanceRecord.attendanceAction.note}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Updated by {attendanceRecord.attendanceAction.updatedBy?.name || 'Mentor'}
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space>
          {lowAttendanceByStudent[record._id] && (
            <Button
              size="small"
              icon={<WarningOutlined />}
              onClick={() => openActionModal(record)}
              style={{ borderRadius: 6, borderColor: '#d97706', color: '#d97706', fontWeight: 600 }}
            >
              Take Action
            </Button>
          )}
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
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>
        
        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Manage Students (Mentees)</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
           View, filter, and edit the profiles of all students officially assigned to you.
        </Text>

        <Card variant="borderless" style={{ borderRadius: 12, border: '1px solid #fde68a', background: '#fffbeb', marginBottom: 24 }}>
          <Space direction="vertical" size={4}>
            <Text strong style={{ color: '#92400e' }}>
              Students below 75% attendance: {Object.keys(lowAttendanceByStudent).length}
            </Text>
            <Text type="secondary">
              Use the Take Action button to record the support or follow-up you gave. Admin and HOD can view the saved note.
            </Text>
          </Space>
        </Card>

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

        <Modal
          title={selectedStudent ? `Attendance Action - ${selectedStudent.name}` : 'Attendance Action'}
          open={actionModalOpen}
          onOk={handleSaveAttendanceAction}
          okText="Save Action"
          okButtonProps={{ loading: savingAction }}
          onCancel={() => {
            setActionModalOpen(false);
            setSelectedStudent(null);
            setActionDraft('');
          }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {selectedStudent && lowAttendanceByStudent[selectedStudent._id] && (
              <Tag color="error" style={{ width: 'fit-content' }}>
                Current attendance: {lowAttendanceByStudent[selectedStudent._id].cumulativeAttendance}%
              </Tag>
            )}
            <Text type="secondary">
              Describe the action you took for this low-attendance student. This note will be visible to HOD and admin.
            </Text>
            <TextArea
              rows={5}
              value={actionDraft}
              onChange={(event) => setActionDraft(event.target.value)}
              placeholder="Example: Called the student and parent, reviewed attendance shortage, and scheduled a weekly follow-up."
              maxLength={1000}
            />
          </Space>
        </Modal>
      </div>
    </div>
  );
}

export default MenteeListPage;
