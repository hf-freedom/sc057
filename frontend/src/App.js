import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Avatar, Dropdown, Button, message } from 'antd';
import {
  DashboardOutlined,
  ScheduleOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  NotificationOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Users from './pages/Users';
import Coaches from './pages/Coaches';
import Bookings from './pages/Bookings';
import Notifications from './pages/Notifications';
import Settlements from './pages/Settlements';
import CheckInPage from './pages/CheckIn';
import { notificationApi, userApi } from './api';

const { Header, Sider, Content } = Layout;

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUnreadCount();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const response = await userApi.getAll();
      if (response.data && response.data.length > 0) {
        setCurrentUser(response.data[0]);
      }
    } catch (error) {
      console.error('加载用户失败:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getByUser(currentUser.id);
      const unread = response.data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>,
    },
    {
      key: '/checkin',
      icon: <CheckCircleOutlined />,
      label: <Link to="/checkin">签到管理</Link>,
    },
    {
      key: '/classes',
      icon: <ScheduleOutlined />,
      label: <Link to="/classes">课程管理</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">用户管理</Link>,
    },
    {
      key: '/coaches',
      icon: <TeamOutlined />,
      label: <Link to="/coaches">教练管理</Link>,
    },
    {
      key: '/bookings',
      icon: <CalendarOutlined />,
      label: <Link to="/bookings">预约管理</Link>,
    },
    {
      key: '/notifications',
      icon: <NotificationOutlined />,
      label: (
        <Badge count={unreadCount} size="small">
          <Link to="/notifications">通知中心</Link>
        </Badge>
      ),
    },
    {
      key: '/settlements',
      icon: <FileTextOutlined />,
      label: <Link to="/settlements">结算管理</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: currentUser?.name || '用户',
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          {collapsed ? (
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>团</span>
          ) : (
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>团课预约系统</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '500' }}>
            欢迎使用团课预约系统
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>课时余额: <strong style={{ color: '#1890ff' }}>{currentUser.lessonBalance}</strong></span>
                <span>信用分: <strong style={{ color: currentUser.creditScore >= 80 ? '#52c41a' : '#ff4d4f' }}>{currentUser.creditScore}</strong></span>
                {currentUser.blacklisted && (
                  <Badge status="error" text="黑名单" />
                )}
              </div>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{currentUser?.name || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            minHeight: 'calc(100vh - 112px)',
            borderRadius: '8px',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard currentUser={currentUser} />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/classes" element={<Classes currentUser={currentUser} />} />
            <Route path="/users" element={<Users />} />
            <Route path="/coaches" element={<Coaches />} />
            <Route path="/bookings" element={<Bookings currentUser={currentUser} />} />
            <Route path="/notifications" element={<Notifications currentUser={currentUser} />} />
            <Route path="/settlements" element={<Settlements />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWithRouter;
