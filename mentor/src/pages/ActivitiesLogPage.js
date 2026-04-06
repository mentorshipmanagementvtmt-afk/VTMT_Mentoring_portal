import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import ActivityLogSection from '../components/ActivityLogSection';

function ActivitiesLogPage() {
  const { studentId } = useParams();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to={`/mentee/${studentId}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}><ArrowLeftOutlined /> Back to Profile</Link>
        <Typography.Title level={2}>Co-Curricular & Extracurricular Data</Typography.Title>
        <ActivityLogSection studentId={studentId} />
      </div>
    </div>
  );
}
export default ActivitiesLogPage;
