import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUpload from '../components/ProfileImageUpload';
import api from 'api';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Row, Col, Typography,  Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

function CreateHodPage() {
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('email', values.email.trim());
      formData.append('password', values.password);
      formData.append('mtsNumber', values.mtsNumber.trim());
      formData.append('department', values.department.trim());
      formData.append('designation', values.designation.trim());

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await api.post('/users/hods', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('HOD Profile created successfully');
      navigate('/hods');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create HOD');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link to="/hods" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Manage HODs
        </Link>

        <Card 
          title={<span style={{ fontWeight: 700, fontSize: 20 }}>Create New HOD Profile</span>} 
          variant="outlined" 
          style={{ borderRadius: 16, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
          styles={{ header: { borderBottom: '1px solid #e2e8f0', padding: '24px' }, body: { padding: '32px 24px' } }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Name</span>} name="name" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Email</span>} name="email" rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Invalid' }]}>
                  <Input type="email" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Temporary Password</span>} name="password" rules={[{ required: true, message: 'Required' }]}>
                  <Input.Password style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>MTS Number</span>} name="mtsNumber" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Department</span>} name="department" rules={[{ required: true, message: 'Required' }]}>
                  <Select placeholder="Select Department" style={{ width: '100%' }}>
                    <Select.Option value="AI&DS">AI&DS</Select.Option>
                    <Select.Option value="IT">IT</Select.Option>
                    <Select.Option value="CSE">CSE</Select.Option>
                    <Select.Option value="MECH">MECH</Select.Option>
                    <Select.Option value="CSBS">CSBS</Select.Option>
                    <Select.Option value="Cyber Security">Cyber Security</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Designation</span>} name="designation" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="e.g., Professor, HOD" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Profile Image</span>}>
                  <ProfileImageUpload onChange={setProfileImage} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
              <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 600, borderRadius: 8, width: '100%' }}>
                {saving ? 'Creating Profile...' : 'Confirm & Create HOD'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default CreateHodPage;
