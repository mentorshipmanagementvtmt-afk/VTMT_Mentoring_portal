const fs = require('fs');
const path = require('path');

const profilePage = `import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Card, Row, Col, Typography, Button, Spin, Avatar, Space, Tag, Descriptions, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ReadOutlined, WarningOutlined, CommentOutlined, FlagOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

function MenteeDetailsPage() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudent = async () => {
    try {
      const response = await api.get(\`/students/\${studentId}/details\`);
      setStudent(response.data.profile);
    } catch (err) {
      toast.error('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudent(); }, [studentId]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}><Spin size="large" /></div>;
  }
  if (!student) return <Typography>No student found.</Typography>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link to={user?.role === 'mentor' ? \`/mentor/\${user._id}\` : '/students'} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Students
        </Link>
        <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
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
                  <Link to={\`/mentee/\${student._id}/edit\`}>
                    <Button type="primary" icon={<EditOutlined />}>Edit Profile Information</Button>
                  </Link>
                )}
             </Col>
          </Row>
        </Card>

        {/* Activity Buttons Matrix */}
        <Typography.Title level={4}>Student Activity Tracking</Typography.Title>
        <Row gutter={[16,16]} style={{ marginBottom: 32 }}>
           <Col xs={12} md={6}>
             <Link to={\`/mentee/\${student._id}/assessments\`}>
               <Button block size="large" icon={<ReadOutlined />} style={{ height: 80, fontSize: 16 }}>Assessment Data</Button>
             </Link>
           </Col>
           <Col xs={12} md={6}>
             <Link to={\`/mentee/\${student._id}/interventions\`}>
               <Button block size="large" icon={<CommentOutlined />} style={{ height: 80, fontSize: 16 }}>Intervention Log</Button>
             </Link>
           </Col>
           <Col xs={12} md={6}>
             <Link to={\`/mentee/\${student._id}/academic-problems\`}>
               <Button block size="large" icon={<WarningOutlined />} style={{ height: 80, fontSize: 16 }}>Academic Problems</Button>
             </Link>
           </Col>
           <Col xs={12} md={6}>
             <Link to={\`/mentee/\${student._id}/activities\`}>
               <Button block size="large" icon={<FlagOutlined />} style={{ height: 80, fontSize: 16 }}>Co/Extracurricular</Button>
             </Link>
           </Col>
        </Row>

        <Card title="Detailed Profile Information" bordered={false} style={{ borderRadius: 16 }}>
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
`;

const assessmentPage = `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AssessmentForm from '../components/AssessmentForm';

function AssessmentLogPage() {
  const { studentId } = useParams();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to={"/mentee/" + studentId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}><ArrowLeftOutlined /> Back to Profile</Link>
        <Typography.Title level={2}>Assessment Data</Typography.Title>
        <AssessmentForm studentId={studentId} />
      </div>
    </div>
  );
}
export default AssessmentLogPage;
`;

const interventionPage = `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InterventionForm from '../components/InterventionForm';

function InterventionLogPage() {
  const { studentId } = useParams();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to={"/mentee/" + studentId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}><ArrowLeftOutlined /> Back to Profile</Link>
        <Typography.Title level={2}>Mentorship Intervention Log</Typography.Title>
        <InterventionForm studentId={studentId} />
      </div>
    </div>
  );
}
export default InterventionLogPage;
`;

const problemsPage = `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AcademicLogSection from '../components/AcademicLogSection';

function AcademicProblemsLogPage() {
  const { studentId } = useParams();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to={"/mentee/" + studentId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}><ArrowLeftOutlined /> Back to Profile</Link>
        <Typography.Title level={2}>Academic/Personal Problems</Typography.Title>
        <AcademicLogSection studentId={studentId} />
      </div>
    </div>
  );
}
export default AcademicProblemsLogPage;
`;

const activitiesPage = `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ActivityLogSection from '../components/ActivityLogSection';

function ActivitiesLogPage() {
  const { studentId } = useParams();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to={"/mentee/" + studentId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}><ArrowLeftOutlined /> Back to Profile</Link>
        <Typography.Title level={2}>Co-Curricular & Extracurricular Data</Typography.Title>
        <ActivityLogSection studentId={studentId} />
      </div>
    </div>
  );
}
export default ActivitiesLogPage;
`;

const portals = ['admin', 'hod', 'mentor'];

portals.forEach(portal => {
  const basePath = path.join(__dirname, '..', portal, 'src', 'pages');
  fs.writeFileSync(path.join(basePath, 'MenteeDetailsPage.js'), profilePage);
  fs.writeFileSync(path.join(basePath, 'AssessmentLogPage.js'), assessmentPage);
  fs.writeFileSync(path.join(basePath, 'InterventionLogPage.js'), interventionPage);
  fs.writeFileSync(path.join(basePath, 'AcademicProblemsLogPage.js'), problemsPage);
  fs.writeFileSync(path.join(basePath, 'ActivitiesLogPage.js'), activitiesPage);
  console.log(`Successfully generated files for ${portal}`);
});
