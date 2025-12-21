import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Card, Spin } from 'antd';
import 'leaflet/dist/leaflet.css';

interface CountryMapProps {
  data: any[];
  onCountryClick?: (country: string) => void;
}

interface CountryStats {
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  totalCount: number;
  strategicCount: number;
  strategicRatio: number;
}

const CountryMap: React.FC<CountryMapProps> = ({ data, onCountryClick }) => {
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [data]);

  const loadData = async () => {
    try {
      // location.json 로드
      const response = await fetch('/data/location.json');
      const locationData = await response.json();
      setLocations(locationData);

      // 국가별 통계 계산
      const statsMap = new Map<string, any>();

      data.forEach(item => {
        const state = item.state || item.country;
        if (!state || state === 'XX' || state === 'XXX') return;

        if (!statsMap.has(state)) {
          statsMap.set(state, {
            totalCount: 0,
            strategicCount: 0
          });
        }

        const stats = statsMap.get(state);
        stats.totalCount++;
        if (item.label === 1) {
          stats.strategicCount++;
        }
      });

      // location 정보와 통계 결합
      const combined: CountryStats[] = [];

      statsMap.forEach((stats, countryCode) => {
        const location = locationData.find((loc: any) => 
          loc.country_code === countryCode
        );

        if (location && location.latitude && location.longitude) {
          combined.push({
            country: location.country_kor,
            countryCode: countryCode,
            latitude: location.latitude,
            longitude: location.longitude,
            totalCount: stats.totalCount,
            strategicCount: stats.strategicCount,
            strategicRatio: (stats.strategicCount / stats.totalCount) * 100
          });
        }
      });

      setCountryStats(combined);
      setLoading(false);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setLoading(false);
    }
  };

  // 마커 크기 계산 (수출 건수에 비례)
  const getMarkerRadius = (count: number): number => {
    const minRadius = 5;
    const maxRadius = 30;
    const maxCount = Math.max(...countryStats.map(c => c.totalCount));
    
    return minRadius + (count / maxCount) * (maxRadius - minRadius);
  };

  // 마커 색상 계산 (전략물자 비율)
  const getMarkerColor = (ratio: number): string => {
    if (ratio >= 70) return '#ff4d4f'; // 빨강
    if (ratio >= 50) return '#ff7a45'; // 주황
    if (ratio >= 30) return '#ffa940'; // 노랑-주황
    if (ratio >= 10) return '#ffc53d'; // 노랑
    return '#52c41a'; // 초록
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="지도 로딩 중..." />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="🗺️ 수출 현황 지도" 
      style={{ marginBottom: 24 }}
    >
      <div style={{ height: 500 }}>
        <MapContainer
        center={[30, 10]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        minZoom={2}
        maxZoom={2}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {countryStats.map((country, index) => (
            <CircleMarker
              key={index}
              center={[country.latitude, country.longitude]}
              radius={getMarkerRadius(country.totalCount)}
              fillColor={getMarkerColor(country.strategicRatio)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
              eventHandlers={{
                click: () => {
                  if (onCountryClick) {
                    onCountryClick(country.country);
                  }
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{country.country}</h4>
                  <div><strong>총 수출:</strong> {country.totalCount}건</div>
                  <div><strong>전략물자:</strong> {country.strategicCount}건</div>
                  <div>
                    <strong>전략물자 비율:</strong>{' '}
                    <span style={{ 
                      color: getMarkerColor(country.strategicRatio),
                      fontWeight: 'bold'
                    }}>
                      {country.strategicRatio.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* 범례 */}
      <div style={{ marginTop: 16, display: 'flex', gap: 24, justifyContent: 'center' }}>
        <div>
          <strong>마커 크기:</strong> 수출 건수
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <strong>마커 색상:</strong>
          <span style={{ color: '#52c41a' }}>●</span> 0-10%
          <span style={{ color: '#ffc53d' }}>●</span> 10-30%
          <span style={{ color: '#ffa940' }}>●</span> 30-50%
          <span style={{ color: '#ff7a45' }}>●</span> 50-70%
          <span style={{ color: '#ff4d4f' }}>●</span> 70%+
          <span style={{ marginLeft: 4, color: '#999' }}>(전략물자 비율)</span>
        </div>
      </div>
    </Card>
  );
};

export default CountryMap;