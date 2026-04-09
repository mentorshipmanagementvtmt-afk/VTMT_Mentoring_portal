import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../api';
import { Card, Row, Col, Typography, Button, Spin, Table, DatePicker, InputNumber, Form, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function AttendanceLogPage() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [targetDate, setTargetDate] = useState(dayjs().startOf('week').add(1, 'day')); // Default to this week's Monday
  const [classesHeld, setClassesHeld] = useState(0);
  const [form] = Form.useForm();

  const fetchMentees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/my-mentees`);
      setMentees(response.data);
      
      // Initialize form fields
      const initVals = {};
      response.data.forEach(m => {
        initVals[`attended_${m._id}`] = 0;
      });
      form.setFieldsValue(initVals);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch mentees.');
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchMentees();
  }, [fetchMentees]);

  const handleSubmit = async () => {
    if (!classesHeld || classesHeld <= 0) {
      toast.error('Please enter a valid number of Total Classes Held this week.');
      return;
    }

    try {
      const values = await form.validateFields();
      const records = mentees.map(m => ({
        studentId: m._id,
        classesAttended: values[`attended_${m._id}`] || 0
      }));

      // Validate that attended is not greater than held
      for (const rec of records) {
        if (rec.classesAttended > classesHeld) {
          toast.error("Classes attended cannot exceed total classes held.");
          return;
        }
      }

      setSubmitting(true);
      await api.post('/attendance/bulk', {
        weekStartDate: targetDate.format('YYYY-MM-DD'),
        classesHeld,
        records
      });

      toast.success('Attendance records saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit attendance. Ensure you haven\'t already submitted for this week.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Reg Number',
      dataIndex: 'registerNumber',
      key: 'registerNumber',
      render: text => <Text strong style={{ color: '#0ea5e9' }}>{text}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Classes Attended',
      key: 'classesAttended',
      render: (text, record) => (
        <Form.Item 
          name={`attended_${record._id}`} 
          noStyle 
          rules={[{ required: true, message: 'Required' }]}
        >
          <InputNumber min={0} max={classesHeld || 100} style={{ width: '100%' }} placeholder="Attended" />
        </Form.Item>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 16, color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeftOutlined /> Back to Dashboard
        </Link>
        
        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Weekly Attendance Log</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 16 }}>
           Enter the total number of classes held this week, and log how many classes each mentee attended.
        </Text>

        <Card variant="borderless" style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: 24 }}>
           <Row gutter={24} align="bottom">
              <Col xs={24} sm={12}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Week Start Date (Monday)</Text>
                <DatePicker 
                  value={targetDate} 
                  onChange={date => setTargetDate(date)} 
                  style={{ width: '100%' }} 
                  allowClear={false}
                  picker="date"
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Total Classes Held</Text>
                <InputNumber 
                  min={1} 
                  value={classesHeld} 
                  onChange={val => setClassesHeld(val)} 
                  style={{ width: '100%' }} 
                  placeholder="e.g. 20"
                />
              </Col>
           </Row>
        </Card>

        <Card variant="borderless" styles={{ body: { padding: 0 } }} style={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <Form form={form}>
            <Table 
              columns={columns} 
              dataSource={mentees} 
              rowKey="_id" 
              loading={loading}
              pagination={false}
              locale={{ emptyText: 'No students assigned to you.' }}
            />
          </Form>
          {mentees.length > 0 && (
            <div style={{ padding: 24, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSubmit} 
                loading={submitting}
                style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 600, padding: '0 32px', height: 40 }}
              >
                Submit Attendance
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AttendanceLogPage;
