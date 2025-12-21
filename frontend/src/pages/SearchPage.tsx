import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Tabs, message } from 'antd';
import ECCNTreeView from '../components/search/ECCNTreeView';
import ECCNDetailPanel from '../components/search/ECCNDetailPanel';
import ECCNSidebar from '../components/search/ECCNSidebar';
import CountrySelector from '../components/prediction/CountrySelector';

const { Title } = Typography;

interface SidebarItem {
  eccn: string;
  title: string;
  timestamp?: string;
}

const SearchPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<SidebarItem[]>([]);
  const [recentItems, setRecentItems] = useState<SidebarItem[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    categories: 0,
    level0: 0,
    level1: 0,
    level2: 0
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
    loadBookmarks();
    loadRecentItems();
  }, []);

  const loadInitialData = async () => {
    try {
      const [controlResponse, statsResponse] = await Promise.all([
        fetch('/data/control_list.json'),
        fetch('/data/stats.json')
      ]);

      const controlData = await controlResponse.json();
      const statsData = await statsResponse.json();

      setAllData(controlData);
      setStats({
        totalItems: statsData.controlListCount || 0,
        categories: statsData.categories?.main || 0,
        level0: statsData.levels?.level0 || 0,
        level1: statsData.levels?.level1 || 0,
        level2: statsData.levels?.level2 || 0
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  // localStorage에서 즐겨찾기 로드
  const loadBookmarks = () => {
    const saved = localStorage.getItem('eccn_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  // localStorage에서 최근 항목 로드
  const loadRecentItems = () => {
    const saved = localStorage.getItem('eccn_recent');
    if (saved) {
      setRecentItems(JSON.parse(saved));
    }
  };

  // 항목 선택
  const handleSelectItem = (eccn: string, item: any) => {
    setSelectedItem(item);

    // 최근 항목에 추가
    const newRecent: SidebarItem = {
      eccn: item.eccn,
      title: item.title || '',
      timestamp: new Date().toISOString()
    };

    const updatedRecent = [
      newRecent,
      ...recentItems.filter(r => r.eccn !== eccn)
    ].slice(0, 20); // 최대 20개

    setRecentItems(updatedRecent);
    localStorage.setItem('eccn_recent', JSON.stringify(updatedRecent));
  };

  // 사이드바에서 항목 선택
  const handleSelectFromSidebar = (eccn: string) => {
    const item = allData.find(d => d.eccn === eccn);
    if (item) {
      setSelectedItem(item);
    }
  };

  // 즐겨찾기 토글
  const handleBookmark = (eccn: string) => {
    const isBookmarked = bookmarks.some(b => b.eccn === eccn);

    if (isBookmarked) {
      const updated = bookmarks.filter(b => b.eccn !== eccn);
      setBookmarks(updated);
      localStorage.setItem('eccn_bookmarks', JSON.stringify(updated));
      message.success('즐겨찾기에서 제거되었습니다');
    } else {
      const item = allData.find(d => d.eccn === eccn);
      if (item) {
        const newBookmark: SidebarItem = {
          eccn: item.eccn,
          title: item.title || ''
        };
        const updated = [...bookmarks, newBookmark];
        setBookmarks(updated);
        localStorage.setItem('eccn_bookmarks', JSON.stringify(updated));
        message.success('즐겨찾기에 추가되었습니다');
      }
    }
  };

  // 즐겨찾기 제거
  const handleRemoveBookmark = (eccn: string) => {
    const updated = bookmarks.filter(b => b.eccn !== eccn);
    setBookmarks(updated);
    localStorage.setItem('eccn_bookmarks', JSON.stringify(updated));
    message.success('즐겨찾기에서 제거되었습니다');
  };

  // 하단 탭
  const bottomTabItems = [
    {
      key: 'countries',
      label: 'Country Information',
      children: <CountrySelector />,
    },
    {
      key: 'denial',
      label: 'Denial Lists',
      children: (
        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
          Denial Lists (추후 구현)
        </div>
      ),
    },
    {
      key: 'statistics',
      label: 'Export Statistics',
      children: (
        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
          Export Statistics (추후 구현)
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Search & Information</Title>

      <Row gutter={[16, 16]}>
        {/* 좌측: ECCN 트리 */}
        <Col xs={24} lg={7}>
          <div style={{ height: 700, overflowY: 'auto', background: 'white', padding: 16, borderRadius: 8 }}>
            <ECCNTreeView onSelect={handleSelectItem} />
          </div>
        </Col>

        {/* 중앙: 상세 정보 */}
        <Col xs={24} lg={11}>
          <div style={{ height: 700, overflowY: 'auto' }}>
            <ECCNDetailPanel 
              item={selectedItem}
              onBookmark={handleBookmark}
              isBookmarked={bookmarks.some(b => b.eccn === selectedItem?.eccn)}
            />
          </div>
        </Col>

        {/* 우측: 사이드바 */}
        <Col xs={24} lg={6}>
          <div style={{ height: 700, overflowY: 'auto' }}>
            <ECCNSidebar
              bookmarks={bookmarks}
              recentItems={recentItems}
              stats={stats}
              onSelectItem={handleSelectFromSidebar}
              onRemoveBookmark={handleRemoveBookmark}
            />
          </div>
        </Col>
      </Row>

      {/* 하단 탭: Country Information */}
      <div style={{ marginTop: 16 }}>
        <Tabs items={bottomTabItems} defaultActiveKey="countries" />
      </div>
    </div>
  );
};

export default SearchPage;