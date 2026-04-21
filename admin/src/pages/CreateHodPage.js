import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUpload from '../components/ProfileImageUpload';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';

export default function CreateHodPage() {
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async values => {
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
      toast.success('HOD profile created successfully.');
      navigate('/hods');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create HOD.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Personnel Setup</div>
          <h1 className="admin-page-title">Create New HOD Profile</h1>
          <p className="admin-page-description">
            Register a new head of department and grant administrative access to department-specific oversight modules.
          </p>
        </div>
      </div>

      <Card className="surface-panel" variant="borderless">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={7}>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#111c2d', marginBottom: 14 }}>
                Profile Photo
              </div>
              <ProfileImageUpload onChange={setProfileImage} />
              <p style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
                Recommended size: 400x400. JPG or PNG under 2MB.
              </p>
            </Col>

            <Col xs={24} md={17}>
              <Row gutter={[18, 0]}>
                <Col xs={24}>
                  <Form.Item label="Full Legal Name" name="name" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. Dr. Sarah Jenkins" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Institutional Email"
                    name="email"
                    rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Invalid email' }]}
                  >
                    <Input placeholder="s.jenkins@institution.edu" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Temporary Password" name="password" rules={[{ required: true, message: 'Required' }]}>
                    <Input.Password placeholder="Temporary password" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="MTS Identification Number" name="mtsNumber" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. MTS-2024-001" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Assigned Department" name="department" rules={[{ required: true, message: 'Required' }]}>
                    <Select
                      placeholder="Select department"
                      options={['AI&DS', 'IT', 'CSE', 'MECH', 'CSBS', 'Cyber Security'].map(value => ({
                        label: value,
                        value
                      }))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item label="Official Designation / Title" name="designation" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. Senior Professor & Head of Department" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <Button onClick={() => navigate('/hods')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {saving ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
