import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Empty, Spin, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../api';

const categoryTone = {
  'Slow learner': { color: '#ba1a1a', background: '#ffe7e5' },
  'Fast learner': { color: '#3323cc', background: '#ece9ff' }
};

export default function InterventionLogPage() {
  const { studentId } = useParams();
  const [interventions, setInterventions] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interventionRes, studentRes] = await Promise.all([
          api.get(`/interventions/${studentId}`),
          api.get(`/students/${studentId}/details`)
        ]);

        setInterventions(interventionRes.data || []);
        setStudent(studentRes.data?.profile || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Student Journey</div>
          <h1 className="admin-page-title">Mentorship Intervention Log</h1>
          <p className="admin-page-description">
            Chronological record of academic and behavioral interventions, actions taken, and measurable impact.
          </p>
        </div>

        <div className="admin-actions">
          <Link to={`/mentee/${studentId}`}>
            <Button>Back to Profile</Button>
          </Link>
          <Button type="primary" icon={<PlusOutlined />}>
            Log New Intervention
          </Button>
        </div>
      </div>

      {student && (
        <Card className="surface-panel" variant="borderless" style={{ marginBottom: 18 }}>
          <div className="avatar-cell">
            <Avatar src={student.profileImage?.url || undefined} size={64}>
              {student.name?.slice(0, 2).toUpperCase()}
            </Avatar>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24 }}>{student.name}</div>
              <div style={{ color: '#5f6675', marginTop: 4 }}>
                Cohort {student.batch} • {student.department} • Mentee ID: {student.registerNumber}
              </div>
            </div>
            <div className="chip-group" style={{ marginLeft: 'auto' }}>
              <span className="reference-chip">Active Status</span>
            </div>
          </div>
        </Card>
      )}

      {interventions.length === 0 ? (
        <Card className="surface-panel"><Empty description="No interventions recorded yet." /></Card>
      ) : (
        <div className="timeline-list">
          {interventions.map(entry => {
            const tone = categoryTone[entry.category] || { color: '#111c2d', background: '#f3f4f6' };
            return (
              <div key={entry._id} className="timeline-item">
                <div className="timeline-date">{entry.monthYear}</div>
                <Card className="surface-panel timeline-card" variant="borderless">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                    <Tag color="default" style={{ borderRadius: 999, background: tone.background, color: tone.color, borderColor: 'transparent', fontWeight: 700 }}>
                      {entry.category}
                    </Tag>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, marginBottom: 10 }}>
                        Action Taken
                      </div>
                      <div style={{ color: '#20242f', lineHeight: 1.7 }}>{entry.actionTaken}</div>
                    </div>
                    <div style={{ background: '#f8f6fb', borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700, marginBottom: 10 }}>
                        Measured Impact
                      </div>
                      <div style={{ color: '#20242f', lineHeight: 1.7 }}>{entry.impact}</div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
