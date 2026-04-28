import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { bookingApi, classApi, userApi } from '../api';

const Bookings = ({ currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBookings();
    loadClasses();
    loadUsers();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingApi.getAll();
      setBookings(response.data || []);
    } catch (error) {
      message.error('加载预约失败');
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classApi.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('加载课程失败:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('加载用户失败:', error);
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      const result = await bookingApi.book(values.userId, values.classId);
      if (result.data?.success) {
        message.success(result.data.message);
        setCreateModalVisible(false);
        form.resetFields();
        loadBookings();
      } else {
        message.error(result.data?.message || '预约失败');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '预约失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      setLoading(true);
      const result = await bookingApi.cancel(bookingId, '用户取消');
      if (result.data?.success) {
        message.success(result.data.message);
        loadBookings();
      } else {
        message.error(result.data?.message || '取消失败');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '取消失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      BOOKED: { color: 'blue', text: '已预约' },
      WAITLIST: { color: 'orange', text: '候补中' },
      CANCELLED: { color: 'default', text: '已取消' },
      CHECKED_IN: { color: 'green', text: '已签到' },
      NO_SHOW: { color: 'red', text: '爽约' },
      COMPLETED: { color: 'purple', text: '已完成' },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const getClassStatusTag = (status) => {
    const statusMap = {
      SCHEDULED: { color: 'blue', text: '已排课' },
      IN_PROGRESS: { color: 'green', text: '进行中' },
      COMPLETED: { color: 'default', text: '已完成' },
      CANCELLED: { color: 'red', text: '已取消' },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const availableClasses = classes.filter(c => {
    if (c.status !== 'SCHEDULED') return false;
    const classStartTime = dayjs(c.startTime);
    return dayjs().isBefore(classStartTime);
  });

  const columns = [
    {
      title: '预约ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => {
        const user = users.find(u => u.id === record.userId);
        return (
          <Space>
            <span>{user?.name || `用户${record.userId}`}</span>
            {user?.blacklisted && <Tag color="red">黑名单</Tag>}
          </Space>
        );
      },
    },
    {
      title: '课程',
      key: 'class',
      render: (_, record) => {
        const cls = classes.find(c => c.id === record.classId);
        return (
          <div>
            <div><strong>{cls?.name || `课程${record.classId}`}</strong></div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {cls && dayjs(cls.startTime).format('YYYY-MM-DD HH:mm')}
            </div>
          </div>
        );
      },
    },
    {
      title: '课程状态',
      key: 'classStatus',
      render: (_, record) => {
        const cls = classes.find(c => c.id === record.classId);
        return cls ? getClassStatusTag(cls.status) : null;
      },
    },
    {
      title: '预约时间',
      key: 'bookedAt',
      render: (_, record) => dayjs(record.bookedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '预约状态',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '扣除课时',
      dataIndex: 'lessonsDeducted',
      key: 'lessonsDeducted',
      render: (val) => (
        <span style={{ color: val > 0 ? '#ff4d4f' : '#999' }}>
          {val || 0} 课时
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const canCancel = record.status === 'BOOKED' || record.status === 'WAITLIST';
        const cls = classes.find(c => c.id === record.classId);
        const isFutureClass = cls && (cls.status === 'SCHEDULED' || cls.status === 'IN_PROGRESS');
        
        return canCancel && isFutureClass ? (
          <Popconfirm
            title="确定要取消该预约吗？"
            description={
              <div>
                <p>取消规则：</p>
                <ul>
                  <li>开课前24小时以上取消：全额退还课时</li>
                  <li>开课前24小时内取消：扣除全部课时</li>
                </ul>
              </div>
            }
            onConfirm={() => handleCancel(record.id)}
            okText="确定取消"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              取消预约
            </Button>
          </Popconfirm>
        ) : null;
      },
    },
  ];

  return (
    <div>
      <Card
        title="预约列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新增预约
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card title="预约规则说明" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, padding: '16px', background: '#e6f7ff', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>预约规则：</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>用户需有足够的课时余额才能预约</li>
              <li>课程名额满时，自动进入候补队列</li>
              <li>黑名单用户、爽约3次以上、信用分低于60无法预约</li>
            </ul>
          </div>
          <div style={{ flex: 1, padding: '16px', background: '#fff7e6', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#fa8c16' }}>取消规则：</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>开课前24小时以上取消：全额退还课时</li>
              <li>开课前24小时内取消：扣除全部课时</li>
              <li>取消后如有候补用户，系统自动补位</li>
            </ul>
          </div>
          <div style={{ flex: 1, padding: '16px', background: '#fff1f0', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#ff4d4f' }}>爽约规则：</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>课程开始后15分钟未签到：标记为爽约</li>
              <li>爽约1次：扣除课时 + 信用分-10</li>
              <li>爽约3次：加入黑名单</li>
            </ul>
          </div>
        </div>
      </Card>

      <Modal
        title="新增预约"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="userId"
            label="选择用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select placeholder="请选择用户">
              {users.map(user => (
                <Select.Option key={user.id} value={user.id} disabled={!user.canBook}>
                  {user.name} (余额: {user.lessonBalance}课时, 信用分: {user.creditScore})
                  {user.blacklisted && ' [黑名单]'}
                  {user.noShowCount >= 3 && ' [爽约过多]'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="classId"
            label="选择课程"
            rules={[{ required: true, message: '请选择课程' }]}
          >
            <Select placeholder="请选择课程">
              {availableClasses.map(cls => (
                <Select.Option key={cls.id} value={cls.id}>
                  {cls.name} - {dayjs(cls.startTime).format('YYYY-MM-DD HH:mm')}
                  (需要{cls.requiredLessons}课时)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                预约
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Bookings;
