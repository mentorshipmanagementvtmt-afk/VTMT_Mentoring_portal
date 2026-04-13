import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Card, Row, Col, Typography, Button, Spin, Avatar, Tag, Descriptions } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ReadOutlined, WarningOutlined, CommentOutlined, FlagOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { downloadStudentReport } from '../utils/reportGenerator';

const { Title, Text } = Typography;

function MenteeDetailsPage() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchStudent = useCallback(async () => {
    try {
      const response = await api.get(`/students/${studentId}/details`);
      setStudent(response.data.profile);
    } catch (err) {
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetchStudent(); }, [fetchStudent]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}><Spin size="large" /></div>;
  }
  if (!student) return <Typography>No student found.</Typography>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        <Card variant="borderless" style={{ borderRadius: 16, marginBottom: 24 }}>
          <Row gutter={24} align="middle">
             <Col>
               {student.profileImage?.url ? (
                 <Avatar src={student.profileImage.url} size={100} />
               ) : (
                 <Avatar size={100} style={{ backgroundColor: '#e2e8f0', color: '#64748b', fontSize: 32 }}>{student.name.charAt(0)}</Avatar>
               )}
             </Col>
             <Col flex="auto">
                <Title level={2} style={{ margin: 0 }}>{student.name}</Title>
                <Text style={{ fontSize: 16, color: '#64748b' }}>Reg: {student.registerNumber} | VM: {student.vmNumber}</Text>
                <div style={{ marginTop: 8 }}>
                   <Tag color="blue">{student.department}</Tag>
                   <Tag color="cyan">Batch: {student.batch}</Tag>
                   <Tag color="purple">Sec: {student.section}</Tag>
                </div>
             </Col>
             <Col>
                {user?.role === 'mentor' && (
                  <Link to={`/mentee/${student._id}/edit`}>
                    <Button type="primary" icon={<EditOutlined />}>Edit Profile Information</Button>
                  </Link>
                )}
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={() => downloadStudentReport(studentId, setIsDownloading)} 
                  loading={isDownloading}
                  style={{ background: '#0ea5e9', borderColor: '#0ea5e9', marginLeft: 8 }}
                >
                  Download Report
                </Button>
             </Col>
          </Row>
        </Card>

        {/* Activity Buttons Matrix */}
        <Typography.Title level={4}>Student Activity Tracking</Typography.Title>
        <Row gutter={[16,16]} style={{ marginBottom: 32 }}>
           <Col xs={12} md={6}>
             <Link to={`/mentee/${student._id}/assessments`}>
               <Button block size="large" icon={<ReadOutlined />} style={{ height: 80, fontSize: 16 }}>Assessment Data</Button>
             </Link>
           </Col>
           <Col xs={12} md={6}>
             <Link to={`/mentee/${student._id}/interventions`}>
               <Button block size="large" icon={<CommentOutlined />} style={{ height: 80, fontSize: 16 }}>Intervention Log</Button>
             </Link>
           </Col>
           <Col xs={12} md={6}>
             <Link to={`/mentee/${student._id}/academic-problems`}>
               <Button block size="large" icon={<WarningOutlined />} style={{ height: 80, fontSize: 16 }}>Academic Problems</Button>
             </Link>
           </Col>
           <Col xs={12} md={6}>
             <Link to={`/mentee/${student._id}/activities`}>
               <Button block size="large" icon={<FlagOutlined />} style={{ height: 80, fontSize: 16 }}>Co/Extracurricular</Button>
             </Link>
           </Col>
        </Row>

        <Card title="Detailed Profile Information" variant="borderless" style={{ borderRadius: 16 }}>
           <Descriptions bordered column={{ xs: 1, sm: 2 }}>
             <Descriptions.Item label="Date of Birth">{student.personal?.dateOfBirth ? new Date(student.personal.dateOfBirth).toLocaleDateString() : 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="Contact Number">{student.contact?.contactNumber || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="Email">{student.contact?.email || 'N/A'}</Descriptions.Item>
             <Descriptions.Item label="Father's Name">{student.parents?.fatherName || 'N/A'}</Descriptions.Item>
           </Descriptions>
        </Card>

      </div>
    </div>
  );
}
export default MenteeDetailsPage;
