import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Card, Table, Tag, Typography } from 'antd';
import { toast } from 'react-toastify';
import api from '../api';

const { Title, Text } = Typography;

function ExamPerformancePage() {
  const { studentId } = useParams();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/exam-records/student/${studentId}`);
        setPayload(response.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load exam performance.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const columns = [
    { title: 'Exam Type', dataIndex: 'examType', key: 'examType' },
    { title: 'Marks', key: 'marks', render: (_, record) => `${record.marksObtained}/${record.maxMarks}` },
    { title: 'Score %', dataIndex: 'markPercent', key: 'markPercent', render: (value) => <Tag color="blue">{value}%</Tag> },
    { title: 'Attendance %', dataIndex: 'attendancePercent', key: 'attendancePercent', render: (value) => <Tag color={value < 75 ? 'error' : 'success'}>{value}%</Tag> },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', render: (value) => value || '-' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link to={`/mentee/${studentId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Profile
        </Link>

        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Exam Performance</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
          View-only performance dashboard. Mark entry and modification are restricted to mentors.
        </Text>

        <Card style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Text strong>Mentor Details: </Text>
          <Text>
            {payload?.mentor
              ? `${payload.mentor.name} | ${payload.mentor.email} | ${payload.mentor.mtsNumber}`
              : 'Unassigned'}
          </Text>
          <div style={{ marginTop: 12 }}>
            <Tag color="blue">Completed Exams: {payload?.summary?.completedExams ?? 0}/{payload?.summary?.totalExams ?? 0}</Tag>
            <Tag color="purple">Cumulative: {payload?.summary?.cumulativePercentage ?? 0}%</Tag>
            <Tag color="gold">Avg Attendance: {payload?.summary?.averageAttendancePercent ?? 0}%</Tag>
            <Tag color={Number(payload?.summary?.progressDeltaPercent || 0) >= 0 ? 'green' : 'red'}>
              CAT-2 vs CAT-1: {payload?.summary?.progressDeltaPercent ?? 0}%
            </Tag>
          </div>
        </Card>

        <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Table
            rowKey="examType"
            loading={loading}
            columns={columns}
            dataSource={payload?.records || []}
            pagination={false}
            locale={{ emptyText: 'No exam records found for this student.' }}
          />
        </Card>
      </div>
    </div>
  );
}

export default ExamPerformancePage;
