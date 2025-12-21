import React from 'react';
import { Card, Tabs, Table, Typography, Tag, Empty } from 'antd';

const { Text, Paragraph } = Typography;

interface SimilarCase {
  year: number;
  title: string;
  description: string;
  country: string;
  state: string;
  class: string;
  trader?: string;
  eccn?: string;
  label: number;
  similarity: number;
  rank: number;
}

interface SimilarCasesListProps {
  cases: SimilarCase[];
}

const SimilarCasesList: React.FC<SimilarCasesListProps> = ({ cases }) => {
  // Empty 상태
  if (!cases || cases.length === 0) {
    return (
      <Card title="📋 유사 과거 이력">
        <Empty 
          description="유사한 과거 이력이 없습니다"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <p style={{ color: '#999', fontSize: 13, marginTop: 8 }}>
            💡 팁: Title과 Description을 더 자세히 입력하면<br/>
            더 정확한 유사 사례를 찾을 수 있습니다.
          </p>
        </Empty>
      </Card>
    );
  }

  // 테이블 컬럼
  const columns = [
    {
      title: '연도',
      dataIndex: 'year',
      key: 'year',
      width: 80,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true,
    },
    {
      title: '국가',
      dataIndex: 'country',
      key: 'country',
      width: 100,
    },
    {
      title: '거래기관',
      dataIndex: 'trader',
      key: 'state',
      width: 80,
    },
    {
      title: '분류',
      dataIndex: 'class',
      key: 'class',
      width: 80,
      render: (text: string) => text ? <Tag color="blue">{text}</Tag> : <Tag>-</Tag>,
    },
    {
      title: 'ECCN',
      dataIndex: 'eccn',
      key: 'eccn',
      width: 120,
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      width: 100,
      render: (label: number) => (
        <Tag color={label === 1 ? 'red' : 'green'}>
          {label === 1 ? '전략' : '비전략'}
        </Tag>
      ),
    },
    {
      title: '유사도',
      dataIndex: 'similarity',
      key: 'similarity',
      width: 100,
      render: (score: number) => `${(score * 100).toFixed(1)}%`,
    },
  ];

  // 탭 생성
  const tabItems = cases.slice(0, 5).map((caseItem, index) => ({
    key: String(index + 1),
    label: `${index + 1}위 (${(caseItem.similarity * 100).toFixed(1)}%)`,
    children: (
      <div>
        {/* 테이블 */}
        <Table
          dataSource={[caseItem]}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => `${record.year}-${record.title}-${index}`}
          scroll={{ x: 1000 }}  // 추가
        />

        {/* 상세 설명 */}
        <div style={{ marginBottom: 16 }}>
          <Text strong>상세 내용:</Text>
          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 4,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {caseItem.description || '상세 정보 없음'}
            </Paragraph>
          </div>
        </div>

      </div>
    ),
  }));

  return (
    <Card 
      title={`📋 유사 과거 이력 (TF-IDF 기반, ${cases.length}건)`}
    >
      <Tabs items={tabItems} defaultActiveKey="1" />
    </Card>
  );
};

export default SimilarCasesList;