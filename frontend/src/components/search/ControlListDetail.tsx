import React from 'react';
import { Card, Typography, Empty, Divider } from 'antd';

const { Title, Paragraph, Text } = Typography;

interface ControlListItem {
  id: number;
  eccn: string;
  refClNo: string;
  refNo: string;
  title: string;
  description: string;
  note: string;
  techInfo: string;
  keywordKor: string;
  keywordEng: string;
  category: string;
}

interface ControlListDetailProps {
  item: ControlListItem | null;
}

const ControlListDetail: React.FC<ControlListDetailProps> = ({ item }) => {
  if (!item) {
    return (
      <Card title="Detailed Description">
        <Empty description="항목을 선택하세요" />
      </Card>
    );
  }

  return (
    <Card title="Detailed Description">
      {/* ECCN */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ color: '#1890ff', marginBottom: 8 }}>
          {item.eccn}
        </Title>
        {item.title && (
          <Text strong style={{ fontSize: 16 }}>{item.title}</Text>
        )}
      </div>

      {/* Description */}
      {item.description && item.description !== 'unknown' && (
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ color: '#ff6b35' }}>Description</Text>
          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: '#f0f5ff',
              borderRadius: 4,
            }}
          >
            <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {item.description}
            </Paragraph>
          </div>
        </div>
      )}

      {/* Notes */}
      {item.note && item.note !== 'unknown' && (
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ color: '#ff6b35' }}>Notes</Text>
          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: '#fff7e6',
              borderRadius: 4,
            }}
          >
            <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {item.note}
            </Paragraph>
          </div>
        </div>
      )}

      {/* Technical Information */}
      {item.techInfo && item.techInfo !== 'unknown' && (
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ color: '#ff6b35' }}>Technical Explanation</Text>
          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: '#f6ffed',
              borderRadius: 4,
            }}
          >
            <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {item.techInfo}
            </Paragraph>
          </div>
        </div>
      )}

      <Divider />

      {/* Keywords */}
      <div>
        <Text strong>Keywords: </Text>
        <div style={{ marginTop: 8 }}>
          {item.keywordKor && item.keywordKor !== 'unknown' && (
            <Paragraph>
              <Text type="secondary">한국어:</Text> {item.keywordKor}
            </Paragraph>
          )}
          {item.keywordEng && item.keywordEng !== 'unknown' && (
            <Paragraph>
              <Text type="secondary">English:</Text> {item.keywordEng}
            </Paragraph>
          )}
        </div>
      </div>

      {/* Reference */}
      {(item.refClNo || item.refNo) && (
        <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Ref CL No: {item.refClNo || 'N/A'} | Ref No: {item.refNo || 'N/A'}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ControlListDetail;