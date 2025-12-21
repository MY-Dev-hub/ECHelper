import React, { useState, useEffect, useRef } from 'react'; // useRef 추가
import { Typography, Tabs, Row, Col, Spin, message } from 'antd';
import OverviewStats from '../components/analytics/OverviewStats';
import YearlyTrendChart from '../components/analytics/YearlyTrendChart';
import CountryChart from '../components/analytics/CountryChart';
import CountryTable from '../components/analytics/CountryTable';
import TypeDistributionChart from '../components/analytics/TypeDistributionChart';
import ClassDistributionChart from '../components/analytics/ClassDistributionChart';
import TraderTypeChart from '../components/analytics/TraderTypeChart';
import KeywordCloud from '../components/analytics/KeywordCloud';
import CountryMap from '../components/analytics/CountryMap';

const { Title } = Typography;

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const hasLoaded = useRef(false); // 🔥 추가

  
  // 통계 데이터
  const [stats, setStats] = useState({
    total: 0,
    strategic: 0,
    nonStrategic: 0,
    currentYear: 0,
  });

  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [countryTableData, setCountryTableData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [classData, setClassData] = useState<any[]>([]);
  const [traderData, setTraderData] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);

  useEffect(() => {
    // 🔥 이미 로드했으면 스킵
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data/export_history.json');
      const jsonData = await response.json();
      setData(jsonData);

      processData(jsonData);
      message.success('데이터를 불러왔습니다.');
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      message.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData: any[]) => {
    const currentYear = new Date().getFullYear();

    // 기본 통계
    const strategic = rawData.filter(d => d.label === 1).length;
    const nonStrategic = rawData.filter(d => d.label === 0).length;
    const currentYearCount = rawData.filter(d => d.year === currentYear).length;

    setStats({
      total: rawData.length,
      strategic,
      nonStrategic,
      currentYear: currentYearCount,
    });

    // 연도별 데이터
    const yearMap: any = {};
    rawData.forEach(item => {
      const year = item.year;
      if (!yearMap[year]) {
        yearMap[year] = { year, strategic: 0, nonStrategic: 0 };
      }
      if (item.label === 1) {
        yearMap[year].strategic++;
      } else {
        yearMap[year].nonStrategic++;
      }
    });
    setYearlyData(Object.values(yearMap).sort((a: any, b: any) => a.year - b.year));

    // 국가별 데이터 (Top 20)
    const countryMap: any = {};
    rawData.forEach(item => {
      const country = item.country || 'Unknown';
      if (!countryMap[country]) {
        countryMap[country] = { country, strategic: 0, nonStrategic: 0, total: 0 };
      }
      countryMap[country].total++;
      if (item.label === 1) {
        countryMap[country].strategic++;
      } else {
        countryMap[country].nonStrategic++;
      }
    });

    const sortedCountries = Object.values(countryMap)
      .sort((a: any, b: any) => b.total - a.total);

    setCountryData(sortedCountries.slice(0, 20));
    setCountryTableData(sortedCountries);

    // Type 분포
    const typeMap: any = {};
    rawData.forEach(item => {
      const type = item.type_parent || 'Unknown';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    setTypeData(
      Object.entries(typeMap)
        .map(([type, count]) => ({ type, count }))
        .sort((a: any, b: any) => b.count - a.count)
    );

    // Class 분포
    const classMap: any = {};
    rawData.forEach(item => {
      const cls = item.class || 'Unknown';
      classMap[cls] = (classMap[cls] || 0) + 1;
    });
    setClassData(
      Object.entries(classMap)
        .map(([cls, count]) => ({ class: cls, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10)
    );

    // Trader Type 분포
    const traderMap: any = {};
    rawData.forEach(item => {
      const trader = item.trader_type || 'Unknown';
      if (trader !== 'unknown') {
        traderMap[trader] = (traderMap[trader] || 0) + 1;
      }
    });
    setTraderData(
      Object.entries(traderMap)
        .map(([type, count]) => ({ type, count }))
        .sort((a: any, b: any) => b.count - a.count)
    );

    // 키워드 추출 (Title에서)
    const wordMap: any = {};
    rawData.forEach(item => {
      if (item.title) {
        // 한글, 영문 단어 추출 (2자 이상)
        const words = item.title.match(/[가-힣]{2,}|[a-zA-Z]{3,}/g) || [];
        words.forEach((word: string) => {
          // 불용어 제거
          const stopWords = ['the', 'and', 'for', 'with', '관련', '장비', '시스템'];
          if (!stopWords.includes(word.toLowerCase())) {
            wordMap[word] = (wordMap[word] || 0) + 1;
          }
        });
      }
    });

    setKeywords(
      Object.entries(wordMap)
        .map(([text, count]) => ({ text, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 50)
    );
  };

  if (loading) {
    return <Spin size="large" tip="데이터 로딩 중..." style={{ marginTop: 100 }} />;
  }

  const tabItems = [
    {
      key: 'overview',
      label: '📈 Overview',
      children: (
        <div>
          <OverviewStats {...stats} />
          <div style={{ marginTop: 16 }}>
            <YearlyTrendChart data={yearlyData} />
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      label: '국가별 분석',
      children: (
        <div>
          {/* 🗺️ 지도 */}
          <CountryMap data={data} />
          
          {/* 📊 국가별 Top 20 차트 */}
          <div style={{ marginTop: 16 }}>
            <CountryChart data={countryData} />
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: '📦 Type & Class',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <TypeDistributionChart data={typeData} />
          </Col>
          <Col xs={24} lg={12}>
            <ClassDistributionChart data={classData} />
          </Col>
        </Row>
      ),
    },
    {
      key: 'trader',
      label: '🏢 Trader 분석',
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <TraderTypeChart data={traderData} />
          </Col>
        </Row>
      ),
    },
    {
      key: 'keyword',
      label: '☁️ 키워드 분석',
      children: <KeywordCloud keywords={keywords} />,
    },
  ];

  return (
    <div>
      <Title level={3}>Data Analytics</Title>
      <Tabs items={tabItems} defaultActiveKey="overview" />
    </div>
  );
};

export default AnalyticsPage;