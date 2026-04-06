const fs = require('fs');

const adminDashboard = `import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Typography, Card } from 'antd';
import AddMentorForm from './AddMentorForm';

const { Title, Text } = Typography;

function AdminDashboard() {
  const [showAddMentor, setShowAddMentor] = useState(false);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4, color: '#0f172a' }}>Admin Dashboard</Title>
      <Text type="secondary" style={{ display: 'block', paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
        System Administrator View
      </Text>
      
      <Row gutter={[12, 12]} style={{ paddingBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Link to="/hods" style={{ width: '100%', display: 'block' }}>
            <Button 
              block
              type="primary" 
              style={{ background: '#3b82f6', borderColor: '#3b82f6', borderRadius: 8, height: 40, fontWeight: 500 }}
            >
              Manage HOD Profiles
            </Button>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Link to="/departments" style={{ width: '100%', display: 'block' }}>
            <Button 
              block
              type="primary" 
              style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, height: 40, fontWeight: 500 }}
            >
              Manage Faculties
            </Button>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Button 
            block
            type="primary" 
            onClick={() => {
              setShowAddMentor(!showAddMentor);
            }} 
            style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, height: 40, fontWeight: 500 }}
          >
            {showAddMentor ? 'Close Form' : 'Add New Faculty'}
          </Button>
        </Col>
      </Row>
      
      {showAddMentor && (
        <Card style={{ marginBottom: 24, background: '#f8fafc', borderRadius: 12, borderColor: '#e2e8f0' }}>
          <AddMentorForm
            onMentorAdded={(newMentor) => {
              toast.success(newMentor.name + " added successfully.");
              setShowAddMentor(false);
            }}
          />
        </Card>
      )}
    </div>
  );
}

export default AdminDashboard;
`;

const hodDashboard = `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Typography, Card } from 'antd';
import AddMentorForm from './AddMentorForm';
import AddStudentForm from './AddStudentForm';

const { Title, Text } = Typography;

function HodDashboard() {
  const { user } = useAuth();
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4, color: '#0f172a' }}>HOD Dashboard</Title>
      <Text type="secondary" style={{ display: 'block', paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
        Your Department: {user.department}
      </Text>
      
      <Row gutter={[12, 12]} style={{ paddingBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Link to={"/departments/"+user.department} style={{ width: '100%', display: 'block' }}>
            <Button 
              block
              type="primary" 
              style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: 8, height: 40, fontWeight: 500 }}
            >
              Manage Faculties
            </Button>
          </Link>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Button 
            block
            type="primary" 
            onClick={() => {
              setShowAddMentor(!showAddMentor);
              if (!showAddMentor) setShowAddStudent(false);
            }} 
            style={{ background: '#10b981', borderColor: '#10b981', borderRadius: 8, height: 40, fontWeight: 500 }}
          >
            {showAddMentor ? 'Close Form' : 'Add New Faculty'}
          </Button>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Button 
            block
            type="primary" 
            onClick={() => {
              setShowAddStudent(!showAddStudent);
              if (!showAddStudent) setShowAddMentor(false);
            }} 
            style={{ background: '#8b5cf6', borderColor: '#8b5cf6', borderRadius: 8, height: 40, fontWeight: 500 }}
          >
            {showAddStudent ? 'Close Form' : 'Add New Student'}
          </Button>
        </Col>
      </Row>
      
      {showAddMentor && (
        <Card style={{ marginBottom: 24, background: '#f8fafc', borderRadius: 12, borderColor: '#e2e8f0' }}>
          <AddMentorForm
            onMentorAdded={(newMentor) => {
              toast.success(newMentor.name + " added successfully! View them in Manage Faculties.");
              setShowAddMentor(false);
            }}
          />
        </Card>
      )}
      
      {showAddStudent && (
        <Card style={{ marginBottom: 24, background: '#f8fafc', borderRadius: 12, borderColor: '#e2e8f0' }}>
          <AddStudentForm
            onStudentAdded={(newStudent) => {
              setShowAddStudent(false);
            }}
          />
        </Card>
      )}
    </div>
  );
}

export default HodDashboard;
`;

fs.writeFileSync('c:/Users/RANJITH/OneDrive/Documents/Desktop/veltech-mentoring-portal/admin/src/components/AdminDashboard.js', adminDashboard);
fs.writeFileSync('c:/Users/RANJITH/OneDrive/Documents/Desktop/veltech-mentoring-portal/hod/src/components/HodDashboard.js', hodDashboard);

console.log("Updated dashboards");
