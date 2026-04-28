import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Descriptions,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { userApi, bookingApi, noShowApi } from '../api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [noShows, setNoShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [userNoShows, setUserNoShows] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
    loadBookings();
    loadNoShows();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userApi.getAll();
      setUsers(response.data || []);
    } catch (error) {
      message.error('加载用户失败');
    }
  };

  const loadBookings = async () => {
    try {
      const response = await bookingApi.getAll();
      setBookings(response.data || []);
    } catch (error) {
      console.error('加载预约失败:', error);
    }
  };

  const loadNoShows = async () => {
    try {
      const response = await noShowApi.getAll();
      setNoShows(response.data || []);
    } catch (error) {
      console.error('加载爽约记录失败:', error);
    }
  };

  const viewUserDetail = async (user) => {
    setSelectedUser(user);
    try {
      const [bookingsRes, noShowsRes] = await Promise.all([
        bookingApi.getByUser(user.id),
        noShowApi.getByUser(user.id),
      ]);
      setUserBookings(bookingsRes.data || []);
      setUserNoShows(noShowsRes.data || []);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取用户详情失败');
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      const userData = {
        name: values.name,
        phone: values.phone,
        lessonBalance: values.lessonBalance || 0,
        creditScore: 100,
        blacklisted: false,
        noShowCount: 0,
      };
      await userApi.create(userData);
      message.success('创建用户成功');
      setCreateModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (error) {
      message.error('创建用户失败');
    } finally {
      setLoading(false);
    }
  };

  const getCreditStatus = (creditScore) => {
    if (creditScore >= 80) return { color: '#52c41a', text: '良好' };
    if (creditScore >= 60) return { color: '#faad14', text: '一般' };
    return { color: '#ff4d4f', text: '较差' };
  };

  const getBookingStatusTag = (status) => {
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

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '课时余额',
      dataIndex: 'lessonBalance',
      key: 'lessonBalance',
      render: (val) => (
        <Tag color={val > 0 ? 'purple' : 'red'}>
          {val} 课时
        </Tag>
      ),
    },
    {
      title: '信用分',
      key: 'creditScore',
      render: (_, record) => {
        const status = getCreditStatus(record.creditScore);
        return (
          <Space>
            <Progress
              percent={record.creditScore}
              size="small"
              style={{ width: 100 }}
              strokeColor={status.color}
            />
            <Tag color={status.color === '#52c41a' ? 'green' : status.color === '#faad14' ? 'gold' : 'red'}>
              {status.text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: '爽约次数',
      dataIndex: 'noShowCount',
      key: 'noShowCount',
      render: (val) => (
        <Tag color={val >= 3 ? 'red' : val > 0 ? 'orange' : 'default'}>
          {val} 次
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.blacklisted ? (
            <Tag color="red">黑名单</Tag>
          ) : (
            <Tag color="green">正常</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewUserDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  const bookingColumns = [
    {
      title: '课程ID',
      dataIndex: 'classId',
      key: 'classId',
    },
    {
      title: '预约时间',
      key: 'bookedAt',
      render: (_, record) => dayjs(record.bookedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => getBookingStatusTag(record.status),
    },
    {
      title: '扣除课时',
      dataIndex: 'lessonsDeducted',
      key: 'lessonsDeducted',
      render: (val) => val || 0,
    },
  ];

  return (
    <div>
      <Card
        title="用户列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新增用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增用户"
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
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="lessonBalance"
            label="初始课时余额"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入初始课时余额" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="用户详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="用户ID">
                {selectedUser.id}
              </Descriptions.Item>
              <Descriptions.Item label="姓名">
                <strong>{selectedUser.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                {selectedUser.phone}
              </Descriptions.Item>
              <Descriptions.Item label="课时余额">
                <Tag color={selectedUser.lessonBalance > 0 ? 'purple' : 'red'}>
                  {selectedUser.lessonBalance} 课时
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="信用分">
                <Space>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: getCreditStatus(selectedUser.creditScore).color }}>
                    {selectedUser.creditScore}
                  </span>
                  <Tag color={getCreditStatus(selectedUser.creditScore).color === '#52c41a' ? 'green' : getCreditStatus(selectedUser.creditScore).color === '#faad14' ? 'gold' : 'red'}>
                    {getCreditStatus(selectedUser.creditScore).text}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="爽约次数">
                <Tag color={selectedUser.noShowCount >= 3 ? 'red' : selectedUser.noShowCount > 0 ? 'orange' : 'default'}>
                  {selectedUser.noShowCount} 次
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedUser.blacklisted ? (
                  <Tag color="red">黑名单</Tag>
                ) : (
                  <Tag color="green">正常</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {dayjs(selectedUser.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="预约记录" size="small" style={{ marginTop: 16 }}>
              {userBookings.length > 0 ? (
                <Table
                  columns={bookingColumns}
                  dataSource={userBookings}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              ) : (
                <p style={{ textAlign: 'center', color: '#999', margin: 0 }}>暂无预约记录</p>
              )}
            </Card>

            {userNoShows.length > 0 && (
              <Card title="爽约记录" size="small" style={{ marginTop: 16 }}>
                <Table
                  columns={[
                    { title: '记录ID', dataIndex: 'id', key: 'id' },
                    { title: '课程ID', dataIndex: 'classId', key: 'classId' },
                    { title: '记录时间', key: 'time', render: (_, r) => dayjs(r.recordedAt).format('YYYY-MM-DD HH:mm') },
                    { title: '扣除课时', dataIndex: 'lessonsDeducted', key: 'lessonsDeducted' },
                    { title: '原因', dataIndex: 'reason', key: 'reason' },
                  ]}
                  dataSource={userNoShows}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            )}

            <div style={{ marginTop: 16, padding: '12px', background: '#fff7e6', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#fa8c16', fontWeight: 'bold' }}>
                预约权限说明：
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#666' }}>
                <li>信用分 >= 60 分：可正常预约</li>
                <li>信用分低于60分：无法预约</li>
                <li>爽约次数 >= 3 次：无法预约</li>
                <li>黑名单用户：无法预约</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
