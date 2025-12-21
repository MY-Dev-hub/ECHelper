import React from 'react';
import { Card, Typography, Empty, Tag, Space, Button, Divider } from 'antd';
import { StarOutlined, StarFilled, LinkOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface ECCNDetailPanelProps {
  item: any;
  onBookmark?: (eccn: string) => void;
  isBookmarked?: boolean;
  relatedItems?: any[];
}

const ECCNDetailPanel: React.FC<ECCNDetailPanelProps> = ({ 
  item, 
  onBookmark, 
  isBookmarked = false,
  relatedItems = []
}) => {
  if (!item) {
    return (
      <Card>
        <Empty 
          description="좌측 트리에서 항목을 선택하세요" 
          style={{ padding: '60px 0' }}
        />
      </Card>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ marginBottom: 8, color: '#1890ff' }}>
              {item.eccn}
            </Title>
            {item.title && (
              <Title level={5} style={{ marginTop: 0, fontWeight: 'normal' }}>
                {item.title}
              </Title>
            )}
          </div>
          <Space>
            <Button 
              icon={isBookmarked ? <StarFilled /> : <StarOutlined />}
              onClick={() => onBookmark && onBookmark(item.eccn)}
            >
              {isBookmarked ? '즐겨찾기됨' : '즐겨찾기'}
            </Button>
            <Button icon={<DownloadOutlined />}>
              PDF
            </Button>
          </Space>
        </div>

        {/* 메타 정보 */}
        <div style={{ marginTop: 16 }}>
          <Space wrap>
            <Tag color="blue">레벨 {item.level}</Tag>
            <Tag color="green">{item.mainCategory} 카테고리</Tag>
            <Tag color="orange">{item.subCategory}</Tag>
            {item.refClNo && <Tag>{item.refClNo}</Tag>}
          </Space>
        </div>
      </Card>

      {/* Description */}
      {item.description && item.description !== 'unknown' && (
        <Card title="📋 Description" style={{ marginTop: 16 }}>
          <div style={{ 
            padding: 16, 
            background: '#f0f5ff', 
            borderRadius: 4,
            whiteSpace: 'pre-wrap'
          }}>
            <Text>{item.description}</Text>
          </div>
        </Card>
      )}

      {/* Note */}
      {item.note && item.note !== 'unknown' && (
        <Card title="⚠️ Note" style={{ marginTop: 16 }}>
          <div style={{ 
            padding: 16, 
            background: '#fff7e6', 
            borderRadius: 4,
            whiteSpace: 'pre-wrap'
          }}>
            <Text>{item.note}</Text>
          </div>
        </Card>
      )}

      {/* Technical Information */}
      {item.techInfo && item.techInfo !== 'unknown' && (
        <Card title="🔬 Technical Information" style={{ marginTop: 16 }}>
          <div style={{ 
            padding: 16, 
            background: '#f6ffed', 
            borderRadius: 4,
            whiteSpace: 'pre-wrap'
          }}>
            <Text>{item.techInfo}</Text>
          </div>
        </Card>
      )}

      {/* Keywords */}
      <Card title="🏷️ Keywords" style={{ marginTop: 16 }}>
        {item.keywordKor && item.keywordKor !== 'unknown' && (
          <Paragraph>
            <Text strong>한국어:</Text> {item.keywordKor}
          </Paragraph>
        )}
        {item.keywordEng && item.keywordEng !== 'unknown' && (
          <Paragraph>
            <Text strong>English:</Text> {item.keywordEng}
          </Paragraph>
        )}
      </Card>

      {/* 관련 항목 */}
      {item.refNo && item.refNo !== 'unknown' && (
        <Card title="🔗 관련 항목" style={{ marginTop: 16 }}>
          <Text type="secondary">{item.refNo}</Text>
        </Card>
      )}

      {/* Reference */}
      <Card style={{ marginTop: 16, background: '#fafafa' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Ref CL No: {item.refClNo || 'N/A'} | Ref No: {item.refNo || 'N/A'}
        </Text>
      </Card>
    </div>
  );
};

export default ECCNDetailPanel;