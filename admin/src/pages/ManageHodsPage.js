import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { Link } from 'react-router-dom';
import { Avatar, Button, Card, Empty, Form, Modal, Popconfirm, Select, Tag, Typography } from 'antd';
import { SyncOutlined, PlusOutlined, SwapOutlined, DeleteOutlined, MailOutlined, IdcardOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ManageHodsPage() {
  const [hods, setHods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isReassignModalVisible, setIsReassignModalVisible] = useState(false);
  const [reassignLoading, setReassignLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();

  const loadHodsAndDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const [hodsRes, mentorsRes] = await Promise.all([
        api.get('/users/hods'),
        api.get('/users/mentors')
      ]);

      const sortedHods = Array.isArray(hodsRes.data) ? [...hodsRes.data] : [];
      sortedHods.sort((a, b) => {
        const depA = (a.department || '').localeCompare(b.department || '');
        if (depA !== 0) return depA;
        return (a.name || '').localeCompare(b.name || '');
      });
      setHods(sortedHods);

      const uniqueDepartments = new Set();
      (mentorsRes.data || []).forEach(mentor => mentor.department && uniqueDepartments.add(mentor.department));
      (hodsRes.data || []).forEach(hod => hod.department && uniqueDepartments.add(hod.department));
      setDepartments(Array.from(uniqueDepartments).sort());
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load HOD data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHodsAndDepartments();
  }, [loadHodsAndDepartments]);

  const handleDelete = async id => {
    setDeletingId(id);
    try {
      await api.delete(`/users/hods/${id}`);
      setHods(prev => prev.filter(hod => hod._id !== id));
      toast.success('HOD deleted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete HOD');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReassignSubmit = async values => {
    if (values.oldDepartment === values.newDepartment) {
      toast.error('Source and destination departments cannot be the same.');
      return;
    }

    setReassignLoading(true);
    try {
      await api.put('/users/hods/reassign', values);
      toast.success('Mentors and students reassigned successfully.');
      setIsReassignModalVisible(false);
      loadHodsAndDepartments();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reassign department.');
    } finally {
      setReassignLoading(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Department Leadership</div>
          <h1 className="admin-page-title">Manage HOD Profiles</h1>
          <p className="admin-page-description">
            View and manage head of department assignments, department ownership, and leadership records.
          </p>
        </div>

        <div className="admin-actions">
          <Button icon={<SyncOutlined />} onClick={loadHodsAndDepartments} loading={loading}>
            Refresh
          </Button>
          <Button icon={<SwapOutlined />} onClick={() => setIsReassignModalVisible(true)}>
            Reassign Faculty
          </Button>
          <Link to="/hods/create">
            <Button type="primary" icon={<PlusOutlined />}>
              Create New HOD
            </Button>
          </Link>
        </div>
      </div>

      {hods.length === 0 && !loading ? (
        <Card className="surface-panel">
          <Empty description="No HOD profiles found yet." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {hods.map(hod => (
            <Card key={hod._id} className="surface-panel" variant="borderless">
              <div style={{ display: 'flex', gap: 14 }}>
                {hod.profileImage?.url ? (
                  <Avatar src={hod.profileImage.url} size={54} />
                ) : (
                  <Avatar size={54} icon={<UserOutlined />} className="admin-user-avatar" />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: '#111c2d' }}>
                    {hod.name}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Tag color="default">{hod.department}</Tag>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
                <div style={{ display: 'flex', gap: 10, color: '#5b6474' }}>
                  <MailOutlined />
                  <span>{hod.email}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, color: '#5b6474' }}>
                  <IdcardOutlined />
                  <span>{hod.mtsNumber}</span>
                </div>
                <Text type="secondary">{hod.designation || 'Head of Department'}</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid #ece8ee' }}>
                <Link to={`/hod/${hod._id}`}>
                  <Button type="link" style={{ paddingInline: 0, fontWeight: 700 }}>
                    View Profile
                  </Button>
                </Link>
                <Popconfirm
                  title="Delete HOD"
                  description="Are you sure you want to delete this profile?"
                  onConfirm={() => handleDelete(hod._id)}
                  okButtonProps={{ danger: true }}
                >
                  <Button danger type="text" icon={<DeleteOutlined />} loading={deletingId === hod._id}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="Reassign Faculty and Students"
        open={isReassignModalVisible}
        onCancel={() => setIsReassignModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleReassignSubmit}>
          <Form.Item
            name="oldDepartment"
            label="From Department"
            rules={[{ required: true, message: 'Please select the source department.' }]}
          >
            <Select
              placeholder="Select the department to move from"
              options={departments.map(department => ({ label: department, value: department }))}
            />
          </Form.Item>

          <Form.Item
            name="newDepartment"
            label="To Department"
            rules={[{ required: true, message: 'Please select the target department.' }]}
          >
            <Select
              placeholder="Select the department to move to"
              options={hods.map(hod => ({
                label: `${hod.department} (HOD: ${hod.name})`,
                value: hod.department
              }))}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => setIsReassignModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={reassignLoading}>
              Reassign Now
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
