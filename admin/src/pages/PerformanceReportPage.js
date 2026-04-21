import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { Avatar, Button, Card, Empty, Progress, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function PerformanceReportPage() {
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

  const topThree = useMemo(() => reportData.slice(0, 3), [reportData]);
  const roster = useMemo(() => reportData.slice(3), [reportData]);
  const highestScore = reportData[0]?.totalScore || 1;

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Cohort Analytics</div>
          <h1 className="admin-page-title">Performance Report</h1>
          <p className="admin-page-description">Cohort ranking and score distribution based on the latest assessment records.</p>
        </div>

        <div className="admin-actions">
          <Button>This Quarter</Button>
          <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
        </div>
      </div>

      {reportData.length === 0 && !loading ? (
        <Card className="surface-panel"><Empty description="No records found." /></Card>
      ) : (
        <>
          <div className="leader-grid">
            {topThree.map((student, index) => (
              <Card
                key={student._id || student.registerNumber}
                className={`surface-panel leader-card ${index === 0 ? 'primary' : ''}`}
                variant="borderless"
              >
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>Rank #{index + 1}</div>
                <Avatar size={index === 0 ? 92 : 78} style={{ marginTop: 18, background: '#edf2ff', color: '#24324a' }}>
                  {student.name?.slice(0, 2).toUpperCase()}
                </Avatar>
                <div style={{ marginTop: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: index === 0 ? 30 : 24, color: '#111c2d' }}>
                  {student.name}
                </div>
                <div style={{ color: '#6b7280', marginTop: 4 }}>#{student.registerNumber}</div>
                <div style={{ marginTop: 16 }}>
                  <span className="reference-chip">{student.totalScore} pts</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="leaderboard-layout">
            <Card
              className="surface-panel"
              variant="borderless"
              title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Full Roster Ranking</span>}
            >
              {loading && roster.length > 0 ? (
                <p style={{ margin: 0, color: '#5f6675' }}>Loading records...</p>
              ) : roster.length === 0 ? (
                <Empty description="No records found." />
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {roster.map((student, index) => (
                    <div
                      key={student._id || `${student.registerNumber}-${index}`}
                      style={{
                        border: '1px solid #ece8ee',
                        borderRadius: 14,
                        padding: '12px 14px'
                      }}
                    >
                      <div className="avatar-cell" style={{ width: '100%' }}>
                        <div style={{ width: 32, fontWeight: 800, color: '#6b7280' }}>{index + 4}</div>
                        <Avatar style={{ background: '#edf2ff', color: '#24324a' }}>
                          {student.name?.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{student.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>#{student.registerNumber} - {student.academicYear}</div>
                        </div>
                        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22 }}>
                          {student.totalScore}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="dashboard-side-stack">
              <Card
                className="surface-panel"
                variant="borderless"
                title={<span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>Cohort Score Distribution</span>}
              >
                {reportData.slice(0, 4).map((student) => (
                  <div key={student.registerNumber} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text>{student.name}</Text>
                      <Text strong>{Math.round((student.totalScore / highestScore) * 100)}%</Text>
                    </div>
                    <Progress
                      percent={Math.round((student.totalScore / highestScore) * 100)}
                      showInfo={false}
                      strokeColor="#4b41e1"
                      railColor="#ece8ee"
                    />
                  </div>
                ))}
              </Card>

              <Card className="surface-panel" variant="borderless" style={{ background: '#1e293b', color: '#fff' }}>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 8 }}>
                  Key Insight
                </div>
                <p style={{ margin: 0, color: '#d8e3fb', lineHeight: 1.7 }}>
                  The current cohort leader is ahead by {Math.max((reportData[0]?.totalScore || 0) - (reportData[1]?.totalScore || 0), 0)} points,
                  which suggests a meaningful performance gap in the latest evaluation cycle.
                </p>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
