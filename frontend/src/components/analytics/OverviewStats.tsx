import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  DatabaseOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  CalendarOutlined 
} from '@ant-design/icons';

interface OverviewStatsProps {
  total: number;
  strategic: number;
  nonStrategic: number;
  currentYear: number;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({
  total,
  strategic,
  nonStrategic,
  currentYear
}) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="전체 건수"
            value={total}
            prefix={<DatabaseOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="전략물자"
            value={strategic}
            prefix={<WarningOutlined />}
            suffix={`(${((strategic / total) * 100).toFixed(1)}%)`}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="비전략물자"
            value={nonStrategic}
            prefix={<CheckCircleOutlined />}
            suffix={`(${((nonStrategic / total) * 100).toFixed(1)}%)`}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="올해 건수"
            value={currentYear}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewStats;