import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'api';
import { Card, Empty, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function PerformanceReportPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get('/assessments/mentor/performance');
        setReportData(response.data || []);
      } catch (error) {
        toast.error('Failed to fetch performance report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Mentor Reports</div>
          <h1 className="admin-page-title">Mentees Performance Report</h1>
          <p className="admin-page-description">
            Students are ranked by total score from their latest assessment records.
          </p>
        </div>
      </div>

      <Card className="surface-panel" variant="borderless">
        {loading ? (
          <Text type="secondary">Loading records...</Text>
        ) : reportData.length === 0 ? (
          <Empty description="No records found." />
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {reportData.map((student, index) => (
              <div
                key={student._id || `${student.registerNumber}-${index}`}
                style={{
                  border: '1px solid #ece8ee',
                  borderRadius: 14,
                  padding: '14px 16px',
                  background:
                    index === 0 ? '#eff6ff' : index === 1 ? '#f8fafc' : index === 2 ? '#fdf8f6' : '#ffffff'
                }}
              >
                <div className="avatar-cell" style={{ width: '100%' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: index < 3 ? '#4b41e1' : '#e2e8f0',
                      color: index < 3 ? '#fff' : '#64748b',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 18,
                      fontWeight: 700
                    }}
                  >
                    {index < 3 ? <TrophyOutlined /> : `#${index + 1}`}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Title level={5} style={{ margin: 0 }}>{student.name}</Title>
                    <Text type="secondary">
                      Reg No: {student.registerNumber} - Latest: {student.academicYear}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#4b41e1', lineHeight: 1 }}>
                      {student.totalScore}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }}>
                      Total Score
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default PerformanceReportPage;
