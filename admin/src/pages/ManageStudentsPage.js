import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api';
import { Button, Card, Input, Select, Table, Tag, Typography } from 'antd';
import { EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [query, setQuery] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (departmentFilter) params.append('department', departmentFilter);
      if (batchFilter) params.append('batch', batchFilter);
      if (sectionFilter) params.append('section', sectionFilter);

      const response = await api.get(`/students?${params.toString()}`);
      setStudents(response.data || []);
    } catch (err) {
      toast.error('Failed to fetch students data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentFilter, batchFilter, sectionFilter]);

  const filteredStudents = useMemo(() => {
    if (!query) return students;
    const search = query.toLowerCase();
    return students.filter(student =>
      student.name?.toLowerCase().includes(search) ||
      student.registerNumber?.toLowerCase().includes(search) ||
      student.department?.toLowerCase().includes(search) ||
      student.currentMentor?.name?.toLowerCase().includes(search)
    );
  }, [students, query]);

  const uniqueDepartments = [...new Set(students.map(student => student.department).filter(Boolean))];
  const uniqueBatches = [...new Set(students.map(student => student.batch).filter(Boolean))];
  const uniqueSections = [...new Set(students.map(student => student.section).filter(Boolean))];

  const columns = [
    {
      title: 'Reg Number',
      dataIndex: 'registerNumber',
      key: 'registerNumber',
      render: value => <span style={{ fontWeight: 700, color: '#24324a' }}>{value}</span>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value) => (
        <div className="avatar-cell">
          <div className="avatar-initial">{value?.slice(0, 2).toUpperCase()}</div>
          <span style={{ fontWeight: 700 }}>{value}</span>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Batch & Sec',
      key: 'batchSection',
      render: (_, record) => (
        <div className="chip-group">
          <Tag color="default">{record.batch || 'N/A'}</Tag>
          <Tag color="default">{record.section || 'N/A'}</Tag>
        </div>
      )
    },
    {
      title: 'Mentor',
      key: 'mentor',
      render: (_, record) =>
        record.currentMentor ? (
          <div>
            <div style={{ fontWeight: 700 }}>{record.currentMentor.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.currentMentor.mtsNumber}</div>
          </div>
        ) : (
          <Text type="secondary">Unassigned</Text>
        )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Link to={`/mentee/${record._id}`}>
          <Button type="link" icon={<EyeOutlined />} style={{ fontWeight: 700 }}>
            View Profile
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Student Directory</div>
          <h1 className="admin-page-title">Manage Students</h1>
          <p className="admin-page-description">
            Search, filter, and view all student profiles across the university.
          </p>
        </div>
      </div>

      <Card className="surface-panel" variant="borderless" style={{ marginBottom: 18 }}>
        <div className="page-filters">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search students, mentors, or registration numbers..."
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <Select
            allowClear
            placeholder="All Departments"
            value={departmentFilter || undefined}
            onChange={value => setDepartmentFilter(value || '')}
            options={uniqueDepartments.sort().map(department => ({ label: department, value: department }))}
          />
          <Select
            allowClear
            placeholder="All Years"
            value={batchFilter || undefined}
            onChange={value => setBatchFilter(value || '')}
            options={uniqueBatches.sort().map(batch => ({ label: batch, value: batch }))}
          />
          <Select
            allowClear
            placeholder="All Sections"
            value={sectionFilter || undefined}
            onChange={value => setSectionFilter(value || '')}
            options={uniqueSections.sort().map(section => ({ label: section, value: section }))}
          />
          <Button type="primary" icon={<ReloadOutlined />} onClick={fetchStudents}>
            Refresh View
          </Button>
        </div>
      </Card>

      <Card className="surface-panel table-panel" variant="borderless">
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>
    </div>
  );
}
