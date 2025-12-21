import React from 'react';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface CountryTableData {
  country: string;
  strategic: number;
  nonStrategic: number;
  total: number;
}

interface CountryTableProps {
  data: CountryTableData[];
}

const CountryTable: React.FC<CountryTableProps> = ({ data }) => {
  const columns: ColumnsType<CountryTableData> = [
    {
      title: '순위',
      key: 'rank',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '국가',
      dataIndex: 'country',
      key: 'country',
      width: 150,
    },
    {
      title: '전략물자',
      dataIndex: 'strategic',
      key: 'strategic',
      align: 'right',
      width: 100,
    },
    {
      title: '비전략물자',
      dataIndex: 'nonStrategic',
      key: 'nonStrategic',
      align: 'right',
      width: 100,
    },
    {
      title: '합계',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 100,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: '전략 비율',
      key: 'ratio',
      align: 'right',
      width: 100,
      render: (_, record) => 
        `${((record.strategic / record.total) * 100).toFixed(1)}%`,
    },
  ];

  return (
    <Card title="국가별 상세 통계">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="country"
        pagination={{ pageSize: 10 }}
        size="small"
        scroll={{ y: 400 }}
      />
    </Card>
  );
};

export default CountryTable;