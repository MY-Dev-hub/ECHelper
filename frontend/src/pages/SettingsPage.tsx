import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Form, Input, Button, Select, Divider, Statistic, Descriptions, message } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ModelInfo {
  modelName: string;
  modelType: string;
  version: string;
  trainedDate: string;
  evaluatedDate: string;
  trainingData: {
    totalSamples: number;
    trainSamples: number;
    validationSamples: number;
    classes: {
      nonStrategic: number;
      strategic: number;
    };
  };
  performance: {
    overall: {
      accuracy: number;
      accuracyPercent: string;
    };
    nonStrategic: {
      precision: number;
      recall: number;
      f1Score: number;
      support: number;
    };
    strategic: {
      precision: number;
      recall: number;
      f1Score: number;
      support: number;
    };
    confusionMatrix: {
      trueNegatives: number;
      falsePositives: number;
      falseNegatives: number;
      truePositives: number;
      tnPercent: string;
      fpPercent: string;
      fnPercent: string;
      tpPercent: string;
    };
    metrics: {
      sensitivity: number;
      sensitivityPercent: string;
      specificity: number;
      specificityPercent: string;
    };
  };
  modelConfig: {
    maxLength: number;
    epochs: number;
    batchSize: number;
    learningRate: string;
    optimizer: string;
  };
  notes: string;
}

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load model info from JSON
    const loadModelInfo = async () => {
      try {
        const response = await fetch('/models/kobert-onnx/model_info.json');
        if (response.ok) {
          const data = await response.json();
          setModelInfo(data);
        } else {
          message.warning('모델 정보를 불러올 수 없습니다.');
        }
      } catch (error) {
        console.error('Failed to load model info:', error);
        message.error('모델 정보 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadModelInfo();
  }, []);

  const handleSave = (values: any) => {
    try {
      // Save threshold to localStorage
      localStorage.setItem('echelper_threshold', values.threshold.toString());
      localStorage.setItem('echelper_model', values.modelType);

      message.success(`설정이 저장되었습니다. (임계값: ${values.threshold})`);
      console.log('Settings saved:', values);
    } catch (error) {
      message.error('설정 저장 중 오류가 발생했습니다.');
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div>
      <Title level={3}>Settings</Title>

      <Row gutter={[16, 16]}>
        {/* 모델 설정 */}
        <Col xs={24}>
          <Card title="모델 설정">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  initialValues={{
                    modelType: 'KoBERT',
                    threshold: parseFloat(localStorage.getItem('echelper_threshold') || '0.5'),
                  }}
                >
                  <Form.Item label="모델 선택" name="modelType">
                    <Select>
                      <Select.Option value="KoBERT">KoBERT (한국어 전략물자 분류)</Select.Option>
                      <Select.Option value="BERT" disabled>BERT (Multilingual) - 준비중</Select.Option>
                      <Select.Option value="LSTM" disabled>LSTM - 준비중</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="분류 임계값 (Threshold)"
                    name="threshold"
                    help="낮을수록 전략물자를 민감하게 탐지 (권장: 0.3-0.5)"
                  >
                    <Input type="number" step="0.05" min="0" max="1" />
                  </Form.Item>

                  <div style={{ marginTop: 16 }}>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                      설정 저장
                    </Button>
                  </div>
                </Form>
              </Col>

              <Col xs={24} md={12}>
                <Divider orientation="left">현재 모델 정보</Divider>
                {loading ? (
                  <Text type="secondary">모델 정보 로딩 중...</Text>
                ) : modelInfo ? (
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="모델">
                      {modelInfo.modelType}
                    </Descriptions.Item>
                    <Descriptions.Item label="버전">
                      {modelInfo.version}
                    </Descriptions.Item>
                    <Descriptions.Item label="학습 데이터">
                      {modelInfo.trainingData.totalSamples}건
                    </Descriptions.Item>
                    <Descriptions.Item label="정확도">
                      <Text strong style={{ color: '#3f8600' }}>
                        {modelInfo.performance.overall.accuracyPercent}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="마지막 평가">
                      {modelInfo.evaluatedDate}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Text type="secondary">모델 정보를 불러올 수 없습니다.</Text>
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 모델 성능 상세 정보 */}
        {modelInfo && (
          <Col xs={24}>
            <Card title="모델 성능 상세 정보" style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Statistic
                    title="전체 정확도"
                    value={modelInfo.performance.overall.accuracyPercent}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Sensitivity (전략물자 탐지율)"
                    value={modelInfo.performance.metrics.sensitivityPercent}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Specificity (비전략물자 식별률)"
                    value={modelInfo.performance.metrics.specificityPercent}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>

              <Divider orientation="left">클래스별 성능</Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card type="inner" title="비전략물자 (Non-Strategic)">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Precision">
                        {(modelInfo.performance.nonStrategic.precision * 100).toFixed(2)}%
                      </Descriptions.Item>
                      <Descriptions.Item label="Recall">
                        {(modelInfo.performance.nonStrategic.recall * 100).toFixed(2)}%
                      </Descriptions.Item>
                      <Descriptions.Item label="F1-Score">
                        {(modelInfo.performance.nonStrategic.f1Score * 100).toFixed(2)}%
                      </Descriptions.Item>
                      <Descriptions.Item label="Support">
                        {modelInfo.performance.nonStrategic.support} 샘플
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card type="inner" title="전략물자 (Strategic)">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Precision">
                        {(modelInfo.performance.strategic.precision * 100).toFixed(2)}%
                      </Descriptions.Item>
                      <Descriptions.Item label="Recall">
                        {(modelInfo.performance.strategic.recall * 100).toFixed(2)}%
                      </Descriptions.Item>
                      <Descriptions.Item label="F1-Score">
                        {(modelInfo.performance.strategic.f1Score * 100).toFixed(2)}%
                      </Descriptions.Item>
                      <Descriptions.Item label="Support">
                        {modelInfo.performance.strategic.support} 샘플
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">혼동 행렬 (Confusion Matrix)</Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card type="inner" title="정분류">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="True Negatives (TN)">
                        {modelInfo.performance.confusionMatrix.trueNegatives} ({modelInfo.performance.confusionMatrix.tnPercent})
                      </Descriptions.Item>
                      <Descriptions.Item label="True Positives (TP)">
                        {modelInfo.performance.confusionMatrix.truePositives} ({modelInfo.performance.confusionMatrix.tpPercent})
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card type="inner" title="오분류">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="False Positives (FP)">
                        {modelInfo.performance.confusionMatrix.falsePositives} ({modelInfo.performance.confusionMatrix.fpPercent})
                      </Descriptions.Item>
                      <Descriptions.Item label="False Negatives (FN)">
                        {modelInfo.performance.confusionMatrix.falseNegatives} ({modelInfo.performance.confusionMatrix.fnPercent})
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left">학습 데이터</Divider>

              <Descriptions column={2} size="small">
                <Descriptions.Item label="전체 샘플">
                  {modelInfo.trainingData.totalSamples}
                </Descriptions.Item>
                <Descriptions.Item label="학습 샘플">
                  {modelInfo.trainingData.trainSamples}
                </Descriptions.Item>
                <Descriptions.Item label="검증 샘플">
                  {modelInfo.trainingData.validationSamples}
                </Descriptions.Item>
                <Descriptions.Item label="비전략물자">
                  {modelInfo.trainingData.classes.nonStrategic}
                </Descriptions.Item>
                <Descriptions.Item label="전략물자">
                  {modelInfo.trainingData.classes.strategic}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">모델 설정</Divider>

              <Descriptions column={2} size="small">
                <Descriptions.Item label="Max Length">
                  {modelInfo.modelConfig.maxLength}
                </Descriptions.Item>
                <Descriptions.Item label="Epochs">
                  {modelInfo.modelConfig.epochs}
                </Descriptions.Item>
                <Descriptions.Item label="Batch Size">
                  {modelInfo.modelConfig.batchSize}
                </Descriptions.Item>
                <Descriptions.Item label="Learning Rate">
                  {modelInfo.modelConfig.learningRate}
                </Descriptions.Item>
                <Descriptions.Item label="Optimizer">
                  {modelInfo.modelConfig.optimizer}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Text type="secondary" italic>
                {modelInfo.notes}
              </Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default SettingsPage;