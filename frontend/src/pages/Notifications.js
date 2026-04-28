import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Tag,
  Space,
  Empty,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  BellOutlined,
  CalendarOutlined,
  WarningOutlined,
  WalletOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { notificationApi } from '../api';

const Notifications = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const response = await notificationApi.getByUser(currentUser.id);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      loadNotifications();
      message.success('已标记为已读');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      await notificationApi.markAllAsRead(currentUser.id);
      loadNotifications();
      message.success('已全部标记为已读');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      BOOKING_SUCCESS: <CalendarOutlined style={{ color: '#52c41a' }} />,
      BOOKING_WAITLIST: <CalendarOutlined style={{ color: '#faad14' }} />,
      WAITLIST_PROMOTED: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      CANCEL_SUCCESS: <CalendarOutlined style={{ color: '#1890ff' }} />,
      CLASS_CANCELLED: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      NO_SHOW: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      CHECKIN_SUCCESS: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      SETTLEMENT_GENERATED: <FileTextOutlined style={{ color: '#722ed1' }} />,
    };
    return iconMap[type] || <BellOutlined />;
  };

  const getTypeTag = (type) => {
    const tagMap = {
      BOOKING_SUCCESS: { color: 'green', text: '预约成功' },
      BOOKING_WAITLIST: { color: 'orange', text: '候补成功' },
      WAITLIST_PROMOTED: { color: 'green', text: '候补晋升' },
      CANCEL_SUCCESS: { color: 'blue', text: '取消成功' },
      CLASS_CANCELLED: { color: 'red', text: '课程取消' },
      NO_SHOW: { color: 'red', text: '爽约提醒' },
      CHECKIN_SUCCESS: { color: 'green', text: '签到成功' },
      SETTLEMENT_GENERATED: { color: 'purple', text: '结算单' },
    };
    const info = tagMap[type] || { color: 'default', text: type };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <Card
        title={
          <Space>
            <BellOutlined />
            通知中心
            {unreadCount > 0 && (
              <Tag color="red">{unreadCount} 条未读</Tag>
            )}
          </Space>
        }
        extra={
          unreadCount > 0 ? (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={handleMarkAllAsRead}
            >
              全部标为已读
            </Button>
          ) : null
        }
      >
        {notifications.length > 0 ? (
          <List
            dataSource={notifications}
            loading={loading}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.read ? '#fff' : '#f6ffed',
                  padding: '16px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  borderLeft: item.read ? 'none' : '4px solid #52c41a',
                }}
                actions={[
                  !item.read && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      标为已读
                    </Button>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: '#f0f0f0',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      {getTypeIcon(item.type)}
                    </div>
                  }
                  title={
                    <Space>
                      <span style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                        {item.title}
                      </span>
                      {getTypeTag(item.type)}
                      {!item.read && <Tag color="red">未读</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                        {item.content}
                      </p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>
                        {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                      </p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无通知" />
        )}
      </Card>

      <Card title="通知类型说明" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="green">预约成功</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>用户预约课程成功</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="orange">候补成功</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>课程已满，加入候补队列</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="green">候补晋升</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>从候补队列晋升为正式预约</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="blue">取消成功</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>用户取消预约/候补</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="red">课程取消</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>教练请假或其他原因取消课程</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="red">爽约提醒</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>未签到被标记为爽约</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="green">签到成功</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>用户签到成功</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="purple">结算单</Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>月度课时费结算单已生成</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
