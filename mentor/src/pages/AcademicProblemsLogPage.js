import React from 'react';
import { useParams, Link , useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AcademicLogSection from '../components/AcademicLogSection';

function AcademicProblemsLogPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        <Typography.Title level={2}>Academic/Personal Problems</Typography.Title>
        <AcademicLogSection studentId={studentId} />
      </div>
    </div>
  );
}
export default AcademicProblemsLogPage;
