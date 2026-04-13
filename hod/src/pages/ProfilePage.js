import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import { Card, Form, Input, Button, Upload, Typography, Spin, Avatar, Divider, Space } from 'antd';
import { UserOutlined, CloudUploadOutlined, LockOutlined, MailOutlined, IdcardOutlined, BankOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data);
      form.setFieldsValue({
        name: res.data.name,
        email: res.data.email,
        mtsNumber: res.data.mtsNumber,
        designation: res.data.designation,
      });
      if (res.data.profileImage?.url) {
        setPreviewImage(res.data.profileImage.url);
      }
    } catch (error) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    setRemoveImage(false);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = e => setPreviewImage(e.target.result);
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else if (!removeImage && user?.profileImage?.url) {
      setPreviewImage(user.profileImage.url);
    } else {
      setPreviewImage('');
    }
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setRemoveImage(true);
    setPreviewImage('');
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (values.name) formData.append('name', values.name);
      if (values.email) formData.append('email', values.email);
      if (values.mtsNumber) formData.append('mtsNumber', values.mtsNumber);
      if (values.designation) formData.append('designation', values.designation);
      if (values.password) formData.append('password', values.password);
      
      if (fileList.length > 0) {
        formData.append('profileImage', fileList[0].originFileObj);
      } else if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Profile updated successfully');
      setUser(res.data);
      form.setFieldsValue({ password: '' });
      setFileList([]);
      setRemoveImage(false);
      localStorage.setItem('user', JSON.stringify(res.data));
      setTimeout(() => {
          window.location.reload();
      }, 500);
      if (res.data.profileImage?.url) {
          setPreviewImage(res.data.profileImage.url);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>My Profile</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
           Manage your personal details and account security.
        </Text>

        <Card variant="borderless" styles={{ body: { padding: '40px' } }} style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <Avatar 
                src={previewImage || undefined} 
                icon={!previewImage && <UserOutlined />} 
                size={120} 
                style={{ marginBottom: 16, border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
            />
            
            <Space>
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleFileChange}
                maxCount={1}
                showUploadList={false}
              >
                <Button icon={<CloudUploadOutlined />}>Change Photo</Button>
              </Upload>
              {(previewImage || user?.profileImage?.url) && (
                <Button danger onClick={handleRemoveImage}>Remove</Button>
              )}
            </Space>
            
            <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>{user.name}</Title>
                <Text type="secondary">{user.department} • {user.role.toUpperCase()}</Text>
            </div>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            style={{ maxWidth: 600, margin: '0 auto' }}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} size="large" />
            </Form.Item>

            <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item
                name="mtsNumber"
                label="MTS Number"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Please enter your MTS number' }]}
                >
                <Input prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />} size="large" />
                </Form.Item>

                <Form.Item
                name="designation"
                label="Designation"
                style={{ flex: 1 }}
                >
                <Input prefix={<BankOutlined style={{ color: '#94a3b8' }} />} size="large" />
                </Form.Item>
            </div>

            <Divider orientation="left">Security</Divider>

            <Form.Item
              name="password"
              label="New Password"
              help="Leave blank if you don't want to change your password"
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder="Enter new password" />
            </Form.Item>

            <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="large" block loading={submitting} style={{ borderRadius: 8, height: 48, fontSize: 16 }}>
                Save Profile Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
