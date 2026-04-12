import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link , useNavigate } from 'react-router-dom';
import api from 'api';
import { Row, Col, Card, Typography, Spin, Alert, Button, Tag, Avatar, Table } from 'antd';
import { ArrowLeftOutlined, UserOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

function DepartmentDetailsPage() {
  const navigate = useNavigate();
  const { deptName } = useParams();
  const { user } = useAuth();
  const [hod, setHod] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hodRes, mentorRes] = await Promise.all([
        api.get(`/users/hod-by-department?department=${encodeURIComponent(deptName)}`).catch(() => ({ data: null })),
        api.get(`/users/mentors?department=${encodeURIComponent(deptName)}`).catch(() => ({ data: [] }))
      ]);
      setHod(hodRes.data);
      setMentors(mentorRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptName]);

  const handleDeleteMentor = async (id, name, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const confirmDelete = window.prompt(`Type the faculty's name to delete: "${name}"`);
    if (confirmDelete !== name) {
      toast.warning('Name did not match. Deletion cancelled.');
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/users/mentor/${id}`);
      setMentors(prev => prev.filter(m => m._id !== id));
      toast.success('Faculty deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete faculty.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (text, record, index) => <strong>#{index + 1}</strong>,
      width: 80,
    },
    {
      title: 'Mentor',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.profileImage?.url ? (
             <Avatar src={record.profileImage.url} size="large" />
          ) : (
             <Avatar icon={<UserOutlined />} size="large" />
          )}
          <div>
            <Text strong>{record.name}</Text>
            <br/>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.mtsNumber}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      align: 'right',
      render: val => <Text style={{ color: '#10b981', fontWeight: 600, fontSize: 16 }}>{val} pts</Text>
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}><ArrowLeftOutlined /> Back</Button>
        
        <Title level={2} style={{ margin: 0, color: '#0f172a' }}>{deptName} Department</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>Faculty & HOD Directory</Text>

        {/* HOD Section */}
        {user?.role === 'admin' && (
          <div style={{ marginBottom: 40 }}>
            <Title level={4} style={{ color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: 8, marginBottom: 16 }}>Head of Department</Title>
            {hod ? (
              <Link to={user?.role === 'admin' ? `/hod/${hod._id}` : '#'} style={{ textDecoration: 'none', color: 'inherit', pointerEvents: user?.role === 'admin' ? 'auto' : 'none' }}>
                <Card 
                  hoverable={user?.role === 'admin'}
                  style={{ borderRadius: 16, borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', background: '#ffffff', overflow: 'hidden' }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', padding: '24px 32px' }}>
                    {hod.profileImage?.url ? (
                      <img src={hod.profileImage.url} alt="HOD Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #f1f5f9' }} />
                    ) : (
                      <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#94a3b8' }}>
                        {hod.name.charAt(0)}
                      </div>
                    )}
                    <div style={{ marginLeft: 24 }}>
                      <Title level={3} style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{hod.name}</Title>
                      <Text type="secondary" style={{ display: 'block', fontSize: 16 }}>{hod.email}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="cyan" style={{ fontWeight: 600, padding: '2px 8px' }}>{hod.designation || 'HOD'}</Tag>
                        <Text type="secondary">{hod.mtsNumber}</Text>
                      </div>
                    </div>
                  </div>
                </Card>
             </Link>
            ) : (
              <Alert title="No HOD assigned to this department yet." type="info" showIcon />
            )}
          </div>
        )}

        {/* MENTOR LEADERBOARD */}
        <div style={{ marginBottom: 40 }}>
          <Title level={4} style={{ color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: 8, marginBottom: 16 }}>
             Mentor Contribution Leaderboard
          </Title>
          <Card variant="borderless" style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} styles={{ body: { padding: 0 } }}>
             <Table 
               columns={columns} 
               dataSource={leaderboard} 
               rowKey="_id" 
               pagination={false}
               size="middle"
               locale={{ emptyText: 'No student activities have been logged to rank mentors.' }}
             />
          </Card>
        </div>

        {/* MENTORS SECTION */}
        <div>
          <Title level={4} style={{ color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: 8, marginBottom: 16 }}>Faculty Members ({mentors.length})</Title>
          {mentors.length === 0 ? (
            <Alert title="No faculty members found in this department." type="info" showIcon />
          ) : (
            <Row gutter={[24, 24]}>
              {mentors.map(mentor => (
                 <Col xs={24} sm={12} lg={8} key={mentor._id}>
                   <Card 
                     hoverable
                     style={{ borderRadius: 12, height: '100%', borderColor: '#e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)' }}
                     styles={{ body: { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '20px' } }}
                   >
                     <Link to={`/mentor/${mentor._id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'block' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                         {mentor.profileImage?.url ? (
                            <img src={mentor.profileImage.url} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <Avatar size={64} icon={<UserOutlined />} style={{ background: '#e2e8f0', color: '#94a3b8' }} />
                         )}
                         <div>
                           <Title level={5} style={{ margin: 0, color: '#0f172a' }} ellipsis={{ tooltip: mentor.name }}>{mentor.name}</Title>
                           <Text type="secondary" style={{ fontSize: 13 }}>{mentor.mtsNumber}</Text>
                         </div>
                       </div>
                       
                       <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}><Text strong style={{ color: '#475569'}}>Designation:</Text> {mentor.designation}</Text>
                       <Text type="secondary" style={{ display: 'block', marginBottom: 16, wordBreak: 'break-all' }}><Text strong style={{ color: '#475569'}}>Email:</Text> {mentor.email}</Text>
                     </Link>

                     {/* Action Buttons */}
                     <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <Link to={`/mentor/${mentor._id}/mentees`}>
                         <Button block type="dashed" icon={<TeamOutlined />} style={{ color: '#6366f1', borderColor: '#c7d2fe', background: '#eef2ff', fontWeight: 600 }}>
                           View Mentees
                         </Button>
                       </Link>
                       <div style={{ display: 'flex', gap: 8 }}>
                         <Link to={`/mentor/${mentor._id}/edit`} style={{ flex: 1 }}>
                           <Button block type="default" icon={<EditOutlined />} style={{ borderColor: '#f59e0b', color: '#f59e0b', fontWeight: 500 }}>
                             Edit
                           </Button>
                         </Link>
                         <Button 
                           flex={1}
                           danger 
                           type="primary" 
                           onClick={(e) => handleDeleteMentor(mentor._id, mentor.name, e)}
                           loading={deletingId === mentor._id}
                           icon={<DeleteOutlined />}
                           style={{ fontWeight: 500 }}
                         >
                           Delete
                         </Button>
                       </div>
                     </div>
                   </Card>
                 </Col>
              ))}
            </Row>
          )}
        </div>

      </div>
    </div>
  );
}

export default DepartmentDetailsPage;
