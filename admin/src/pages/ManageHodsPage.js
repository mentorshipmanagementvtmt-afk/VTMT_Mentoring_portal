import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { Link } from 'react-router-dom';
import { Card, Button, Typography, Popconfirm, Spin, Empty, Tag, Modal, Form, Select } from 'antd';
import { ArrowLeftOutlined, SyncOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

function ManageHodsPage() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isReassignModalVisible, setIsReassignModalVisible] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();

  const sortHods = (list) => {
    const arr = Array.isArray(list) ? [...list] : [];
    arr.sort((a, b) => {
      const depA = (a.department || '').localeCompare(b.department || '');
      if (depA !== 0) return depA;
      return (a.name || '').localeCompare(b.name || '');
    });
    return arr;
  };

  const loadHodsAndDepartments = async () => {
    try {
      setLoading(true);
      const [hodsRes, mentorsRes] = await Promise.all([
        api.get('/users/hods'),
        api.get('/users/mentors') // Assuming admin can read all mentors
      ]);
      setHods(sortHods(hodsRes.data || []));
      
      const depts = new Set();
      (mentorsRes.data || []).forEach(m => {
        if (m.department) depts.add(m.department);
      });
      (hodsRes.data || []).forEach(h => {
        if (h.department) depts.add(h.department);
      });
      setDepartments(Array.from(depts).sort());

    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHodsAndDepartments();
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

  const showReassignModal = () => {
    setIsReassignModalVisible(true);
    form.resetFields();
  };

  const handleReassignCancel = () => {
    setIsReassignModalVisible(false);
  };

  const handleReassignSubmit = async (values) => {
    if (values.oldDepartment === values.newDepartment) {
      toast.error("Source and destination departments cannot be the same.");
      return;
    }
    
    setReassignLoading(true);
    try {
      await api.put('/users/hods/reassign', {
        oldDepartment: values.oldDepartment,
        newDepartment: values.newDepartment
      });
      toast.success('Mentors and Students reassigned successfully');
      setIsReassignModalVisible(false);
      loadHodsAndDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reassign department');
    } finally {
      setReassignLoading(false);
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
              <Button type="default" icon={<SyncOutlined />} onClick={loadHodsAndDepartments} loading={loading} style={{ borderRadius: 8 }}>
                Refresh
              </Button>
              <Button type="default" icon={<SwapOutlined />} onClick={showReassignModal} style={{ borderRadius: 8, color: '#f59e0b', borderColor: '#f59e0b' }}>
                Reassign Faculty
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
        <Modal
          title="Reassign Faculty & Students"
          open={isReassignModalVisible}
          onCancel={handleReassignCancel}
          footer={null}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Use this tool to reassign all mentors and their students from an old/deleted department to an active department. 
              This effectively merges or moves the department's faculty.
            </Text>
          </div>
          <Form form={form} layout="vertical" onFinish={handleReassignSubmit}>
            <Form.Item 
              name="oldDepartment" 
              label="From Department (Old)" 
              rules={[{ required: true, message: 'Please select the source department' }]}
            >
              <Select placeholder="Select department to move FROM" showSearch>
                {departments.map(dept => (
                  <Option key={`old-${dept}`} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item 
              name="newDepartment" 
              label="To Department (New)" 
              rules={[{ required: true, message: 'Please select the destination department' }]}
            >
              <Select placeholder="Select active department to move TO" showSearch>
                {hods.map(hod => (
                  <Option key={`new-${hod.department}`} value={hod.department}>{hod.department} (HOD: {hod.name})</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item style={{ textAlign: 'right', marginTop: 32, marginBottom: 0 }}>
              <Button onClick={handleReassignCancel} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={reassignLoading} style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>
                Reassign Now
              </Button>
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </div>
  );
}

export default ManageHodsPage;
