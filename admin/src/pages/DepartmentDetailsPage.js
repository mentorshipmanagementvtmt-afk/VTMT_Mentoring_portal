import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import {
  Avatar,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography
} from 'antd';
import {
  ArrowLeftOutlined,
  MailOutlined,
  TrophyOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export default function DepartmentDetailsPage() {
  const { deptName } = useParams();
  const navigate = useNavigate();
  const decodedDepartment = decodeURIComponent(deptName || '');
  const [data, setData] = useState(null);
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadDepartment = useCallback(async () => {
    setLoading(true);
    try {
      const [departmentRes, hodRes] = await Promise.all([
        api.get(`/departments/name/${encodeURIComponent(decodedDepartment)}`),
        api.get('/users/hods').catch(() => ({ data: [] }))
      ]);

      setData(departmentRes.data);
      setHods(hodRes.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load department details.');
    } finally {
      setLoading(false);
    }
  }, [decodedDepartment]);

  useEffect(() => {
    loadDepartment();
  }, [loadDepartment]);

  const department = data?.department;
  const summary = data?.summary || {};
  const mentorActivity = data?.mentorActivity || [];
  const studentPerformance = data?.studentPerformance || [];
  const mentors = data?.mentors || [];

  const assignableHods = useMemo(() => hods || [], [hods]);

  const mentorColumns = [
    {
      title: 'Mentor',
      key: 'mentor',
      render: (_, record) => (
        <div className="avatar-cell">
          <Avatar
            src={record.profileImage?.url || undefined}
            icon={!record.profileImage?.url && <UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{record.mentorName}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.mtsNumber}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Mentees',
      dataIndex: 'menteeCount',
      key: 'menteeCount',
      align: 'center'
    },
    {
      title: 'Activity Points',
      dataIndex: 'activityPoints',
      key: 'activityPoints',
      align: 'center',
      render: (value) => <Text strong>{value}</Text>
    },
    {
      title: 'Student Performance',
      dataIndex: 'averageStudentPerformance',
      key: 'averageStudentPerformance',
      align: 'center',
      render: (value) => <Tag color="processing">{value}</Tag>
    },
    {
      title: 'Low Attendance',
      dataIndex: 'lowAttendanceCount',
      key: 'lowAttendanceCount',
      align: 'center',
      render: (value) => <Tag color={value ? 'warning' : 'success'}>{value}</Tag>
    }
  ];

  const studentColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.studentName}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{record.registerNumber}</div>
        </div>
      )
    },
    {
      title: 'Mentor',
      dataIndex: 'mentorName',
      key: 'mentorName'
    },
    {
      title: 'Assessment',
      dataIndex: 'latestAssessmentScore',
      key: 'latestAssessmentScore',
      align: 'center'
    },
    {
      title: 'Exam Avg %',
      dataIndex: 'examAveragePercent',
      key: 'examAveragePercent',
      align: 'center',
      render: (value) => `${value}%`
    },
    {
      title: 'Attendance',
      dataIndex: 'cumulativeAttendance',
      key: 'cumulativeAttendance',
      align: 'center',
      render: (value) => <Tag color={value < 75 ? 'error' : 'success'}>{value}%</Tag>
    },
    {
      title: 'Performance',
      dataIndex: 'performanceIndex',
      key: 'performanceIndex',
      align: 'center',
      render: (value) => <Text strong>{value}</Text>
    }
  ];

  const handleSaveDepartment = async (values) => {
    setSaving(true);
    try {
      const response = await api.put(`/departments/name/${encodeURIComponent(decodedDepartment)}`, values);
      setData(response.data);
      setModalOpen(false);
      toast.success('Department details updated successfully.');
      if (values.name && values.name !== decodedDepartment) {
        navigate(`/departments/${encodeURIComponent(values.name)}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update department.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up">
      <Link to="/departments" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>
        <ArrowLeftOutlined /> Back to Courses
      </Link>

      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Department Dashboard</div>
          <h1 className="admin-page-title">{department?.name || decodedDepartment}</h1>
          <p className="admin-page-description">
            Department-level dashboard for student performance, mentor activity, and academic leadership.
          </p>
        </div>

        <div className="admin-actions">
          <Button onClick={loadDepartment}>Refresh</Button>
          <Button
            type="primary"
            onClick={() => {
              form.setFieldsValue({
                name: department?.name || decodedDepartment,
                code: department?.code || '',
                description: department?.description || '',
                hodId: data?.hod?._id || undefined
              });
              setModalOpen(true);
            }}
          >
            Manage Course
          </Button>
        </div>
      </div>

      <div className="split-dashboard" style={{ marginBottom: 18 }}>
        <Card className="surface-panel" loading={loading} variant="borderless">
          {data?.hod ? (
            <div style={{ textAlign: 'center' }}>
              <div className="reference-chip" style={{ marginBottom: 16 }}>Assigned HOD</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  src={data.hod.profileImage?.url || undefined}
                  icon={!data.hod.profileImage?.url && <UserOutlined />}
                  size={112}
                />
              </div>
              <div style={{ marginTop: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 28 }}>{data.hod.name}</div>
              <Text type="secondary">{data.hod.designation || 'Head of Department'}</Text>
              <div className="chip-group" style={{ justifyContent: 'center', marginTop: 12 }}>
                <span className="reference-chip">{department?.code}</span>
                <span className="reference-chip">{data.hod.mtsNumber}</span>
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 22, textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <MailOutlined />
                  <span>{data.hod.email}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <TrophyOutlined />
                  <span>Department score: {summary.departmentScore || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <Empty description="No HOD assigned to this department yet." />
          )}
        </Card>

        <div className="dashboard-side-stack">
          <div className="metric-grid">
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Students</div>
              <div className="metric-value">{summary.studentCount || 0}</div>
              <div className="metric-footnote positive">Department cohort</div>
            </Card>
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Mentors</div>
              <div className="metric-value">{summary.mentorCount || 0}</div>
              <div className="metric-footnote positive">Faculty mapped</div>
            </Card>
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Activity Points</div>
              <div className="metric-value">{summary.totalActivityPoints || 0}</div>
              <div className="metric-footnote warning">Contribution signal</div>
            </Card>
          </div>

          <div className="metric-grid">
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Assessment Avg</div>
              <div className="metric-value">{summary.averageAssessmentScore || 0}</div>
              <div className="metric-footnote positive">Out of 50</div>
            </Card>
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Exam Avg</div>
              <div className="metric-value">{summary.averageExamPercentage || 0}%</div>
              <div className="metric-footnote positive">Marks trend</div>
            </Card>
            <Card className="surface-panel metric-card" variant="borderless">
              <div className="metric-label">Low Attendance</div>
              <div className="metric-value">{summary.lowAttendanceStudents || 0}</div>
              <div className="metric-footnote danger">Needs mentoring</div>
            </Card>
          </div>
        </div>
      </div>

      <Card
        className="surface-panel table-panel"
        variant="borderless"
        title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Mentor Activity Dashboard</span>}
      >
        <Table
          columns={mentorColumns}
          dataSource={mentorActivity}
          rowKey="mentorId"
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No mentor activity found for this department.' }}
        />
      </Card>

      <Card
        className="surface-panel table-panel"
        variant="borderless"
        title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Student Performance Dashboard</span>}
        style={{ marginTop: 18 }}
      >
        <Table
          columns={studentColumns}
          dataSource={studentPerformance}
          rowKey="studentId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No student performance data found for this department.' }}
        />
      </Card>

      <Card
        className="surface-panel"
        variant="borderless"
        title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Faculty Directory</span>}
        style={{ marginTop: 18 }}
      >
        {mentors.length === 0 ? (
          <Empty description="No faculty members found in this department." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {mentors.map((mentor) => {
              const mentorStats = mentorActivity.find((item) => String(item.mentorId) === String(mentor._id));
              return (
                <Card key={mentor._id} className="surface-panel" variant="borderless">
                  <div className="avatar-cell" style={{ alignItems: 'flex-start' }}>
                    <Avatar
                      src={mentor.profileImage?.url || undefined}
                      icon={!mentor.profileImage?.url && <UserOutlined />}
                      size={54}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontFamily: 'Manrope, sans-serif', fontSize: 18 }}>{mentor.name}</div>
                      <div style={{ color: '#4b41e1', fontWeight: 600 }}>{mentor.designation || 'Faculty'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{mentor.email}</div>
                    </div>
                  </div>
                  <div className="chip-group" style={{ marginTop: 14 }}>
                    <span className="reference-chip">{mentor.mtsNumber}</span>
                    <span className="reference-chip">{mentorStats?.menteeCount || 0} mentees</span>
                    <span className="reference-chip">{mentorStats?.activityPoints || 0} pts</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        title="Manage Course / Department"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveDepartment}>
          <Form.Item
            label="Department Name"
            name="name"
            rules={[{ required: true, message: 'Department name is required.' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Department Code"
            name="code"
            rules={[{ required: true, message: 'Department code is required.' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Assigned HOD" name="hodId">
            <Select
              allowClear
              placeholder="Select HOD"
              options={assignableHods.map((hod) => ({
                label: `${hod.name} (${hod.mtsNumber})`,
                value: hod._id
              }))}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
