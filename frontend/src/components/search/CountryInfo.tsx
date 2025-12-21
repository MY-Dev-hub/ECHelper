import React, { useState } from 'react';
import { Card, Select, Typography } from 'antd';

const { Text, Paragraph } = Typography;

interface CountryInfoProps {}

const CountryInfo: React.FC<CountryInfoProps> = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('KR');

  // 더미 국가 데이터
  const countries = [
    { label: '대한민국 (KR)', value: 'KR' },
    { label: '미국 (US)', value: 'US' },
    { label: '중국 (CN)', value: 'CN' },
    { label: '일본 (JP)', value: 'JP' },
    { label: '이란 (IR)', value: 'IR' },
    { label: '북한 (KP)', value: 'KP' },
  ];

  const countryDetails: Record<string, any> = {
    KR: {
      name: '대한민국',
      memberships: {
        NSG: 'Member',
        AG: 'Member',
        MTCR: 'Member',
        WA: 'Member',
      },
      subordinate: 'Independent',
    },
    US: {
      name: '미국',
      memberships: {
        NSG: 'Member',
        AG: 'Member',
        MTCR: 'Member',
        WA: 'Member',
      },
      subordinate: 'Independent',
    },
    IR: {
      name: '이란',
      memberships: {
        NSG: 'Non-Member',
        AG: 'Non-Member',
        MTCR: 'Non-Member',
        WA: 'Non-Member',
      },
      subordinate: 'Independent',
    },
    KP: {
      name: '북한',
      memberships: {
        NSG: 'Non-Member',
        AG: 'Non-Member',
        MTCR: 'Non-Member',
        WA: 'Non-Member',
      },
      subordinate: 'Independent',
    },
  };

  const currentCountry = countryDetails[selectedCountry];

  return (
    <Card title="Country Information">
      <Select
        style={{ width: '100%', marginBottom: 16 }}
        value={selectedCountry}
        onChange={setSelectedCountry}
        options={countries}
      />

      {currentCountry && (
        <div>
          <Paragraph>
            <Text strong>국제체제 가입 현황:</Text>
          </Paragraph>
          <div style={{ marginLeft: 16 }}>
            <Paragraph>
              • NSG: <Text strong>{currentCountry.memberships.NSG}</Text>
            </Paragraph>
            <Paragraph>
              • AG: <Text strong>{currentCountry.memberships.AG}</Text>
            </Paragraph>
            <Paragraph>
              • MTCR: <Text strong>{currentCountry.memberships.MTCR}</Text>
            </Paragraph>
            <Paragraph>
              • WA: <Text strong>{currentCountry.memberships.WA}</Text>
            </Paragraph>
          </div>

          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>독립 여부:</Text> {currentCountry.subordinate}
          </Paragraph>

          {/* 지도는 나중에 추가 */}
          <div
            style={{
              marginTop: 16,
              height: 200,
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text type="secondary">지도 영역 (나중에 추가)</Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CountryInfo;