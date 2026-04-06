import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from 'api';
import { Form, Input, Button,  Typography, Divider, Row, Col } from 'antd';

const { Title } = Typography;

function AddStudentForm({ onStudentAdded }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [form] = Form.useForm();

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

      const response = await api.post('/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Success! Student ${response.data.name} created.`);
      if (onStudentAdded) {
        onStudentAdded(response.data);
      }
      form.resetFields();
      setProfileImage(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionTitle = (title) => (
    <Divider orientation="left" style={{ borderColor: '#cbd5e1', color: '#0f172a', fontWeight: 700, marginTop: 32, marginBottom: 24 }}>
      {title}
    </Divider>
  );

  return (
    <div style={{ padding: '0' }}>
      <Title level={4} style={{ marginBottom: 24, color: '#0f172a' }}>Add New Student</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ batch: '2023-2027' }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}><Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Register Number" name="registerNumber" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="VM Number" name="vmNumber" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Batch" name="batch" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Section" name="section"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Semester" name="semester"><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item label="Mentor's MTS Number" name="mentorMtsNumber" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Profile Image">
              <Input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={saving} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, fontWeight: 600, padding: '0 32px' }}>
            {saving ? 'Creating...' : 'Create Student'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddStudentForm;
