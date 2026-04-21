import React, { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MenuFoldOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BankOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  MonitorOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Button, Drawer, Input, Menu, Typography } from 'antd';

const { Text } = Typography;

const navigationItems = [
  {
    key: 'dashboard',
    label: <Link to="/dashboard">Dashboard</Link>,
    icon: <AppstoreOutlined />
  },
  {
    key: 'hods',
    label: <Link to="/hods">HODs</Link>,
    icon: <BankOutlined />
  },
  {
    key: 'departments',
    label: <Link to="/departments">Faculty</Link>,
    icon: <UsergroupAddOutlined />
  },
  {
    key: 'students',
    label: <Link to="/students">Students</Link>,
    icon: <TeamOutlined />
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
  }
];

function getSelectedKey(pathname) {
  if (pathname.startsWith('/hod')) return 'hods';
  if (pathname.startsWith('/departments') || pathname.startsWith('/mentor')) return 'departments';
  if (pathname.startsWith('/students') || pathname.startsWith('/mentee')) return 'students';
  if (pathname.startsWith('/attendance')) return 'attendance';
  if (pathname.startsWith('/performance')) return 'performance';
  return 'dashboard';
}

function getPageLabel(pathname) {
  switch (getSelectedKey(pathname)) {
    case 'hods':
      return 'HOD Management';
    case 'departments':
      return 'Faculty Management';
    case 'students':
      return 'Student Directory';
    case 'attendance':
      return 'Attendance Monitoring';
    case 'performance':
      return 'Performance Reports';
    default:
      return 'Academic Mentorship Portal';
  }
}

function AdminShellChrome({ pathname, user, onLogout, onNavigate }) {
  const selectedKey = useMemo(() => getSelectedKey(pathname), [pathname]);
  const initials = (user?.name || 'Admin')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="admin-sidebar-inner">
      <div className="admin-brand">
        <div className="admin-brand-mark">MP</div>
        <div>
          <div className="admin-brand-title">Mentorship Portal</div>
          <div className="admin-brand-subtitle">Academic Management</div>
        </div>
      </div>

      <Link to="/hods/create" className="admin-cta-link" onClick={onNavigate}>
        <Button type="primary" icon={<PlusOutlined />} className="admin-cta-button" block>
          Create New
        </Button>
      </Link>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={navigationItems}
        className="admin-nav-menu"
        onClick={onNavigate}
      />

      <div className="admin-sidebar-footer">
        <Button type="text" icon={<LogoutOutlined />} className="admin-logout-button" onClick={onLogout}>
          Logout
        </Button>

        <div className="admin-user-card">
          <div>
            <Text className="admin-user-name">{user?.name || 'System Admin'}</Text>
            <span className="admin-user-role">{(user?.role || 'admin').toUpperCase()}</span>
          </div>
          <Avatar className="admin-user-avatar">{initials}</Avatar>
        </div>
      </div>
    </div>
  );
}

export default function AdminShellLayout() {
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
        <AdminShellChrome pathname={location.pathname} user={user} onLogout={handleLogout} />
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
        <AdminShellChrome
          pathname={location.pathname}
          user={user}
          onLogout={handleLogout}
          onNavigate={closeMobile}
        />
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
            <div>
              <div className="admin-topbar-title">{getPageLabel(location.pathname)}</div>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search students, faculty, or reports..."
              className="admin-search"
            />
            <Badge dot>
              <Button type="text" shape="circle" icon={<BellOutlined />} className="admin-icon-button" />
            </Badge>
            <Button type="text" shape="circle" icon={<QuestionCircleOutlined />} className="admin-icon-button" />
            <div className="admin-topbar-user">
              <div className="admin-topbar-user-text">
                <span className="admin-topbar-user-name">{user?.name || 'System Admin'}</span>
                <span className="admin-topbar-user-badge">{(user?.role || 'admin').toUpperCase()}</span>
              </div>
              <Avatar className="admin-user-avatar admin-topbar-avatar">
                {(user?.name || 'A')
                  .split(' ')
                  .map(part => part[0])
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
