import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Descriptions,
} from 'antd';
import {
  DashboardOutlined,
  ScheduleOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  WarningOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { dashboardApi, classApi, bookingApi, userApi } from '../api';

const Dashboard = ({ currentUser }) => {
  const [stats, setStats] = useState({});
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetail, setClassDetail] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadClasses();
    loadBookings();
    loadUsers();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardApi.get();
      setStats(response.data);
    } catch (error) {
      console.error('加载仪表盘失败:', error);
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

  const loadBookings = async () => {
    try {
      const response = await bookingApi.getAll();
      setBookings(response.data || []);
    } catch (error) {
      console.error('加载预约失败:', error);
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

  const viewClassDetail = async (classItem) => {
    try {
      setLoading(true);
      const response = await classApi.getById(classItem.id);
      setClassDetail(response.data);
      setSelectedClass(classItem);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取课程详情失败');
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

  const classColumns = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
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
      title: '最大人数',
      dataIndex: 'maxCapacity',
      key: 'maxCapacity',
    },
    {
      title: '所需课时',
      dataIndex: 'requiredLessons',
      key: 'requiredLessons',
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
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewClassDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  const bookingColumns = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => {
        const user = users.find(u => u.id === record.userId);
        return user?.name || `用户${record.userId}`;
      },
    },
    {
      title: '课程',
      key: 'class',
      render: (_, record) => {
        const cls = classes.find(c => c.id === record.classId);
        return cls?.name || `课程${record.classId}`;
      },
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="课程总数"
              value={stats.totalClasses || 0}
              prefix={<ScheduleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.totalUsers || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="教练总数"
              value={stats.totalCoaches || 0}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃预约"
              value={stats.activeBookings || 0}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={16}>
          <Card title="近期课程">
            <Table
              columns={classColumns}
              dataSource={classes}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="爽约统计">
            <Statistic
              title="总爽约次数"
              value={stats.totalNoShows || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: '16px', padding: '12px', background: '#fff2f0', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#ff4d4f' }}>
                爽约规则：
              </p>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px', fontSize: '12px', color: '#666' }}>
                <li>未签到 = 爽约，扣除对应课时</li>
                <li>爽约1次，信用分-10</li>
                <li>爽约3次，加入黑名单</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="预约记录" style={{ marginTop: '16px' }}>
        <Table
          columns={bookingColumns}
          dataSource={bookings}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="课程详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {classDetail && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="课程名称">
              {classDetail.class?.name}
            </Descriptions.Item>
            <Descriptions.Item label="教练">
              {classDetail.coach?.name || `教练${classDetail.class?.coachId}`}
            </Descriptions.Item>
            <Descriptions.Item label="上课时间">
              {dayjs(classDetail.class?.startTime).format('YYYY-MM-DD HH:mm')} - 
              {dayjs(classDetail.class?.endTime).format('HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="最大人数">
              {classDetail.class?.maxCapacity} 人
            </Descriptions.Item>
            <Descriptions.Item label="已预约">
              <span style={{ color: classDetail.bookedCount >= classDetail.class?.maxCapacity ? '#ff4d4f' : '#52c41a' }}>
                {classDetail.bookedCount} 人
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="可用名额">
              <span style={{ color: classDetail.availableSlots > 0 ? '#52c41a' : '#ff4d4f' }}>
                {classDetail.availableSlots} 个
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="候补人数">
              {classDetail.waitlistCount} 人
            </Descriptions.Item>
            <Descriptions.Item label="所需课时">
              {classDetail.class?.requiredLessons} 课时
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(classDetail.class?.status)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
