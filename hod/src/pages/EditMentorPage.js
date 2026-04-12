import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUpload from '../components/ProfileImageUpload';
import api from 'api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Row, Col, Typography, Spin, Avatar } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

function EditMentorPage() {
  const { mentorId } = useParams();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await api.get(`/users/mentor/${mentorId}`);
        setMentor(res.data);
        form.setFieldsValue({
          name: res.data.name,
          email: res.data.email,
          mtsNumber: res.data.mtsNumber,
          designation: res.data.designation,
        });
      } catch (err) {
        toast.error('Failed to load faculty details.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [mentorId, form, navigate]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
          formData.append(key, values[key]);
        }
      });

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await api.put(`/users/mentor/${mentorId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Faculty profile updated successfully!');
      navigate(`/departments/${user.department}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update faculty profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Button type="link" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', fontWeight: 500, padding: 0 }}>
          <ArrowLeftOutlined /> Back
        </Button>

        <Card
          title={<span style={{ fontWeight: 700, fontSize: 20 }}>Edit Faculty Profile</span>}
          variant="outlined"
          style={{ borderRadius: 16, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          styles={{ header: { borderBottom: '1px solid #e2e8f0', padding: '24px' }, body: { padding: '32px 24px' } }}
        >
          {/* Current Profile Image Preview */}
          {mentor?.profileImage?.url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: '#f1f5f9', borderRadius: 12 }}>
              <Avatar src={mentor.profileImage.url} size={64} />
              <div>
                <Text strong style={{ display: 'block' }}>{mentor.name}</Text>
                <Text type="secondary">{mentor.mtsNumber} · {mentor.designation}</Text>
              </div>
            </div>
          )}

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
                <Form.Item label={<span style={{ fontWeight: 600 }}>MTS Number</span>} name="mtsNumber" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} placeholder="e.g. MTS1234" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Designation</span>} name="designation" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} placeholder="e.g. Assistant Professor" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>New Password</span>} name="password" extra="Leave blank to keep current password.">
                  <Input.Password style={{ borderRadius: 8 }} placeholder="Leave blank to keep unchanged" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Update Profile Image</span>}>
                  <ProfileImageUpload onChange={setProfileImage} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
              <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 600, borderRadius: 8, width: '100%' }}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default EditMentorPage;
