import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'api';
import { Link } from 'react-router-dom';
import { Card, Button, Typography,  Popconfirm, Spin, Empty, Tag } from 'antd';
import { ArrowLeftOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function ManageHodsPage() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const sortHods = (list) => {
    const arr = Array.isArray(list) ? [...list] : [];
    arr.sort((a, b) => {
      const depA = (a.department || '').localeCompare(b.department || '');
      if (depA !== 0) return depA;
      return (a.name || '').localeCompare(b.name || '');
    });
    return arr;
  };

  const loadHods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/hods');
      setHods(sortHods(res.data || []));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load HODs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id, e) => {
    // Prevent the click event from navigating implicitly via Link container
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.preventDefault) e.preventDefault();
    
    setDeletingId(id);
    try {
      await api.delete(`/users/hods/${id}`);
      setHods((prev) => prev.filter((h) => h._id !== id));
      toast.success('HOD deleted successfully');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete HOD');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && hods.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>

        <Card 
          variant="borderless" 
          style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          styles={{ body: { padding: '32px' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Manage HOD Profiles</Title>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="default" icon={<SyncOutlined />} onClick={loadHods} loading={loading} style={{ borderRadius: 8 }}>
                Refresh
              </Button>
              <Link to="/hods/create">
                <Button type="primary" icon={<PlusOutlined />} style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, fontWeight: 600 }}>
                  Create New HOD Profile
                </Button>
              </Link>
            </div>
          </div>

          {hods.length === 0 && !loading ? (
            <Empty description="No HODs found yet." style={{ padding: '60px 0' }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {hods.map((hod) => (
                <Link to={`/hod/${hod._id}`} key={hod._id} style={{ textDecoration: 'none' }}>
                  <Card 
                    hoverable 
                    style={{ height: '100%', borderRadius: 12, borderColor: '#e2e8f0', display: 'flex', flexDirection: 'column' }}
                    styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 } }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={4} style={{ margin: 0, color: '#0f172a' }} ellipsis={{ tooltip: hod.name }}>{hod.name}</Title>
                        <Tag color="cyan" style={{ margin: 0, fontWeight: 600, borderRadius: 12 }}>{hod.department}</Tag>
                      </div>
                      <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 14 }}>{hod.email}</Text>
                      <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 13 }}>{hod.mtsNumber} • {hod.designation}</Text>
                    </div>

                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Popconfirm
                        title="Delete HOD"
                        description="Are you sure you want to delete this profile?"
                        onConfirm={(e) => handleDelete(hod._id, e)}
                        // Needed to prevent the Popconfirm itself from navigating via Link
                        onPopupClick={(e) => e.stopPropagation()}
                        okButtonProps={{ danger: true }}
                      >
                        <Button 
                          danger 
                          type="primary" 
                          size="middle" 
                          loading={deletingId === hod._id} 
                          style={{ borderRadius: 6, fontWeight: 600 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ManageHodsPage;
