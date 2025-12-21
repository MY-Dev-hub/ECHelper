import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Input, Tag, Tooltip, message, Typography } from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Paragraph, Text } = Typography;

interface ExportHistory {
  id: number;
  year: number;
  title: string;
  country: string;
  state: string;
  trader: string;
  traderType: string;
  typeParent: string;
  typeSub: string;
  purpose: string;
  description: string;
  detailedInfo: string;
  application: string;
  label: number;
  classType: string;
  eccn: string;
  eccnBasis: string;
}

const ExportHistoryTable: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExportHistory[]>([]);
  const [filteredData, setFilteredData] = useState<ExportHistory[]>([]);
  const [searchTimer, setSearchTimer] = useState<number | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);  // 🔥 추가
  const hasLoaded = useRef(false);

  // JSON 파일에서 데이터 로드
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/data/export_history.json');
        const jsonData = await response.json();
        
        const reversedData = [...jsonData].reverse();

        const formattedData: ExportHistory[] = reversedData.map((item: any, index: number) => ({
          id: index + 1,
          year: item.year || 0,
          title: item.title || '',
          country: item.country || '',
          state: item.state || '',
          trader: item.trader || '',
          traderType: item.trader_type || '',
          typeParent: item.type_parent || '',
          typeSub: item.type_sub || '',
          purpose: item.purpose || '',
          description: item.description || '',
          detailedInfo: item.detailed_info || '',
          application: item.application || '',
          label: item.label || 0,
          classType: item.class || '',
          eccn: item.eccn || '',
          eccnBasis: item.eccn_basis || '',
        }));
        
        setData(formattedData);
        setFilteredData(formattedData);

        message.success(`${formattedData.length}건의 데이터를 불러왔습니다.`);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        message.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 디바운싱된 검색
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    const timer = setTimeout(() => {
      performSearch(value);
    }, 500) as unknown as number;

    setSearchTimer(timer);
  };

  // 실제 검색 실행
  const performSearch = (value: string) => {
    if (!value) {
      setFilteredData(data);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = data.filter((item) => {
      const fields = [
        item.title,
        item.country,
        item.state,
        item.trader,
        item.traderType,
        item.typeParent,
        item.typeSub,
        item.purpose,
        item.description,
        item.detailedInfo,
        item.application,
        item.classType,
        item.eccn,
        item.eccnBasis,
        String(item.year),
      ];

      return fields.some(field => 
        field && field.toLowerCase().includes(searchLower)
      );
    });

    setFilteredData(filtered);
  };

  // 하이라이트 함수
  const highlightText = (text: string) => {
    if (!searchText || !text) return text;

    const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === searchText.toLowerCase() ? (
            <mark key={index} style={{ backgroundColor: '#ffc069', padding: '0 2px' }}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // 🔥 행 클릭 핸들러
  const handleRowClick = (record: ExportHistory) => {
    const key = record.id;
    if (expandedRowKeys.includes(key)) {
      // 이미 열려있으면 닫기
      setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
    } else {
      // 닫혀있으면 열기
      setExpandedRowKeys([...expandedRowKeys, key]);
    }
  };

  // 🔥 확장 행 렌더링
  const expandedRowRender = (record: ExportHistory) => {
    return (
      <div style={{ padding: '6px 10px', background: '#eef3ffff' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Description */}
          {record.description && (
            <div>
              <Text strong>Description:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {highlightText(record.description)}
              </Paragraph>
            </div>
          )}

          {/* Detailed Info */}
          {record.detailedInfo && (
            <div>
              <Text strong>Detailed Info:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {highlightText(record.detailedInfo)}
              </Paragraph>
            </div>
          )}

          {/* Purpose */}
          {record.purpose && (
            <div>
              <Text strong>Purpose:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {highlightText(record.purpose)}
              </Paragraph>
            </div>
          )}

          {/* Application */}
          {record.application && (
            <div>
              <Text strong>Application:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                {highlightText(record.application)}
              </Paragraph>
            </div>
          )}

          {/* 추가 정보 */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Text type="secondary">Trader Type: {record.traderType}</Text>
            <Text type="secondary">Type Parent: {record.typeParent}</Text>
            <Text type="secondary">Type Sub: {record.typeSub}</Text>
            <Text type="secondary">ECCN Basis: {record.eccnBasis}</Text>
          </div>
        </Space>
      </div>
    );
  };

// 테이블 컬럼 정의
const columns: ColumnsType<ExportHistory> = [
  {
    title: 'Year',
    dataIndex: 'year',
    key: 'year',
    width: 40,  
    sorter: (a, b) => a.year - b.year,
    render: (text) => highlightText(String(text)),
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    width: 200, 
    ellipsis: {
      showTitle: false,
    },
    render: (text) => (
      <Tooltip title={text}>  {/* 🔥 Tooltip 유지 */}
        {highlightText(text)}
      </Tooltip>
    ),
  },
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country',
    width: 60,  
    ellipsis: {
      showTitle: false,
    },
    render: (text) => (
      <Tooltip title={text}>
        {highlightText(text)}
      </Tooltip>
    ),
  },
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
    width: 60, 
    ellipsis: {
      showTitle: false,
    },
    render: (text) => (
      <Tooltip title={text}>
        {highlightText(text)}
      </Tooltip>
    ),
  },
  {
    title: 'Trader',
    dataIndex: 'trader',
    key: 'trader',
    width: 80,  
    ellipsis: {
      showTitle: false,
    },
    render: (text) => (
      <Tooltip title={text}>
        {highlightText(text)}
      </Tooltip>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'typeParent',
    key: 'typeParent',
    width: 60, 
    ellipsis: {
      showTitle: false,
    },
    render: (text) => (
      <Tooltip title={text}>
        {highlightText(text)}
      </Tooltip>
    ),
  },
  {
    title: 'Label',
    dataIndex: 'label',
    key: 'label',
    width: 60, 
    render: (label: number) => (
      <Tag color={label === 1 ? 'red' : 'green'}>
        {label === 1 ? '전략' : '비전략'}
      </Tag>
    ),
    filters: [
      { text: '전략', value: 1 },
      { text: '비전략', value: 0 },
    ],
    onFilter: (value, record) => record.label === value,
  },
  {
    title: 'Class',
    dataIndex: 'classType',
    key: 'classType',
    width: 60,  
    render: (text: string) => (
      <Tag color="blue">{text || '-'}</Tag>
    ),
  },
  {
    title: 'ECCN',
    dataIndex: 'eccn',
    key: 'eccn',
    width: 60,  
    ellipsis: {
      showTitle: false,
    },
    render: (text) => (
      <Tooltip title={text}>
        {highlightText(text)}
      </Tooltip>
    ),
  },
];

  const handleDownload = () => {
    message.info('Excel 다운로드 기능은 추후 구현 예정입니다.');
  };

return (
  <div>
    {/* 상단 버튼 영역 */}
    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Input
          placeholder="전체 검색 (제목, 설명, 국가, 거래자 등)"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{ width: 400 }}
          allowClear
        />
      </Space>
      <Space>
        <Button icon={<DownloadOutlined />} onClick={handleDownload}>
          Excel 다운로드
        </Button>
      </Space>
    </div>

    {/* 테이블 */}
    <Table
      columns={columns}
      dataSource={filteredData}
      rowKey="id"
      loading={loading}
      expandable={{
        expandedRowRender,
        expandedRowKeys: expandedRowKeys,
        onExpand: (expanded, record) => {
          if (expanded) {
            setExpandedRowKeys([...expandedRowKeys, record.id]);
          } else {
            setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
          }
        },
        expandIcon: () => null,
        indentSize: 0,
        columnWidth: 0,  // 🔥 추가 - 확장 컬럼 폭 0
      }}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: 'pointer' },
      })}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `총 ${total}개`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      scroll={{ x: 1200 }}
      size="small"
    />
  </div>
);
};

export default ExportHistoryTable;