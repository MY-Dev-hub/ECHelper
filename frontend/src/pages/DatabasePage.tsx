import React from 'react';
import { Typography, Tabs } from 'antd';
import ExportHistoryTable from '../components/database/ExportHistoryTable';

const { Title } = Typography;

const DatabasePage: React.FC = () => {
  const items = [
    {
      key: 'individual',
      label: 'Individual Items & Techs',
      children: <ExportHistoryTable />,
    },
    {
      key: 'plant',
      label: 'Nuclear Plant Technologies',
      children: (
        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
          원전 기술 데이터베이스 (추후 구현)
        </div>
      ),
    },
    {
      key: 'material',
      label: 'Nuclear Materials',
      children: (
        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
          핵물질 데이터베이스 (추후 구현)
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Export Control Database</Title>
      <Tabs items={items} defaultActiveKey="individual" />
    </div>
  );
};

export default DatabasePage;