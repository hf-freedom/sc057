import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  DatePicker,
  message,
  Descriptions,
  Popconfirm,
} from 'antd';
import {
  EyeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { coachApi, classApi } from '../api';

const { RangePicker } = DatePicker;

const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCoaches();
    loadClasses();
  }, []);

  const loadCoaches = async () => {
    try {
      const response = await coachApi.getAll();
      setCoaches(response.data || []);
    } catch (error) {
      message.error('加载教练失败');
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

  const handleSetLeave = async (values) => {
    if (!selectedCoach) return;
    
    try {
      setLoading(true);
      const leaveStart = values.leaveRange[0].toISOString();
      const leaveEnd = values.leaveRange[1].toISOString();
      
      await coachApi.setOnLeave(selectedCoach.id, leaveStart, leaveEnd);
      message.success('已标记教练请假，系统已自动处理期间课程');
      setLeaveModalVisible(false);
      form.resetFields();
      loadCoaches();
      loadClasses();
    } catch (error) {
      message.error(error.response?.data?.message || '设置请假失败');
    } finally {
      setLoading(false);
    }
  };

  const openLeaveModal = (coach) => {
    setSelectedCoach(coach);
    setLeaveModalVisible(true);
  };

  const getCoachClasses = (coachId) => {
    return classes.filter(c => c.coachId === coachId);
  };

  const columns = [
    {
      title: '教练ID',
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
      title: '专长',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: '带课数量',
      key: 'classCount',
      render: (_, record) => {
        const coachClasses = getCoachClasses(record.id);
        const scheduledCount = coachClasses.filter(c => c.status === 'SCHEDULED').length;
        return (
          <Space>
            <Tag color="blue">共 {coachClasses.length} 节</Tag>
            {scheduledCount > 0 && <Tag color="green">待上课 {scheduledCount} 节</Tag>}
          </Space>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.onLeave ? (
            <Tag color="orange">请假中</Tag>
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
        <Space>
          {!record.onLeave && (
            <Button
              type="link"
              icon={<CalendarOutlined />}
              onClick={() => openLeaveModal(record)}
            >
              请假
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="教练列表">
        <Table
          columns={columns}
          dataSource={coaches}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => {
              const coachClasses = getCoachClasses(record.id);
              return (
                <div style={{ padding: '0 24px' }}>
                  <h4 style={{ marginBottom: 8 }}>课程列表</h4>
                  {coachClasses.length > 0 ? (
                    <Table
                      columns={[
                        { title: '课程名称', dataIndex: 'name', key: 'name' },
                        { 
                          title: '上课时间', 
                          key: 'time',
                          render: (_, r) => (
                            <div>
                              <div>{dayjs(r.startTime).format('YYYY-MM-DD HH:mm')}</div>
                              <div style={{ fontSize: '12px', color: '#999' }}>
                                至 {dayjs(r.endTime).format('HH:mm')}
                              </div>
                            </div>
                          )
                        },
                        { title: '最大人数', dataIndex: 'maxCapacity', key: 'maxCapacity' },
                        { title: '所需课时', dataIndex: 'requiredLessons', key: 'requiredLessons' },
                        { 
                          title: '状态', 
                          key: 'status',
                          render: (_, r) => {
                            const statusMap = {
                              SCHEDULED: { color: 'blue', text: '已排课' },
                              IN_PROGRESS: { color: 'green', text: '进行中' },
                              COMPLETED: { color: 'default', text: '已完成' },
                              CANCELLED: { color: 'red', text: '已取消' },
                            };
                            const info = statusMap[r.status] || { color: 'default', text: r.status };
                            return <Tag color={info.color}>{info.text}</Tag>;
                          }
                        },
                      ]}
                      dataSource={coachClasses}
                      rowKey="id"
                      size="small"
                      pagination={false}
                    />
                  ) : (
                    <p style={{ color: '#999' }}>暂无课程</p>
                  )}
                </div>
              );
            },
          }}
        />
      </Card>

      <Card title="请假规则说明" style={{ marginTop: 16 }}>
        <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#52c41a' }}>教练请假处理规则：</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>系统会自动查找请假期间的所有已排课程</li>
            <li>优先尝试更换其他可用教练（未请假的教练）</li>
            <li>如果没有可用的替代教练，则取消该课程</li>
            <li>课程取消时，会自动退还所有已预约用户的课时</li>
            <li>系统会向所有受影响的用户发送通知</li>
          </ul>
        </div>
      </Card>

      <Modal
        title="设置请假"
        open={leaveModalVisible}
        onCancel={() => setLeaveModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedCoach && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="教练">
                {selectedCoach.name}
              </Descriptions.Item>
              <Descriptions.Item label="专长">
                {selectedCoach.specialty}
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSetLeave}
            >
              <Form.Item
                name="leaveRange"
                label="请假时间范围"
                rules={[{ required: true, message: '请选择请假时间范围' }]}
                extra="系统将自动处理此时间段内的所有课程"
              >
                <RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <div style={{ padding: '12px', background: '#fff7e6', borderRadius: '4px', marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#fa8c16' }}>
                  ⚠️ 请假将影响期间所有已排课程。系统会尝试更换教练，如无可用教练则取消课程。
                </p>
              </div>

              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => setLeaveModalVisible(false)}>取消</Button>
                  <Button type="primary" htmlType="submit" loading={loading} danger>
                    确认请假
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Coaches;
