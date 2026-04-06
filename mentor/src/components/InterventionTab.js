import React, { useState } from 'react';
import { Card, Typography, Button, Space, Tag, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import InterventionForm from './InterventionForm';
import { toast } from 'react-toastify';
import api from '../api';

const { Title, Text } = Typography;

function InterventionTab({ studentId, interventions, fetchStudentDetails }) {
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [showInterventionForm, setShowInterventionForm] = useState(false);

  const handleDeleteIntervention = async (interventionId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this intervention log?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/interventions/${interventionId}`);
          toast.success('Intervention deleted successfully');
          fetchStudentDetails();
        } catch (err) {
          const msg = err?.response?.data?.message || 'Failed to delete intervention.';
          toast.error(msg);
        }
      }
    });
  };

  const handleAddNewInterventionClick = () => {
    setEditingIntervention(null);
    setShowInterventionForm(true);
  };

  const handleEditInterventionClick = (data) => {
    setEditingIntervention(data);
    setShowInterventionForm(true);
  };

  const handleInterventionFormSave = () => {
    setShowInterventionForm(false);
    fetchStudentDetails();
  };

  const handleInterventionFormCancel = () => setShowInterventionForm(false);

  return (
    <Card
      variant="borderless"
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>Intervention Log</Title>
          <Tag color="purple">Sheet 2</Tag>
        </Space>
      }
      extra={
        !showInterventionForm && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNewInterventionClick} style={{ background: '#10b981', borderColor: '#10b981' }}>
            Add New
          </Button>
        )
      }
      style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
    >
      {showInterventionForm ? (
        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <InterventionForm
            studentId={studentId}
            interventionToEdit={editingIntervention}
            onInterventionAdded={handleInterventionFormSave}
            onCancel={handleInterventionFormCancel}
          />
        </div>
      ) : (
        interventions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', border: '2px dashed #e2e8f0', borderRadius: 12 }}>
            <Text type="secondary">No intervention data found.</Text>
          </div>
        )
      )}

      {!showInterventionForm && interventions.length > 0 && (
        <Space orientation="vertical" style={{ width: '100%' }}>
          {interventions.map(int => (
            <Card key={int._id} size="small" style={{ background: '#f8fafc', borderRadius: 8, borderColor: '#e2e8f0' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <Title level={5} style={{ margin: 0 }}>
                  {int.monthYear} <Text type="secondary" style={{ fontSize: 13, color: '#0ea5e9' }}>({int.category})</Text>
                </Title>
                <Space>
                  <Button type="default" size="small" icon={<EditOutlined />} onClick={() => handleEditInterventionClick(int)} style={{ color: '#d97706', borderColor: '#d97706' }}>Edit</Button>
                  <Button type="primary" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteIntervention(int._id)}>Delete</Button>
                </Space>
              </div>
              <Text style={{ display: 'block', marginBottom: 4 }}><Text strong>Action:</Text> {int.actionTaken}</Text>
              <Text style={{ display: 'block' }}><Text strong>Impact:</Text> {int.impact}</Text>
            </Card>
          ))}
        </Space>
      )}
    </Card>
  );
}

export default InterventionTab;
