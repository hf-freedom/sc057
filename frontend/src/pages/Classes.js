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
  DatePicker,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Descriptions,
  Progress,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  BookOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { classApi, coachApi, bookingApi, checkInApi, waitlistApi } from '../api';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const Classes = ({ currentUser }) => {
  const [classes, setClasses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetail, setClassDetail] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadClasses();
    loadCoaches();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await classApi.getAll();
      setClasses(response.data || []);
    } catch (error) {
      message.error('加载课程失败');
    }
  };

  const loadCoaches = async () => {
    try {
      const response = await coachApi.getAll();
      setCoaches(response.data || []);
    } catch (error) {
      console.error('加载教练失败:', error);
    }
  };

  const viewClassDetail = async (classItem) => {
    try {
      setLoading(true);
      const [classRes, bookingsRes, checkInsRes, waitlistRes] = await Promise.all([
        classApi.getById(classItem.id),
        bookingApi.getByClass(classItem.id),
        checkInApi.getByClass(classItem.id),
        waitlistApi.getByClass(classItem.id),
      ]);
      setClassDetail(classRes.data);
      setBookings(bookingsRes.data || []);
      setCheckIns(checkInsRes.data || []);
      setWaitlist(waitlistRes.data || []);
      setSelectedClass(classItem);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取课程详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      setLoading(true);
      const classData = {
        name: values.name,
        coachId: values.coachId,
        startTime: values.timeRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        endTime: values.timeRange[1].format('YYYY-MM-DDTHH:mm:ss'),
        maxCapacity: values.maxCapacity,
        requiredLessons: values.requiredLessons,
        status: 'SCHEDULED',
      };
      await classApi.create(classData);
      message.success('创建课程成功');
      setCreateModalVisible(false);
      form.resetFields();
      loadClasses();
    } catch (error) {
      message.error('创建课程失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClass = async (classId, reason) => {
    try {
      setLoading(true);
      await classApi.cancel(classId, reason);
      message.success('取消课程成功，已通知所有预约用户并退还课时');
      setDetailModalVisible(false);
      loadClasses();
    } catch (error) {
      message.error('取消课程失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setLoading(true);
      await checkInApi.checkIn(bookingId, 'MANUAL');
      message.success('签到成功');
      if (selectedClass) {
        viewClassDetail(selectedClass);
      }
    } catch (error) {
      message.error(error.response?.data?.message || '签到失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      SCHEDULED: { color: 'blue', text: '已排课' },
      IN_PROGRESS: { color: 'green', text: '进行中' },
      COMPLETED: { color: 'default', text: '已完成' },
      CANCELLED: { color: 'red', text: '已取消' },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
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
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '教练',
      key: 'coach',
      render: (_, record) => {
        const coach = coaches.find(c => c.id === record.coachId);
        return (
          <Space>
            <UserOutlined />
            {coach?.name || `教练${record.coachId}`}
            {coach?.onLeave && <Tag color="orange">请假中</Tag>}
          </Space>
        );
      },
    },
    {
      title: '上课时间',
      key: 'time',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.startTime).format('YYYY-MM-DD HH:mm')}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            至 {dayjs(record.endTime).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '名额',
      key: 'capacity',
      render: (_, record) => {
        const bookedCount = bookings.filter(b => b.classId === record.id && b.status === 'BOOKED').length;
        const percent = (bookedCount / record.maxCapacity) * 100;
        return (
          <div style={{ width: 120 }}>
            <Progress
              percent={Math.round(percent)}
              size="small"
              status={percent >= 100 ? 'exception' : 'active'}
              format={() => `${bookedCount}/${record.maxCapacity}`}
            />
          </div>
        );
      },
    },
    {
      title: '所需课时',
      dataIndex: 'requiredLessons',
      key: 'requiredLessons',
      render: (val) => <Tag color="purple">{val} 课时</Tag>,
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewClassDetail(record)}
          >
            详情
          </Button>
          {record.status === 'SCHEDULED' && (
            <Popconfirm
              title="确定要取消该课程吗？"
              description="取消后将自动退还所有已预约用户的课时并发送通知"
              onConfirm={() => handleCancelClass(record.id, '管理员取消')}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                取消课程
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const bookingColumns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
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
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        if (record.status === 'BOOKED' && selectedClass?.status === 'SCHEDULED') {
          const now = dayjs();
          const startTime = dayjs(selectedClass.startTime);
          const canCheckIn = now.isAfter(startTime.subtract(30, 'minute')) && 
                             now.isBefore(startTime.add(15, 'minute'));
          
          if (canCheckIn) {
            return (
              <Button
                type="primary"
                size="small"
                onClick={() => handleCheckIn(record.id)}
              >
                签到
              </Button>
            );
          }
        }
        return null;
      },
    },
  ];

  return (
    <div>
      <Card
        title="课程列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新增课程
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={classes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增课程"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名称' }]}
          >
            <Input placeholder="例如：基础瑜伽" />
          </Form.Item>
          <Form.Item
            name="coachId"
            label="教练"
            rules={[{ required: true, message: '请选择教练' }]}
          >
            <Select placeholder="请选择教练">
              {coaches.map(coach => (
                <Select.Option key={coach.id} value={coach.id} disabled={coach.onLeave}>
                  {coach.name} ({coach.specialty})
                  {coach.onLeave && ' [请假中]'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="上课时间"
            rules={[{ required: true, message: '请选择上课时间' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>
          <Form.Item
            name="maxCapacity"
            label="最大人数"
            rules={[{ required: true, message: '请输入最大人数' }]}
            initialValue={10}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="requiredLessons"
            label="所需课时"
            rules={[{ required: true, message: '请输入所需课时' }]}
            initialValue={1}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
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
        title="课程详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {classDetail && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="课程名称">
                <strong>{classDetail.class?.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="教练">
                {classDetail.coach?.name}
              </Descriptions.Item>
              <Descriptions.Item label="上课时间">
                {dayjs(classDetail.class?.startTime).format('YYYY-MM-DD HH:mm')} - 
                {dayjs(classDetail.class?.endTime).format('HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="名额情况">
                <Space>
                  <span>{classDetail.bookedCount}/{classDetail.class?.maxCapacity} 人</span>
                  {classDetail.availableSlots > 0 ? (
                    <Badge status="success" text={`剩余 ${classDetail.availableSlots} 个名额`} />
                  ) : (
                    <Badge status="error" text="已满" />
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="所需课时">
                {classDetail.class?.requiredLessons} 课时
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(classDetail.class?.status)}
              </Descriptions.Item>
            </Descriptions>

            {classDetail.waitlistCount > 0 && (
              <Card title="候补队列" size="small" style={{ marginTop: 16 }}>
                <Table
                  columns={[
                    { title: '位置', dataIndex: 'position', key: 'position' },
                    { title: '用户ID', dataIndex: 'userId', key: 'userId' },
                    { title: '候补时间', key: 'time', render: (_, r) => dayjs(r.createdAt).format('YYYY-MM-DD HH:mm') },
                    { title: '状态', key: 'status', render: (_, r) => r.promoted ? <Tag color="green">已晋升</Tag> : <Tag color="orange">等待中</Tag> },
                  ]}
                  dataSource={waitlist}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            )}

            <Card title="预约记录" size="small" style={{ marginTop: 16 }}>
              <Table
                columns={bookingColumns}
                dataSource={bookings}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Classes;
