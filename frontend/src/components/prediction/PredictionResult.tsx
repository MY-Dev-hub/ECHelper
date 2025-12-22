import React from 'react';
import { Card, Descriptions, Tag, Progress, Empty, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExperimentOutlined } from '@ant-design/icons';

interface PredictionResultProps {
  result: {
    isStrategic: boolean;
    confidence: number;
    eccn: string;
    classType?: string;
    explanation: string;
  } | null;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  if (!result) {
    return (
      <Card>
        <Empty 
          description="좌측 폼에 정보를 입력하고 '예측 및 유사이력 검색'을 클릭하세요"
          image={Empty.PRESENTED_IMAGE_DEFAULT}
          style={{ padding: '60px 0' }}
        >
          <div style={{ marginTop: 16, color: '#999', fontSize: 13 }}>
            💡 TIP: Title과 Description을 자세히 입력할수록 정확한 결과를 얻을 수 있습니다
          </div>
        </Empty>
      </Card>
    );
  }

  return (
    <Card title="예측 결과">
      {/* 🔥 모델 정보 배너 */}
      <Alert
        message={
          <span>
            <ExperimentOutlined /> 현재 사용 중인 AI 모델
          </span>
        }
        description={
          <div style={{ fontSize: 12 }}>
            <strong>모델:</strong> LSTM (Long Short-Term Memory)<br/>
            <strong>학습 데이터:</strong> 2,300건<br/>
            <strong>테스트 정확도:</strong> 72%<br/>
            <em style={{ color: '#999' }}>
              * 더 높은 정확도를 위해 BERT 모델로 업그레이드 예정 (목표: 97%)
            </em>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 상단 요약 */}
      <div style={{ marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8 }}>
        <Space size="large">
          {/* 아이콘 - 작게 */}
          <div>
            {result.isStrategic ? (
              <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
            ) : (
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            )}
          </div>
          
          {/* 분류 결과 */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8 }}>
              <Tag color={result.isStrategic ? 'red' : 'green'} style={{ fontSize: 16, padding: '6px 16px' }}>
                {result.isStrategic ? '전략물자' : '비전략물자'}
              </Tag>
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              {result.isStrategic ? 'Strategic Item' : 'Non-Strategic Item'}
            </div>
          </div>
        </Space>
      </div>

      {/* 신뢰도 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>신뢰도 (Confidence):</div>
        <Progress 
          percent={parseFloat(result.confidence.toFixed(1))} 
          status={result.confidence > 70 ? 'success' : result.confidence > 40 ? 'normal' : 'exception'}
          strokeColor={result.confidence > 70 ? '#52c41a' : result.confidence > 40 ? '#1890ff' : '#ff4d4f'}
        />
      </div>

      {/* 상세 정보 */}
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="ECCN">
          <Tag color="blue" style={{ fontSize: 14 }}>{result.eccn}</Tag>
        </Descriptions.Item>

        {result.classType && (
          <Descriptions.Item label="Class">
            <Tag color="purple">{result.classType}</Tag>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="설명 (Explanation)">
          {result.explanation}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 4 }}>
        <div style={{ fontSize: 12, color: '#666' }}>
          ⚠️ 이 결과는 AI 모델의 예측이며 참고용입니다. 
          최종 판단은 전문가의 검토가 필요합니다.
        </div>
      </div>
    </Card>
  );
};

export default PredictionResult;