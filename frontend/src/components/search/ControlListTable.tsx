import React, { useState, useEffect } from 'react';
import { Table, Input, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

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

interface ControlListTableProps {
  onRowClick: (record: ControlListItem) => void;
}

const ControlListTable: React.FC<ControlListTableProps> = ({ onRowClick }) => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ControlListItem[]>([]);

  // JSON 파일에서 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/data/control_list.json');
        const jsonData = await response.json();
        
        // JSON 데이터를 ControlListItem 형식으로 변환
        const formattedData: ControlListItem[] = jsonData.map((item: any, index: number) => ({
          id: index + 1,
          eccn: item.ECCN || '',
          refClNo: item.Ref_CL_No || '',
          refNo: item.Ref_No || '',
          title: item.title || '',
          description: item.description || '',
          note: item.note || '',
          techInfo: item.tech_info || '',
          keywordKor: item.keyword_kor || '',
          keywordEng: item.keyword_eng || '',
          category: item.ECCN ? item.ECCN.substring(0, 2) : '',
        }));
        
        setData(formattedData);
        message.success(`${formattedData.length}건의 통제목록을 불러왔습니다.`);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        message.error('통제목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const columns: ColumnsType<ControlListItem> = [
    {
      title: 'ECCN',
      dataIndex: 'eccn',
      key: 'eccn',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  // 검색 필터
  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%' }}>
        <Input
          placeholder="검색어 입력 (제목, ECCN, 설명 등)"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="small"
        loading={loading}
        pagination={{
          pageSize: 20,
          showTotal: (total) => `총 ${total}개`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onRow={(record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: 'pointer' },
        })}
        rowClassName="hover-row"
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default ControlListTable;