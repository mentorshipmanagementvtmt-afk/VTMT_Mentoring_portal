import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
  BankOutlined,
  PlusOutlined,
  ReadOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
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
import api from '../api';

const { Text } = Typography;

export default function ManageDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadCourses = async () => {
    setLoading(true);
    try {
      const [departmentRes, hodRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users/hods').catch(() => ({ data: [] }))
      ]);
      setDepartments(departmentRes.data || []);
      setHods(hodRes.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const rankedDepartments = useMemo(
    () => [...departments].sort((a, b) => b.departmentScore - a.departmentScore),
    [departments]
  );

  const availableHods = useMemo(() => {
    const assignedIds = new Set(
      departments
        .map((department) => department.hod?._id)
        .filter(Boolean)
    );

    return (hods || []).filter((hod) => !assignedIds.has(hod._id));
  }, [departments, hods]);

  const leaderboardColumns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 80,
      render: (_, __, index) => <Tag color={index === 0 ? 'gold' : 'default'}>#{index + 1}</Tag>
    },
    {
      title: 'Course / Department',
      key: 'department',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 800, color: '#111c2d' }}>{record.department}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{record.code}</div>
        </div>
      )
    },
    {
      title: 'Student Marks',
      dataIndex: 'studentMarksScore',
      key: 'studentMarksScore',
      align: 'right',
      render: (value) => <Text strong>{value}</Text>
    },
    {
      title: 'Contribution',
      dataIndex: 'contributionScore',
      key: 'contributionScore',
      align: 'right',
      render: (value) => <Text strong>{value}</Text>
    },
    {
      title: 'Overall Score',
      dataIndex: 'departmentScore',
      key: 'departmentScore',
      align: 'right',
      render: (value) => <Text strong style={{ color: '#4b41e1' }}>{value}</Text>
    }
  ];

  const handleCreateCourse = async (values) => {
    setSaving(true);
    try {
      await api.post('/departments', values);
      toast.success(`Course ${values.name} created successfully.`);
      setModalOpen(false);
      form.resetFields();
      loadCourses();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Courses & Departments</div>
          <h1 className="admin-page-title">Manage Courses</h1>
          <p className="admin-page-description">
            Create departments, assign HOD ownership, and compare department performance using marks and contribution analytics.
          </p>
        </div>

        <div className="admin-actions">
          <Button onClick={loadCourses}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Create Course
          </Button>
        </div>
      </div>

      <div className="metric-grid" style={{ marginBottom: 18 }}>
        <Card className="surface-panel metric-card" variant="borderless">
          <div className="metric-label">Departments</div>
          <div className="metric-value">{departments.length}</div>
          <div className="metric-footnote positive">Live directory</div>
        </Card>
        <Card className="surface-panel metric-card" variant="borderless">
          <div className="metric-label">Assigned HODs</div>
          <div className="metric-value">{departments.filter((department) => department.hod?._id).length}</div>
          <div className="metric-footnote positive">Leadership mapped</div>
        </Card>
        <Card className="surface-panel metric-card" variant="borderless">
          <div className="metric-label">Top Department</div>
          <div className="metric-value">{rankedDepartments[0]?.department || 'N/A'}</div>
          <div className="metric-footnote warning">
            Score {rankedDepartments[0]?.departmentScore || 0}
          </div>
        </Card>
        <Card className="surface-panel metric-card" variant="borderless">
          <div className="metric-label">Open HOD Profiles</div>
          <div className="metric-value">{availableHods.length}</div>
          <div className="metric-footnote danger">Ready for assignment</div>
        </Card>
      </div>

      <div className="split-dashboard">
        <Card
          className="surface-panel table-panel"
          variant="borderless"
          title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Department Leaderboard</span>}
        >
          <Table
            columns={leaderboardColumns}
            dataSource={rankedDepartments}
            rowKey={(record) => record._id || record.department}
            loading={loading}
            pagination={false}
            scroll={{ x: 700 }}
            locale={{ emptyText: 'No department analytics available yet.' }}
          />
        </Card>

        <Card
          className="surface-panel"
          variant="borderless"
          title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>How Ranking Works</span>}
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <Text strong>Student Marks Score</Text>
              <div style={{ color: '#5f6675', marginTop: 4 }}>
                Based on latest assessment score and average exam performance inside the department.
              </div>
            </div>
            <div>
              <Text strong>Contribution Score</Text>
              <div style={{ color: '#5f6675', marginTop: 4 }}>
                Based on mentor and student activity logging such as certifications, events, and participation points.
              </div>
            </div>
            <div>
              <Text strong>Overall Score</Text>
              <div style={{ color: '#5f6675', marginTop: 4 }}>
                Weighted blend of marks analysis and department contribution to highlight the strongest performing course.
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card
        className="surface-panel"
        variant="borderless"
        title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Course Directory</span>}
        style={{ marginTop: 18 }}
      >
        {!loading && departments.length === 0 ? (
          <Empty description="No departments found yet." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {rankedDepartments.map((department) => (
              <Link
                key={department._id || department.department}
                to={`/departments/${encodeURIComponent(department.department)}`}
                className="activity-card-link"
              >
                <Card className="surface-panel activity-card" variant="borderless">
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      background: '#eef2ff',
                      color: '#4b41e1',
                      display: 'grid',
                      placeItems: 'center',
                      marginBottom: 16
                    }}
                  >
                    <BankOutlined />
                  </div>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#111c2d' }}>
                    {department.department}
                  </div>
                  <div className="chip-group" style={{ marginTop: 10, marginBottom: 12 }}>
                    <span className="reference-chip">{department.studentCount} students</span>
                    <span className="reference-chip">{department.mentorCount} mentors</span>
                    <span className="reference-chip">#{rankedDepartments.findIndex((item) => item.department === department.department) + 1}</span>
                  </div>
                  <p style={{ color: '#5f6675', marginTop: 0, marginBottom: 18 }}>
                    {department.hod?.name
                      ? `HOD: ${department.hod.name}`
                      : 'No HOD assigned yet. Open the dashboard to assign leadership.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="reference-chip">
                      <TrophyOutlined />
                      Score {department.departmentScore}
                    </span>
                    <span className="reference-chip">
                      <ReadOutlined />
                      Open Dashboard
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title="Create Course / Department"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCourse}>
          <Form.Item
            label="Department Name"
            name="name"
            rules={[{ required: true, message: 'Department name is required.' }]}
          >
            <Input placeholder="e.g. AI&DS" />
          </Form.Item>

          <Form.Item
            label="Department Code"
            name="code"
            rules={[{ required: true, message: 'Department code is required.' }]}
          >
            <Input placeholder="e.g. AIDS" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Short description for this department dashboard"
            />
          </Form.Item>

          <Form.Item label="Assign HOD" name="hodId">
            <Select
              allowClear
              placeholder="Optional"
              options={availableHods.map((hod) => ({
                label: `${hod.name} (${hod.mtsNumber})`,
                value: hod._id
              }))}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Create Course
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
