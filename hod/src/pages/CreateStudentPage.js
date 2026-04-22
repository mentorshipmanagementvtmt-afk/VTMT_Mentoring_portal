import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { useAuth } from '../context/AuthContext';
import api from 'api';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Row, Col, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

function CreateStudentPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    if (user?.department) {
      api.get(`/users/mentors?department=${encodeURIComponent(user.department)}`)
        .then(res => setMentors(res.data))
        .catch(err => console.error('Failed to fetch mentors', err));
    }
  }, [user]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (values.name) formData.append('name', values.name.trim());
      if (values.registerNumber) formData.append('registerNumber', values.registerNumber.trim());
      if (values.vmNumber) formData.append('vmNumber', values.vmNumber.trim());
      if (values.batch) formData.append('batch', values.batch.trim());
      formData.append('department', user.department);
      if (values.section) formData.append('section', values.section.trim());
      if (values.semester) formData.append('semester', values.semester.trim());
      if (values.mentorMtsNumber) formData.append('mentorMtsNumber', values.mentorMtsNumber.trim());

      const personal = {
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : null,
        placeOfBirth: values.placeOfBirth?.trim(),
        motherTongue: values.motherTongue?.trim()
      };
      formData.append('personal', JSON.stringify(personal));

      const parents = {
        fatherName: values.fatherName?.trim(),
        fatherQualification: values.fatherQualification?.trim(),
        fatherOccupation: values.fatherOccupation?.trim(),
        motherName: values.motherName?.trim(),
        motherQualification: values.motherQualification?.trim(),
        motherOccupation: values.motherOccupation?.trim()
      };
      formData.append('parents', JSON.stringify(parents));

      const addresses = {
        permanent: {
          doorNo: values.permanentDoorNo?.trim(),
          street: values.permanentStreet?.trim(),
          townOrVillage: values.permanentTownOrVillage?.trim(),
          taluk: values.permanentTaluk?.trim(),
          state: values.permanentState?.trim()
        },
        local: {
          doorNo: values.localDoorNo?.trim(),
          street: values.localStreet?.trim(),
          townOrVillage: values.localTownOrVillage?.trim(),
          taluk: values.localTaluk?.trim(),
          state: values.localState?.trim()
        }
      };
      formData.append('addresses', JSON.stringify(addresses));

      const contact = {
        contactNumber: values.contactNumber?.trim(),
        landline: values.landline?.trim(),
        email: values.email?.trim()
      };
      formData.append('contact', JSON.stringify(contact));

      const academics = {
        tenth: {
          board: values.tenthBoard?.trim(),
          yearOfPassing: values.tenthYearOfPassing?.trim(),
          english: { secured: Number(values.tenthEnglishSecured) || undefined, max: Number(values.tenthEnglishMax) || undefined },
          mathematics: { secured: Number(values.tenthMathSecured) || undefined, max: Number(values.tenthMathMax) || undefined },
          physics: { secured: Number(values.tenthPhysicsSecured) || undefined, max: Number(values.tenthPhysicsMax) || undefined },
          chemistry: { secured: Number(values.tenthChemistrySecured) || undefined, max: Number(values.tenthChemistryMax) || undefined },
          totalSecured: Number(values.tenthTotalSecured) || undefined,
          totalMax: Number(values.tenthTotalMax) || undefined
        },
        twelfth: {
          board: values.twelfthBoard?.trim(),
          yearOfPassing: values.twelfthYearOfPassing?.trim(),
          english: { secured: Number(values.twelfthEnglishSecured) || undefined, max: Number(values.twelfthEnglishMax) || undefined },
          mathematics: { secured: Number(values.twelfthMathSecured) || undefined, max: Number(values.twelfthMathMax) || undefined },
          physics: { secured: Number(values.twelfthPhysicsSecured) || undefined, max: Number(values.twelfthPhysicsMax) || undefined },
          chemistry: { secured: Number(values.twelfthChemistrySecured) || undefined, max: Number(values.twelfthChemistryMax) || undefined },
          totalSecured: Number(values.twelfthTotalSecured) || undefined,
          totalMax: Number(values.twelfthTotalMax) || undefined
        }
      };
      formData.append('academics', JSON.stringify(academics));

      const health = {
        generalHealth: values.generalHealth?.trim(),
        eyeSight: values.eyeSight?.trim(),
        bloodGroup: values.bloodGroup?.trim(),
        otherDeficiency: values.otherDeficiency?.trim(),
        illnessLastThreeYears: values.illnessLastThreeYears?.trim()
      };
      formData.append('health', JSON.stringify(health));

      const achievements = {
        past: values.achievementsPast?.trim(),
        present: values.achievementsPresent?.trim(),
        features: values.achievementsFeatures?.trim()
      };
      formData.append('achievements', JSON.stringify(achievements));

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await api.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Success! Student ${values.name} created.`);
      navigate('/dashboard'); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>

        <Card 
          title={<span style={{ fontWeight: 700, fontSize: 20 }}>Create New Student Profile</span>} 
          variant="outlined" 
          style={{ borderRadius: 16, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
          styles={{ header: { borderBottom: '1px solid #e2e8f0', padding: '24px' }, body: { padding: '32px 24px' } }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ batch: '2023-2027' }}
            size="large"
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Name</span>} name="name" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Register Number</span>} name="registerNumber" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>VM Number</span>} name="vmNumber" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Batch</span>} name="batch" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Section</span>} name="section">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Semester</span>} name="semester">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<span style={{ fontWeight: 600 }}>Assign Mentor</span>} name="mentorMtsNumber" rules={[{ required: true, message: 'Please select a mentor' }]}>
                  <Select placeholder="Select a Faculty Member" style={{ width: '100%' }} showSearch optionFilterProp="children">
                    {mentors.map(mentor => (
                      <Select.Option key={mentor.mtsNumber} value={mentor.mtsNumber}>
                        {mentor.name} ({mentor.mtsNumber})
                      </Select.Option>
                    ))}
                  </Select>
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
                {saving ? 'Creating Profile...' : 'Confirm & Create Student'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default CreateStudentPage;
