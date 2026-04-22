import React, { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppstoreOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
  MonitorOutlined,
  BarChartOutlined,
  PartitionOutlined,
  UserOutlined,
  PlusOutlined,
  LogoutOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Input, Menu, Typography } from 'antd';

const { Text } = Typography;

function getSelectedKey(pathname) {
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/attendance')) return 'attendance';
  if (pathname.startsWith('/performance')) return 'performance';
  if (pathname.startsWith('/mentee-allocation')) return 'allocation';
  if (
    pathname.startsWith('/students') ||
    pathname.startsWith('/mentee')
  ) {
    return 'students';
  }
  if (
    pathname.startsWith('/departments') ||
    pathname.startsWith('/mentor') ||
    pathname.startsWith('/mentors')
  ) {
    return 'faculty';
  }
  return 'dashboard';
}

function getPageLabel(pathname) {
  const selected = getSelectedKey(pathname);
  if (selected === 'faculty') return 'Faculty Management';
  if (selected === 'students') return 'Student Management';
  if (selected === 'allocation') return 'Mentee Allocation';
  if (selected === 'attendance') return 'Attendance Monitoring';
  if (selected === 'performance') return 'Performance Reports';
  if (selected === 'profile') return 'Profile Settings';
  return 'Head Of Department Dashboard';
}

function HodShellChrome({ pathname, user, onLogout, onNavigate }) {
  const initials = (user?.name || 'HOD')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const departmentPath = user?.department
    ? `/departments/${encodeURIComponent(user.department)}`
    : '/dashboard';

  const items = useMemo(
    () => [
      {
        key: 'dashboard',
        label: <Link to="/dashboard">Dashboard</Link>,
        icon: <AppstoreOutlined />
      },
      {
        key: 'faculty',
        label: <Link to={departmentPath}>Faculty</Link>,
        icon: <UsergroupAddOutlined />
      },
      {
        key: 'students',
        label: <Link to="/students">Students</Link>,
        icon: <TeamOutlined />
      },
      {
        key: 'allocation',
        label: <Link to="/mentee-allocation">Allocation</Link>,
        icon: <PartitionOutlined />
      },
      {
        key: 'attendance',
        label: <Link to="/attendance/monitor">Attendance</Link>,
        icon: <MonitorOutlined />
      },
      {
        key: 'performance',
        label: <Link to="/performance">Reports</Link>,
        icon: <BarChartOutlined />
      },
      {
        key: 'profile',
        label: <Link to="/profile">Profile</Link>,
        icon: <UserOutlined />
      }
    ],
    [departmentPath]
  );

  return (
    <div className="admin-sidebar-inner">
      <div className="admin-brand">
        <div className="admin-brand-mark">MP</div>
        <div>
          <div className="admin-brand-title">Mentorship Portal</div>
          <div className="admin-brand-subtitle">HOD Workspace</div>
        </div>
      </div>

      <Link to="/students/create" className="admin-cta-link" onClick={onNavigate}>
        <Button type="primary" icon={<PlusOutlined />} className="admin-cta-button" block>
          Create New
        </Button>
      </Link>

      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey(pathname)]}
        items={items}
        className="admin-nav-menu"
        onClick={onNavigate}
      />

      <div className="admin-sidebar-footer">
        <Button type="text" icon={<LogoutOutlined />} className="admin-logout-button" onClick={onLogout}>
          Logout
        </Button>
        <div className="admin-user-card">
          <div>
            <Text className="admin-user-name">{user?.name || 'Head Of Department'}</Text>
            <span className="admin-user-role">{(user?.role || 'hod').toUpperCase()}</span>
          </div>
          <Avatar className="admin-user-avatar">{initials}</Avatar>
        </div>
      </div>
    </div>
  );
}

export default function HodShellLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <HodShellChrome pathname={location.pathname} user={user} onLogout={handleLogout} />
      </aside>

      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={closeMobile}
        closable={false}
        size="default"
        className="admin-mobile-drawer"
        styles={{ body: { padding: 0 } }}
      >
        <HodShellChrome pathname={location.pathname} user={user} onLogout={handleLogout} onNavigate={closeMobile} />
      </Drawer>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-leading">
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              className="admin-mobile-menu"
              onClick={() => setMobileOpen(true)}
            />
            <div className="admin-topbar-title">{getPageLabel(location.pathname)}</div>
          </div>

          <div className="admin-topbar-actions">
            <Input prefix={<SearchOutlined />} placeholder="Search students, faculty, or reports..." className="admin-search" />
            <Badge dot>
              <Button type="text" shape="circle" icon={<BellOutlined />} className="admin-icon-button" />
            </Badge>
            <Button type="text" shape="circle" icon={<QuestionCircleOutlined />} className="admin-icon-button" />
            <div className="admin-topbar-user">
              <div className="admin-topbar-user-text">
                <span className="admin-topbar-user-name">{user?.name || 'HOD'}</span>
                <span className="admin-topbar-user-badge">{(user?.role || 'hod').toUpperCase()}</span>
              </div>
              <Avatar className="admin-user-avatar admin-topbar-avatar">
                {(user?.name || 'H')
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Avatar>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
