import React from 'react';
import { Card, List, Typography, Tag, Space, Button, Empty } from 'antd';
import { StarFilled, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface SidebarItem {
  eccn: string;
  title: string;
  timestamp?: string;
}

interface ECCNSidebarProps {
  bookmarks: SidebarItem[];
  recentItems: SidebarItem[];
  stats: {
    totalItems: number;
    categories: number;
    level0: number;
    level1: number;
    level2: number;
  };
  onSelectItem: (eccn: string) => void;
  onRemoveBookmark: (eccn: string) => void;
}

const ECCNSidebar: React.FC<ECCNSidebarProps> = ({
  bookmarks,
  recentItems,
  stats,
  onSelectItem,
  onRemoveBookmark
}) => {
  // 시간 포맷팅
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000 / 60); // 분 단위

    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  };

  return (
    <div>
      {/* 즐겨찾기 */}
      <Card 
        title={
          <Space>
            <StarFilled style={{ color: '#faad14' }} />
            <span>즐겨찾기 ({bookmarks.length})</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        {bookmarks.length === 0 ? (
          <Empty 
            description="즐겨찾기가 없습니다" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '20px 0' }}
          />
        ) : (
          <List
            size="small"
            dataSource={bookmarks}
            renderItem={item => (
              <List.Item
                style={{ 
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(item.eccn);
                    }}
                  />
                ]}
                onClick={() => onSelectItem(item.eccn)}
              >
                <div style={{ width: '100%' }}>
                  <Text strong style={{ color: '#1890ff', fontSize: 12 }}>
                    {item.eccn}
                  </Text>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {item.title?.substring(0, 30)}
                    {item.title && item.title.length > 30 ? '...' : ''}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 최근 본 항목 */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            <span>최근 본 항목 ({recentItems.length})</span>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        {recentItems.length === 0 ? (
          <Empty 
            description="최근 본 항목이 없습니다" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '20px 0' }}
          />
        ) : (
          <List
            size="small"
            dataSource={recentItems.slice(0, 10)}
            renderItem={item => (
              <List.Item
                style={{ 
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onClick={() => onSelectItem(item.eccn)}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ color: '#1890ff', fontSize: 12 }}>
                      {item.eccn}
                    </Text>
                    {item.timestamp && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatTime(item.timestamp)}
                      </Text>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {item.title?.substring(0, 30)}
                    {item.title && item.title.length > 30 ? '...' : ''}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 통계 */}
      <Card title="📊 통계" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>전체 항목</Text>
            <Tag color="blue">{stats.totalItems}개</Tag>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>카테고리</Text>
            <Tag color="green">{stats.categories}개</Tag>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>레벨 0</Text>
            <Tag>{stats.level0}개</Tag>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>레벨 1</Text>
            <Tag>{stats.level1}개</Tag>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>레벨 2</Text>
            <Tag>{stats.level2}개</Tag>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ECCNSidebar;