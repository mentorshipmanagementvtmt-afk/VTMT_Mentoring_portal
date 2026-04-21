import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Input, InputNumber, Space, Table, Tag, Typography } from 'antd';
import { toast } from 'react-toastify';
import api from '../api';

const { Title, Text } = Typography;

function ExamMarksPage() {
  const { studentId } = useParams();
  const [examTypes, setExamTypes] = useState([]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [savingMap, setSavingMap] = useState({});
  const [deletingMap, setDeletingMap] = useState({});
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    try {
      setLoading(true);
      const [typesRes, detailsRes] = await Promise.all([
        api.get('/exam-records/exam-types'),
        api.get(`/exam-records/student/${studentId}`)
      ]);
      const types = typesRes.data || [];
      const byType = (detailsRes.data.records || []).reduce((acc, record) => {
        acc[record.examType] = record;
        return acc;
      }, {});

      setExamTypes(types);
      setSummary(detailsRes.data.summary);
      setMentor(detailsRes.data.mentor);
      setRows(
        types.map((examType) => {
          const found = byType[examType];
          return {
            examType,
            _id: found?._id,
            marksObtained: found?.marksObtained ?? 0,
            maxMarks: found?.maxMarks ?? 100,
            attendancePercent: found?.attendancePercent ?? 0,
            remarks: found?.remarks ?? '',
            markPercent: found?.markPercent ?? 0
          };
        })
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load exam records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, [studentId]);

  const updateRow = (examType, patch) => {
    setRows((prev) => prev.map((row) => (row.examType === examType ? { ...row, ...patch } : row)));
  };

  const saveRow = async (row) => {
    setSavingMap((prev) => ({ ...prev, [row.examType]: true }));
    try {
      await api.post('/exam-records', {
        studentId,
        examType: row.examType,
        marksObtained: row.marksObtained,
        maxMarks: row.maxMarks,
        attendancePercent: row.attendancePercent,
        remarks: row.remarks
      });
      toast.success(`${row.examType} marks saved.`);
      await hydrate();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to save ${row.examType}.`);
    } finally {
      setSavingMap((prev) => ({ ...prev, [row.examType]: false }));
    }
  };

  const deleteRow = async (row) => {
    if (!row._id) return;
    setDeletingMap((prev) => ({ ...prev, [row.examType]: true }));
    try {
      await api.delete(`/exam-records/${row._id}`);
      toast.success(`${row.examType} marks removed.`);
      await hydrate();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to delete ${row.examType}.`);
    } finally {
      setDeletingMap((prev) => ({ ...prev, [row.examType]: false }));
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Exam Type',
        dataIndex: 'examType',
        key: 'examType',
        render: (value) => <Text strong>{value}</Text>
      },
      {
        title: 'Marks',
        key: 'marks',
        render: (_, row) => (
          <InputNumber
            min={0}
            max={row.maxMarks || 100}
            value={row.marksObtained}
            onChange={(value) => updateRow(row.examType, { marksObtained: value ?? 0 })}
          />
        )
      },
      {
        title: 'Max Marks',
        key: 'maxMarks',
        render: (_, row) => (
          <InputNumber
            min={1}
            value={row.maxMarks}
            onChange={(value) => updateRow(row.examType, { maxMarks: value ?? 100 })}
          />
        )
      },
      {
        title: 'Attendance %',
        key: 'attendancePercent',
        render: (_, row) => (
          <InputNumber
            min={0}
            max={100}
            value={row.attendancePercent}
            onChange={(value) => updateRow(row.examType, { attendancePercent: value ?? 0 })}
          />
        )
      },
      {
        title: 'Remarks',
        key: 'remarks',
        render: (_, row) => (
          <Input
            value={row.remarks}
            onChange={(event) => updateRow(row.examType, { remarks: event.target.value })}
            placeholder="Optional notes"
          />
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, row) => (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => saveRow(row)}
              loading={!!savingMap[row.examType]}
            >
              Save
            </Button>
            {row._id && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteRow(row)}
                loading={!!deletingMap[row.examType]}
              >
                Delete
              </Button>
            )}
          </Space>
        )
      }
    ],
    [deletingMap, savingMap, rows]
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link to={`/mentee/${studentId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Profile
        </Link>

        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Exam Marks Entry</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
          Enter CAT and semester exam marks with attendance for each exam type.
        </Text>

        <Card style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Space size="large" wrap>
            <Tag color="blue">Completed Exams: {summary?.completedExams ?? 0}/{examTypes.length}</Tag>
            <Tag color="purple">Cumulative: {summary?.cumulativePercentage ?? 0}%</Tag>
            <Tag color="gold">Avg Attendance: {summary?.averageAttendancePercent ?? 0}%</Tag>
            <Tag color={Number(summary?.progressDeltaPercent || 0) >= 0 ? 'green' : 'red'}>
              CAT-2 vs CAT-1: {summary?.progressDeltaPercent ?? 0}%
            </Tag>
          </Space>
          {mentor && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">
                Mentor: <Text strong>{mentor.name}</Text> | {mentor.email} | {mentor.mtsNumber}
              </Text>
            </div>
          )}
        </Card>

        <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Table
            rowKey="examType"
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={false}
            locale={{ emptyText: 'No exam types available.' }}
          />
        </Card>
      </div>
    </div>
  );
}

export default ExamMarksPage;
