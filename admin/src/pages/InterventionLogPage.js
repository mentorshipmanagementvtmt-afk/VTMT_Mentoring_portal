import React, { useState, useEffect } from 'react';
import { useParams, Link , useNavigate } from 'react-router-dom';
import { Typography, Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InterventionForm from '../components/InterventionForm';
import api from '../api';

function InterventionLogPage() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const response = await api.get(`/interventions/${studentId}`);
        setInterventions(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterventions();
  }, [studentId]);

  if (loading) return <div style={{textAlign: 'center', padding: 50}}><Spin /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        <Typography.Title level={2}>Mentorship Intervention Log</Typography.Title>
        {interventions.length === 0 ? (
           <Empty description="No interventions recorded yet." />
        ) : (
           interventions.map(int => (
             <div key={int._id} style={{ marginBottom: 24, padding: 24, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <fieldset disabled={true} style={{ border: 'none', padding: 0, margin: 0 }}>
                   <InterventionForm studentId={studentId} interventionToEdit={int} onCancel={() => {}} onInterventionAdded={() => {}} />
                </fieldset>
             </div>
           ))
        )}
      </div>
    </div>
  );
}
export default InterventionLogPage;
