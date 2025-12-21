import React from 'react';
import { Typography, Card, Row, Col, Form, Input, Button, Select, Divider } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('Settings saved:', values);
  };

  return (
    <div>
      <Title level={3}>Settings</Title>

      <Row gutter={[16, 16]}>
        {/* 모델 설정 */}
        <Col xs={24} lg={12}>
          <Card title="Deep Learning Model">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                modelType: 'BERT',
                modelPath: 'models/bert_multi.mat',
                threshold: 0.5,
              }}
            >
              <Form.Item label="Model Type" name="modelType">
                <Select>
                  <Select.Option value="BERT">BERT (Multilingual)</Select.Option>
                  <Select.Option value="LSTM">LSTM</Select.Option>
                  <Select.Option value="CNN">CNN</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Model Path" name="modelPath">
                <Input placeholder="models/bert_multi.mat" />
              </Form.Item>

              <Form.Item label="Classification Threshold" name="threshold">
                <Input type="number" step="0.1" min="0" max="1" />
              </Form.Item>

              <Divider />

              <Text type="secondary">
                현재 모델: BERT (Multilingual)<br />
                학습 데이터: 1,234건<br />
                정확도: 94.5%
              </Text>

              <div style={{ marginTop: 16 }}>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  설정 저장
                </Button>
                <Button icon={<ReloadOutlined />} style={{ marginLeft: 8 }}>
                  모델 재학습
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* 데이터베이스 설정 */}
        <Col xs={24} lg={12}>
          <Card title="Database Configuration">
            <Form
              layout="vertical"
              initialValues={{
                dbType: 'PostgreSQL',
                dbHost: 'localhost',
                dbPort: 5432,
                dbName: 'echelper',
              }}
            >
              <Form.Item label="Database Type" name="dbType">
                <Select>
                  <Select.Option value="PostgreSQL">PostgreSQL</Select.Option>
                  <Select.Option value="MySQL">MySQL</Select.Option>
                  <Select.Option value="SQLite">SQLite</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Host" name="dbHost">
                <Input placeholder="localhost" />
              </Form.Item>

              <Form.Item label="Port" name="dbPort">
                <Input type="number" placeholder="5432" />
              </Form.Item>

              <Form.Item label="Database Name" name="dbName">
                <Input placeholder="echelper" />
              </Form.Item>

              <Divider />

              <Text type="secondary">
                현재 연결 상태: <Text type="success">연결됨</Text><br />
                총 데이터: 1,234건<br />
                마지막 업데이트: 2024-12-18
              </Text>

              <div style={{ marginTop: 16 }}>
                <Button type="primary" icon={<SaveOutlined />}>
                  연결 설정 저장
                </Button>
                <Button style={{ marginLeft: 8 }}>
                  연결 테스트
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* API 설정 */}
        <Col xs={24} lg={12}>
          <Card title="API Configuration">
            <Form layout="vertical">
              <Form.Item label="Backend API URL">
                <Input defaultValue="http://localhost:8080/api" />
              </Form.Item>

              <Form.Item label="AI Service URL">
                <Input defaultValue="http://localhost:8000" />
              </Form.Item>

              <Form.Item label="Timeout (ms)">
                <Input type="number" defaultValue={30000} />
              </Form.Item>

              <div style={{ marginTop: 16 }}>
                <Button type="primary" icon={<SaveOutlined />}>
                  저장
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* 사용자 설정 */}
        <Col xs={24} lg={12}>
          <Card title="User Preferences">
            <Form layout="vertical">
              <Form.Item label="Language">
                <Select defaultValue="ko">
                  <Select.Option value="ko">한국어</Select.Option>
                  <Select.Option value="en">English</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Theme">
                <Select defaultValue="light">
                  <Select.Option value="light">Light</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Items per Page">
                <Select defaultValue={10}>
                  <Select.Option value={10}>10</Select.Option>
                  <Select.Option value={20}>20</Select.Option>
                  <Select.Option value={50}>50</Select.Option>
                  <Select.Option value={100}>100</Select.Option>
                </Select>
              </Form.Item>

              <div style={{ marginTop: 16 }}>
                <Button type="primary" icon={<SaveOutlined />}>
                  저장
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;