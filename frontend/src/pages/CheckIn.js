import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Statistic,
  Row,
  Col,
  Tabs,
  Badge,
  Empty,
  Timeline,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { classApi, userApi, bookingApi, checkInApi } from '../api';

const { TabPane } = Tabs;

const CheckInPage = () => {
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadClasses();
    loadUsers();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await classApi.getAll();
      setClasses(response.data || []);
    } catch (error) {
      message.error('加载课程失败');
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

  const loadClassBookings = async (classId) => {
    try {
      setLoading(true);
      const [bookingsRes, checkInsRes] = await Promise.all([
        bookingApi.getByClass(classId),
        checkInApi.getByClass(classId),
      ]);
      setBookings(bookingsRes.data || []);
      setCheckIns(checkInsRes.data || []);
    } catch (error) {
      message.error('加载预约记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = async (classItem) => {
    setSelectedClass(classItem);
    await loadClassBookings(classItem.id);
  };

  const getCheckInTimeInfo = (classItem) => {
    const now = dayjs();
    const startTime = dayjs(classItem.startTime);
    const endTime = dayjs(classItem.endTime);
    
    const timeToStart = startTime.diff(now, 'minute');
    const timeSinceStart = now.diff(startTime, 'minute');
    const isEnded = now.isAfter(endTime);
    
    if (isEnded) {
      return {
        status: 'ended',
        text: '已结束',
        canCheckIn: false,
        color: 'default',
      };
    }
    
    if (timeToStart > 30) {
      return {
        status: 'before',
        text: `还有 ${timeToStart} 分钟后开始`,
        canCheckIn: false,
        color: 'blue',
      };
    }
    
    if (timeToStart > 0 && timeToStart <= 30) {
      return {
        status: 'checkin-soon',
        text: `即将开始，可签到 (${timeToStart} 分钟后开课)`,
        canCheckIn: true,
        color: 'green',
      };
    }
    
    if (timeSinceStart >= 0 && timeSinceStart <= 15) {
      return {
        status: 'checking-in',
        text: `签到中 (已开课 ${timeSinceStart} 分钟)`,
        canCheckIn: true,
        color: 'green',
      };
    }
    
    if (timeSinceStart > 15) {
      return {
        status: 'late',
        text: `已开课 ${timeSinceStart} 分钟，仍可签到`,
        canCheckIn: true,
        color: 'orange',
      };
    }
    
    return {
      status: 'unknown',
      text: '未知状态',
      canCheckIn: false,
      color: 'default',
    };
  };

  const handleCheckIn = async (booking) => {
    setSelectedBooking(booking);
    setCheckInModalVisible(true);
  };

  const confirmCheckIn = async () => {
    if (!selectedBooking) return;
    
    try {
      setLoading(true);
      const result = await checkInApi.checkIn(selectedBooking.id, 'MANUAL');
      if (result.data?.success) {
        message.success(result.data.message);
        setCheckInModalVisible(false);
        if (selectedClass) {
          await loadClassBookings(selectedClass.id);
        }
      } else {
        message.error(result.data?.message || '签到失败');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '签到失败');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.name || `用户${userId}`;
  };

  const getCheckedInBookings = () => {
    const checkedInIds = checkIns.map(c => c.bookingId);
    return bookings.filter(b => checkedInIds.includes(b.id) || b.status === 'CHECKED_IN');
  };

  const getPendingBookings = () => {
    const checkedInIds = checkIns.map(c => c.bookingId);
    return bookings.filter(b => 
      b.status === 'BOOKED' && !checkedInIds.includes(b.id)
    );
  };

  const getWaitlistBookings = () => {
    return bookings.filter(b => b.status === 'WAITLIST');
  };

  const getCancelledBookings = () => {
    return bookings.filter(b => 
      b.status === 'CANCELLED' || b.status === 'NO_SHOW'
    );
  };

  const upcomingClasses = classes.filter(c => 
    c.status === 'SCHEDULED' && dayjs().isBefore(dayjs(c.endTime))
  ).sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());

  const todayClasses = classes.filter(c => {
    const start = dayjs(c.startTime);
    return start.isSame(dayjs(), 'day');
  });

  const checkedInCount = selectedClass ? getCheckedInBookings().length : 0;
  const pendingCount = selectedClass ? getPendingBookings().length : 0;
  const waitlistCount = selectedClass ? getWaitlistBookings().length : 0;

  const bookingColumns = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{getUserName(record.userId)}</span>
        </Space>
      ),
    },
    {
      title: '预约时间',
      key: 'bookedAt',
      render: (_, record) => dayjs(record.bookedAt).format('MM-DD HH:mm'),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const checkedIn = checkIns.some(c => c.bookingId === record.id);
        if (checkedIn || record.status === 'CHECKED_IN') {
          return <Tag color="green">已签到</Tag>;
        }
        if (record.status === 'BOOKED') {
          return <Tag color="blue">已预约</Tag>;
        }
        if (record.status === 'WAITLIST') {
          return <Tag color="orange">候补中</Tag>;
        }
        if (record.status === 'CANCELLED') {
          return <Tag color="default">已取消</Tag>;
        }
        if (record.status === 'NO_SHOW') {
          return <Tag color="red">爽约</Tag>;
        }
        return <Tag>{record.status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const checkedIn = checkIns.some(c => c.bookingId === record.id);
        const timeInfo = selectedClass ? getCheckInTimeInfo(selectedClass) : null;
        const canCheckIn = timeInfo?.canCheckIn && 
                          record.status === 'BOOKED' && 
                          !checkedIn;
        
        if (canCheckIn) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCheckIn(record)}
            >
              签到
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const classListColumns = [
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '时间',
      key: 'time',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.startTime).format('MM-DD HH:mm')}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            至 {dayjs(record.endTime).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'checkinStatus',
      render: (_, record) => {
        const info = getCheckInTimeInfo(record);
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const info = getCheckInTimeInfo(record);
        return (
          <Space>
            <Button
              type={info.canCheckIn ? 'primary' : 'default'}
              size="small"
              onClick={() => handleSelectClass(record)}
            >
              查看签到
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="今日课程"
              value={todayClasses.length}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="即将开始"
              value={upcomingClasses.filter(c => dayjs().isBefore(dayjs(c.startTime))).length}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="签到进行中"
              value={upcomingClasses.filter(c => getCheckInTimeInfo(c).canCheckIn).length}
              prefix={<CheckCircleOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={selectedClass ? 10 : 24}>
          <Card title="课程列表">
            {upcomingClasses.length > 0 ? (
              <Table
                columns={classListColumns}
                dataSource={upcomingClasses}
                rowKey="id"
                size="small"
                pagination={false}
                onRow={(record) => ({
                  onClick: () => handleSelectClass(record),
                  style: { cursor: 'pointer' },
                })}
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: selectedClass ? [selectedClass.id] : [],
                  onChange: (keys) => {
                    const cls = upcomingClasses.find(c => c.id === keys[0]);
                    if (cls) handleSelectClass(cls);
                  },
                }}
              />
            ) : (
              <Empty description="暂无即将开始的课程" />
            )}
          </Card>
        </Col>

        {selectedClass && (
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <span>{selectedClass.name}</span>
                  <Tag color={getCheckInTimeInfo(selectedClass).color}>
                    {getCheckInTimeInfo(selectedClass).text}
                  </Tag>
                </Space>
              }
              extra={
                <Space>
                  <Badge count={checkedInCount} showZero color="#52c41a" />
                  <span style={{ color: '#52c41a' }}>已签到</span>
                  <Badge count={pendingCount} showZero color="#1890ff" />
                  <span style={{ color: '#1890ff' }}>待签到</span>
                  {waitlistCount > 0 && (
                    <>
                      <Badge count={waitlistCount} color="#fa8c16" />
                      <span style={{ color: '#fa8c16' }}>候补</span>
                    </>
                  )}
                </Space>
              }
            >
              <Tabs defaultActiveKey="pending">
                <TabPane
                  tab={
                    <span>
                      待签到
                      <Badge
                        count={pendingCount}
                        style={{ marginLeft: 8 }}
                        color="#1890ff"
                      />
                    </span>
                  }
                  key="pending"
                >
                  {getPendingBookings().length > 0 ? (
                    <Table
                      columns={bookingColumns}
                      dataSource={getPendingBookings()}
                      rowKey="id"
                      size="small"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="暂无待签到用户" />
                  )}
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      已签到
                      <Badge
                        count={checkedInCount}
                        style={{ marginLeft: 8 }}
                        color="#52c41a"
                      />
                    </span>
                  }
                  key="checkedIn"
                >
                  {getCheckedInBookings().length > 0 ? (
                    <Timeline mode="left">
                      {checkIns.map(record => (
                        <Timeline.Item
                          key={record.id}
                          color="green"
                          dot={<CheckCircleOutlined />}
                        >
                          <Space>
                            <UserOutlined />
                            <strong>{getUserName(record.userId)}</strong>
                            <Tag color="green">已签到</Tag>
                          </Space>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            签到时间: {dayjs(record.checkInTime).format('HH:mm:ss')}
                            {record.lessonsDeducted && (
                              <span style={{ marginLeft: 16 }}>
                                扣除课时: {record.lessonsDeducted}
                              </span>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <Empty description="暂无签到记录" />
                  )}
                </TabPane>

                {getWaitlistBookings().length > 0 && (
                  <TabPane
                    tab={
                      <span>
                        候补
                        <Badge
                          count={waitlistCount}
                          style={{ marginLeft: 8 }}
                          color="#fa8c16"
                        />
                      </span>
                    }
                    key="waitlist"
                  >
                    <Table
                      columns={[
                        {
                          title: '用户',
                          key: 'user',
                          render: (_, record) => getUserName(record.userId),
                        },
                        {
                          title: '预约时间',
                          key: 'bookedAt',
                          render: (_, record) => dayjs(record.bookedAt).format('MM-DD HH:mm'),
                        },
                        {
                          title: '状态',
                          key: 'status',
                          render: () => <Tag color="orange">候补中</Tag>,
                        },
                      ]}
                      dataSource={getWaitlistBookings()}
                      rowKey="id"
                      size="small"
                      pagination={false}
                    />
                  </TabPane>
                )}

                {getCancelledBookings().length > 0 && (
                  <TabPane
                    tab={
                      <span>
                        已取消/爽约
                        <Badge
                          count={getCancelledBookings().length}
                          style={{ marginLeft: 8 }}
                          color="#ff4d4f"
                        />
                      </span>
                    }
                    key="cancelled"
                  >
                    <Timeline mode="left">
                      {getCancelledBookings().map(record => (
                        <Timeline.Item
                          key={record.id}
                          color={record.status === 'NO_SHOW' ? 'red' : 'gray'}
                          dot={record.status === 'NO_SHOW' ? <WarningOutlined /> : undefined}
                        >
                          <Space>
                            <UserOutlined />
                            <strong>{getUserName(record.userId)}</strong>
                            {record.status === 'NO_SHOW' ? (
                              <Tag color="red">爽约</Tag>
                            ) : (
                              <Tag color="default">已取消</Tag>
                            )}
                          </Space>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {record.cancelledAt
                              ? `取消时间: ${dayjs(record.cancelledAt).format('MM-DD HH:mm')}`
                              : `预约时间: ${dayjs(record.bookedAt).format('MM-DD HH:mm')}`
                            }
                            {record.lessonsDeducted > 0 && (
                              <span style={{ marginLeft: 16, color: '#ff4d4f' }}>
                                已扣除: {record.lessonsDeducted} 课时
                              </span>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </TabPane>
                )}
              </Tabs>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title="确认签到"
        open={checkInModalVisible}
        onCancel={() => setCheckInModalVisible(false)}
        footer={null}
        width={400}
      >
        {selectedBooking && selectedClass && (
          <div>
            <div style={{ padding: '16px', background: '#e6f7ff', borderRadius: '8px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>用户:</strong> {getUserName(selectedBooking.userId)}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>课程:</strong> {selectedClass.name}
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>上课时间:</strong> {dayjs(selectedClass.startTime).format('YYYY-MM-DD HH:mm')}
              </p>
              <p style={{ margin: 0, color: '#1890ff', fontWeight: 'bold' }}>
                <strong>签到将扣除:</strong> {selectedClass.requiredLessons} 课时
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setCheckInModalVisible(false)}>
                  取消
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={confirmCheckIn}
                  loading={loading}
                >
                  确认签到
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CheckInPage;
