import React, { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppstoreOutlined,
  TeamOutlined,
  MonitorOutlined,
  BarChartOutlined,
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
  if (pathname.startsWith('/students') || pathname.startsWith('/mentee')) return 'students';
  return 'dashboard';
}

function MentorShellChrome({ pathname, user, onLogout, onNavigate }) {
  const initials = (user?.name || 'Mentor')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const items = useMemo(
    () => [
      {
        key: 'dashboard',
        label: <Link to="/dashboard">Dashboard</Link>,
        icon: <AppstoreOutlined />
      },
      {
        key: 'students',
        label: <Link to="/students">Students</Link>,
        icon: <TeamOutlined />
      },
      {
        key: 'attendance',
        label: <Link to="/attendance/log">Attendance</Link>,
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
    []
  );

  return (
    <div className="admin-sidebar-inner">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          <img
            src="/brand-favicon.webp"
            alt="Vel Tech Multi Tech"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 999 }}
          />
        </div>
      </div>

      <Link to="/attendance/log" className="admin-cta-link" onClick={onNavigate}>
        <Button type="primary" icon={<PlusOutlined />} className="admin-cta-button" block>
          Log Attendance
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
        <a
          href="https://trakshard.com"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', marginBottom: 10, display: 'inline-block' }}
        >
          Developed by Trakshard
        </a>
        <Button type="text" icon={<LogoutOutlined />} className="admin-logout-button" onClick={onLogout}>
          Logout
        </Button>
        <div className="admin-user-card">
          <div>
            <Text className="admin-user-name">{user?.name || 'Mentor'}</Text>
            <span className="admin-user-role">{(user?.role || 'mentor').toUpperCase()}</span>
          </div>
          <Avatar className="admin-user-avatar">{initials}</Avatar>
        </div>
      </div>
    </div>
  );
}

export default function MentorShellLayout() {
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
        <MentorShellChrome pathname={location.pathname} user={user} onLogout={handleLogout} />
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
        <MentorShellChrome pathname={location.pathname} user={user} onLogout={handleLogout} onNavigate={closeMobile} />
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
            <Link to="/dashboard" className="admin-topbar-brand" aria-label="Vel Tech Faculty dashboard">
              <img src="/brand-navbar-wordmark.webp" alt="Vel Tech Multi Tech" className="admin-topbar-brand-wordmark" />
            </Link>
          </div>

          <div className="admin-topbar-search-wrap">
            <Input prefix={<SearchOutlined />} placeholder="Search mentees, attendance, or reports..." className="admin-search" />
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-topbar-utility">
              <Badge dot>
                <Button type="text" shape="circle" icon={<BellOutlined />} className="admin-icon-button" />
              </Badge>
              <Button type="text" shape="circle" icon={<QuestionCircleOutlined />} className="admin-icon-button" />
            </div>
            <div className="admin-topbar-user">
              <div className="admin-topbar-user-text">
                <span className="admin-topbar-user-name">{user?.name || 'Mentor'}</span>
                <span className="admin-topbar-user-badge">{(user?.role || 'mentor').toUpperCase()}</span>
              </div>
              <Avatar className="admin-user-avatar admin-topbar-avatar">
                {(user?.name || 'M')
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
