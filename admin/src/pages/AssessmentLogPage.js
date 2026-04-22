import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AssessmentForm from '../components/AssessmentForm';
import api from '../api';

function AssessmentLogPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get(`/assessments/${studentId}`);
        setAssessments(response.data.map(item => item.savedData));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [studentId]);

  if (loading) return <div style={{textAlign: 'center', padding: 50}}><Spin /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        <Typography.Title level={2}>Assessment Data</Typography.Title>
        {assessments.length === 0 ? (
           <Empty description="No assessments recorded yet." />
        ) : (
           assessments.map(ass => (
             <div key={ass._id} style={{ marginBottom: 24, padding: 24, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <Typography.Title level={4}>Academic Year: {ass.academicYear}</Typography.Title>
                <fieldset disabled={true} style={{ border: 'none', padding: 0, margin: 0 }}>
                   <AssessmentForm studentId={studentId} assessmentToEdit={ass} onCancel={() => {}} onAssessmentAdded={() => {}} />
                </fieldset>
             </div>
           ))
        )}
      </div>
    </div>
  );
}
export default AssessmentLogPage;
