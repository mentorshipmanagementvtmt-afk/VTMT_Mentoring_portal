import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUpload from './ProfileImageUpload';
import { Modal, Form, Input, Button,  Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

function MyProfileModal({ visible, onClose }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (removeImage && !file) {
        await api.delete('/users/profile/image');
        toast.success('Profile image removed!');
        const updatedUser = { ...user, profileImage: { url: '', publicId: '' } };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else if (file) {
        const formData = new FormData();
        formData.append('profileImage', file);
        const res = await api.put('/users/profile/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Profile image updated!');
        const updatedUser = { ...user, profileImage: res.data.profileImage };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        toast.info('No changes made');
        onClose();
        return;
      }
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="My Profile"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleUpdate}>Save Changes</Button>
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
        {user?.profileImage?.url ? (
          <img src={user.profileImage.url} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
        ) : (
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserOutlined style={{ fontSize: 40, color: '#94a3b8' }} />}
          </div>
        )}
        <Text strong style={{ fontSize: 18 }}>{user?.name}</Text>
        <Text type="secondary">{user?.email}</Text>
        <Text type="secondary" keyboard>{user?.role?.toUpperCase()}</Text>
      </div>

      <Form layout="vertical">
        <Form.Item label="Update Profile Picture">
          <ProfileImageUpload onChange={(f) => { setFile(f); setRemoveImage(false); }} />
        </Form.Item>
        {user?.profileImage?.url && (
          <div style={{ marginTop: 8 }}>
            <label>
              <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
              &nbsp;Remove existing image
            </label>
          </div>
        )}
      </Form>
    </Modal>
  );
}

export default MyProfileModal;
