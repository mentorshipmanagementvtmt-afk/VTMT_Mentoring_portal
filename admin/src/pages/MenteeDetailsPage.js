import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Avatar, Button, Card, Descriptions, Empty, Tag } from 'antd';
import {
  EditOutlined,
  ReadOutlined,
  WarningOutlined,
  CommentOutlined,
  FlagOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { downloadStudentReport } from '../utils/reportGenerator';

const activityItems = [
  { key: 'assessments', label: 'Assessment Data', icon: <ReadOutlined />, description: 'View continuous evaluation marks, assignments, and internal performance.' },
  { key: 'exam-performance', label: 'Exam Performance', icon: <ReadOutlined />, description: 'Track end-semester examination outcomes and academic progress.' },
  { key: 'interventions', label: 'Intervention Log', icon: <CommentOutlined />, description: 'Review mentoring interventions, actions taken, and measurable impact.' },
  { key: 'academic-problems', label: 'Academic Problems', icon: <WarningOutlined />, description: 'Flag and monitor attendance issues, failing grades, or other risk markers.' },
  { key: 'activities', label: 'Co/Extracurricular', icon: <FlagOutlined />, description: 'Capture clubs, sports, hackathons, and other extra activities.' }
];

export default function MenteeDetailsPage() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/students/${studentId}/details`);
        setStudent(response.data.profile);
      } catch (error) {
        toast.error('Failed to fetch student details.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return <Card className="surface-panel">Loading student profile...</Card>;
  }

  if (!student) {
    return <Card className="surface-panel"><Empty description="No student found." /></Card>;
  }

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Student Profile</div>
          <h1 className="admin-page-title">{student.name}</h1>
          <p className="admin-page-description">
            Central hub for personal details, academic tracking, interventions, and activity records.
          </p>
        </div>

        <div className="admin-actions">
          <Button
            icon={<DownloadOutlined />}
            onClick={() => downloadStudentReport(studentId, setIsDownloading)}
            loading={isDownloading}
          >
            Download Report
          </Button>
          {user?.role === 'mentor' && (
            <Link to={`/mentee/${student._id}/edit`}>
              <Button type="primary" icon={<EditOutlined />}>Edit Profile</Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="surface-panel" variant="borderless" style={{ marginBottom: 18 }}>
        <div className="profile-hero">
          <Avatar src={student.profileImage?.url || undefined} size={112}>
            {student.name?.slice(0, 2).toUpperCase()}
          </Avatar>

          <div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 32, color: '#111c2d' }}>{student.name}</div>
            <div style={{ color: '#5f6675', marginTop: 6 }}>Reg: {student.registerNumber} • VM: {student.vmNumber || 'N/A'}</div>
            <div className="chip-group" style={{ marginTop: 14 }}>
              <span className="reference-chip">{student.department}</span>
              <span className="reference-chip">Batch {student.batch}</span>
              <span className="reference-chip">Section {student.section}</span>
            </div>
          </div>

          <Tag color="success" style={{ borderRadius: 999, paddingInline: 12 }}>Active</Tag>
        </div>
      </Card>

      <div className="profile-details-grid">
        <Card className="surface-panel" variant="borderless" title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Personal Details</span>}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Date of Birth">{student.personal?.dateOfBirth ? new Date(student.personal.dateOfBirth).toLocaleDateString() : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Contact Number">{student.contact?.contactNumber || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">{student.contact?.email || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Father's Name">{student.parents?.fatherName || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#111c2d', marginBottom: 14 }}>
            Activity Hub
          </div>
          <div className="activity-grid">
            {activityItems.map(item => (
              <Link key={item.key} to={`/mentee/${student._id}/${item.key}`} className="activity-card-link">
                <Card className="surface-panel activity-card" variant="borderless">
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      display: 'grid',
                      placeItems: 'center',
                      background: item.key === 'academic-problems' ? '#fee2e2' : '#eef2ff',
                      color: item.key === 'academic-problems' ? '#b91c1c' : '#4b41e1',
                      marginBottom: 16
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: item.key === 'academic-problems' ? '#b91c1c' : '#111c2d' }}>
                    {item.label}
                  </div>
                  <div style={{ color: '#5f6675', marginTop: 8 }}>{item.description}</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
