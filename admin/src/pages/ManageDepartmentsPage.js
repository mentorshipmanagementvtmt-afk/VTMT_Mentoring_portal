import React from 'react';
import { Link } from 'react-router-dom';
import { BankOutlined, TeamOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const DEPARTMENTS = ['AI&DS', 'IT', 'CSE', 'MECH', 'CSBS', 'Cyber Security'];

function ManageDepartmentsPage() {
  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">Department Directory</div>
          <h1 className="admin-page-title">Manage Departments</h1>
          <p className="admin-page-description">
            Navigate into each department to manage HOD assignments, faculty mapping, and mentorship operations.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {DEPARTMENTS.map((department) => (
          <Link key={department} to={`/departments/${department}`} className="activity-card-link">
            <Card className="surface-panel activity-card" variant="borderless">
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: '#eef2ff',
                  color: '#4b41e1',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 16
                }}
              >
                <BankOutlined />
              </div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 24, color: '#111c2d' }}>
                {department}
              </div>
              <p style={{ color: '#5f6675', marginTop: 10, marginBottom: 18 }}>
                View department details, assigned leadership, and mentor hierarchy.
              </p>
              <span className="reference-chip">
                <TeamOutlined />
                Open Department
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ManageDepartmentsPage;
