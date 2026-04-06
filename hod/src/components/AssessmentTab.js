import React, { useState } from 'react';
import { Card, Typography, Button, Space, Tag, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AssessmentForm from './AssessmentForm';
import { toast } from 'react-toastify';
import api from '../api';

const { Title, Text } = Typography;

function AssessmentTab({ studentId, assessments, fetchStudentDetails }) {
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

  const handleDeleteAssessment = async (assessmentId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this assessment record?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/assessments/${assessmentId}`);
          toast.success('Assessment deleted successfully');
          fetchStudentDetails();
        } catch (err) {
          const msg = err?.response?.data?.message || 'Failed to delete assessment.';
          toast.error(msg);
        }
      }
    });
  };

  const handleAddNewClick = () => {
    setEditingAssessment(null);
    setShowAssessmentForm(true);
  };

  const handleEditClick = (assessment) => {
    setEditingAssessment(assessment);
    setShowAssessmentForm(true);
  };

  const handleFormSave = () => {
    setShowAssessmentForm(false);
    fetchStudentDetails();
  };

  const handleFormCancel = () => setShowAssessmentForm(false);

  return (
    <Card
      variant="borderless"
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>Assessment Data</Title>
          <Tag color="cyan">Sheet 1</Tag>
        </Space>
      }
      extra={
        !showAssessmentForm && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNewClick} style={{ background: '#10b981', borderColor: '#10b981' }}>
            Add New
          </Button>
        )
      }
      style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      {showAssessmentForm ? (
        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <AssessmentForm
            studentId={studentId}
            assessmentToEdit={editingAssessment}
            onAssessmentAdded={handleFormSave}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        assessments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', border: '2px dashed #e2e8f0', borderRadius: 12 }}>
            <Text type="secondary">No assessment data found.</Text>
          </div>
        )
      )}

      {!showAssessmentForm && assessments.length > 0 && (
        <Space orientation="vertical" style={{ width: '100%' }}>
          {assessments.map(ass => (
            <Card key={ass._id} size="small" style={{ background: '#f8fafc', borderRadius: 8, borderColor: '#e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>{ass.academicYear}</Title>
                  <Text type="secondary">Attendance: <Text strong>{ass.attendancePercent}%</Text></Text>
                </div>
                <Space>
                  <Button type="default" icon={<EditOutlined />} onClick={() => handleEditClick(ass)} style={{ color: '#d97706', borderColor: '#d97706' }}>Edit</Button>
                  <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDeleteAssessment(ass._id)}>Delete</Button>
                </Space>
              </div>
            </Card>
          ))}
        </Space>
      )}
    </Card>
  );
}

export default AssessmentTab;
