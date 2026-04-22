import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import { useAuth } from '../context/AuthContext';
import ProfileImageUpload from '../components/ProfileImageUpload';
import api from '../api';

function CreateMentorPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { data } = await api.get('/departments');
        setDepartments(data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load departments.');
      }
    };

    loadDepartments();
  }, []);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key]) {
          formData.append(key, values[key]);
        }
      });

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await api.post('/users/create-mentor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`Success! Mentor ${values.name} created.`);
      navigate('/departments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create faculty.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Faculty Setup</div>
          <h1 className="admin-page-title">Create New Faculty Profile</h1>
          <p className="admin-page-description">
            Register a new mentor profile and connect them to a department for mentorship allocation.
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
                <Col xs={24} md={12}>
                  <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. Dr. Marcus Thorne" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Institutional Email"
                    name="email"
                    rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Invalid email' }]}
                  >
                    <Input placeholder="m.thorne@institution.edu" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="MTS Number" name="mtsNumber" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. MTS-1092" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Designation" name="designation" rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="e.g. Assistant Professor" />
                  </Form.Item>
                </Col>

                {isAdmin ? (
                  <Col xs={24} md={12}>
                    <Form.Item label="Department" name="department" rules={[{ required: true, message: 'Required' }]}>
                      <Select
                        placeholder="Select Department"
                        options={departments.map((department) => ({
                          label: department.department,
                          value: department.department
                        }))}
                      />
                    </Form.Item>
                  </Col>
                ) : null}

                <Col xs={24} md={12}>
                  <Form.Item label="Initial Password" name="password" rules={[{ required: true, message: 'Required' }]}>
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <Button onClick={() => navigate('/departments')}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {saving ? 'Creating Profile...' : 'Create Faculty'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default CreateMentorPage;
