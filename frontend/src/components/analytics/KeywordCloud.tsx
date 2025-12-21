import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';

const { Text, Title } = Typography;

interface KeywordCloudProps {
  keywords: { text: string; count: number }[];
}

const KeywordCloud: React.FC<KeywordCloudProps> = ({ keywords }) => {
  // 빈도수에 따라 폰트 크기 계산
  const maxCount = Math.max(...keywords.map(k => k.count));
  const minSize = 14;
  const maxSize = 40;

  const getFontSize = (count: number) => {
    return minSize + ((count / maxCount) * (maxSize - minSize));
  };

  const getColor = (index: number) => {
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
      '#13c2c2', '#eb2f96', '#fa8c16', '#2f54eb', '#52c41a'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card title="키워드 분석">
      {/* 워드 클라우드 */}
      <div
        style={{
          padding: 40,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 8,
          minHeight: 400,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {keywords.map((keyword, index) => (
          <Text
            key={index}
            style={{
              fontSize: getFontSize(keyword.count),
              fontWeight: 'bold',
              color: getColor(index),
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.3s',
              padding: '4px 8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {keyword.text}
          </Text>
        ))}
      </div>

      {/* Top 20 키워드 리스트 */}
      <div style={{ marginTop: 24 }}>
        <Title level={5}>빈도수 Top 20</Title>
        <Space wrap>
          {keywords.slice(0, 20).map((keyword, index) => (
            <Tag key={index} color={getColor(index)}>
              {keyword.text} ({keyword.count})
            </Tag>
          ))}
        </Space>
      </div>
    </Card>
  );
};

export default KeywordCloud;