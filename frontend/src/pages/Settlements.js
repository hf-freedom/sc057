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
  Descriptions,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { settlementApi, coachApi } from '../api';

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSettlements();
    loadCoaches();
  }, []);

  const loadSettlements = async () => {
    try {
      const response = await settlementApi.getAll();
      setSettlements(response.data || []);
    } catch (error) {
      message.error('加载结算单失败');
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

  const handleGenerate = async (values) => {
    try {
      setLoading(true);
      const result = await settlementApi.generate(values.year, values.month);
      if (result.data?.success) {
        message.success(result.data.message);
        setGenerateModalVisible(false);
        form.resetFields();
        loadSettlements();
      } else {
        message.error(result.data?.message || '生成失败');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (id) => {
    try {
      setLoading(true);
      const result = await settlementApi.pay(id);
      if (result.data?.success) {
        message.success('支付成功');
        loadSettlements();
      } else {
        message.error(result.data?.message || '支付失败');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '支付失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: 'orange', text: '待支付' },
      PAID: { color: 'green', text: '已支付' },
      CANCELLED: { color: 'default', text: '已取消' },
    };
    const info = statusMap[status] || { color: 'default', text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const totalPending = settlements.filter(s => s.status === 'PENDING')
    .reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0);

  const columns = [
    {
      title: '结算单ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '教练',
      key: 'coach',
      render: (_, record) => {
      const coach = coaches.find(c => c.id === record.coachId);
      return coach?.name || `教练${record.coachId}`;
    },
  },
    {
      title: '结算月份',
      key: 'month',
      render: (_, record) => {
      const month = record.settlementMonth;
      if (month && month.year && month.month) {
        return `${month.year}年${month.month}月`;
      }
      return '-';
    },
  },
    {
      title: '上课节数',
      dataIndex: 'totalClasses',
      key: 'totalClasses',
      render: (val) => <Tag color="blue">{val} 节</Tag>,
    },
    {
      title: '签到人数',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      render: (val) => <Tag color="purple">{val} 人</Tag>,
    },
    {
      title: '结算金额',
      key: 'amount',
      render: (_, record) => (
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
          ¥ {record.totalAmount?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '生成时间',
      key: 'createdAt',
      render: (_, record) => dayjs(record.createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePay(record.id)}
            >
              确认支付
            </Button>
          )}
          {record.status === 'PAID' && record.paidAt && (
            <span style={{ fontSize: '12px', color: '#999' }}>
              支付时间: {dayjs(record.paidAt).format('MM-DD HH:mm')}
            </span>
          )}
        </Space>
      ),
    },
  ];

  const currentYear = dayjs().year();
  const yearOptions = [
    { value: currentYear - 1, label: `${currentYear - 1}年` },
    { value: currentYear, label: `${currentYear}年` },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
    value: m,
    label: `${m}月`,
  }));

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总结算单数"
              value={settlements.length}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="待支付金额"
              value={totalPending.toFixed(2)}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已支付单数"
              value={settlements.filter(s => s.status === 'PAID').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="结算单列表"
        style={{ marginTop: 16 }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setGenerateModalVisible(true)}
          >
            生成结算单
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={settlements}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card title="结算规则说明" style={{ marginTop: 16 }}>
        <div style={{ padding: '16px', background: '#f6ffed', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#52c41a' }}>结算规则：</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>系统每月1日凌晨1点自动生成上月的结算单</li>
            <li>结算范围：上月所有已完成的课程</li>
            <li>结算金额 = 签到人数 × 50元/人</li>
            <li>仅统计已签到的学员，爽约学员不计入结算</li>
            <li>可手动生成指定月份的结算单</li>
          </ul>
        </div>
      </Card>

      <Modal
        title="生成结算单"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          initialValues={{
            year: currentYear,
            month: dayjs().subtract(1, 'month').month() + 1,
          }}
        >
          <Form.Item
            name="year"
            label="年份"
            rules={[{ required: true, message: '请选择年份' }]}
          >
            <Select options={yearOptions} placeholder="请选择年份" />
          </Form.Item>
          <Form.Item
            name="month"
            label="月份"
            rules={[{ required: true, message: '请选择月份' }]}
          >
            <Select options={monthOptions} placeholder="请选择月份" />
          </Form.Item>

          <div style={{ padding: '12px', background: '#e6f7ff', borderRadius: '4px', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#1890ff' }}>
              💡 系统将计算该月份内所有已完成课程的签到人数，按50元/人计算结算金额。
            </p>
          </div>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setGenerateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                生成结算单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settlements;
