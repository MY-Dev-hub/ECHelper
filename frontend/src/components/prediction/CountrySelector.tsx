import React, { useState, useEffect } from 'react';
import { Card, Select, Descriptions, Tag, Space, Empty, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, FileTextOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 마커 아이콘 설정
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CountryInfo {
  country: string;
  NSG: boolean;
  AG: boolean;
  MTCR: boolean;
  WA: boolean;
  CA: boolean;
}

interface NuclearAgreement {
  country: string;
  agreementNumber: string;
  effectiveDate: string;
  signDate: string;
}

interface CountrySelectorProps {
  onCountryChange?: (country: string) => void;
}

// 핵보유국 목록
const nuclearStates = ['미국', '프랑스', '영국', '중국', '러시아'];

const CountrySelector: React.FC<CountrySelectorProps> = ({ onCountryChange }) => {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [nuclearAgreements, setNuclearAgreements] = useState<NuclearAgreement[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryInfo, setSelectedCountryInfo] = useState<CountryInfo | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<NuclearAgreement | null>(null);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [participantsResponse, locationResponse, agreementsResponse] = await Promise.all([
          fetch('/data/participants.json'),
          fetch('/data/location.json'),
          fetch('/data/nuclear_agreements.json')
        ]);

        const participantsData = await participantsResponse.json();
        const locationData = await locationResponse.json();
        const agreementsData = await agreementsResponse.json();

        setCountries(participantsData);
        setLocations(locationData);
        setNuclearAgreements(agreementsData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };

    loadData();
  }, []);

  // 국가 선택
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    
    // 선택된 국가의 수출통제 체제 정보 찾기
    const info = countries.find(c => c.country === value);
    setSelectedCountryInfo(info || null);

    // 원자력협정 정보 찾기
    const agreement = nuclearAgreements.find(a => {
      return a.country === value || 
             a.country.includes(value) || 
             value.includes(a.country) ||
             (a.country === '미국' && value === '미합중국') ||
             (a.country === '아랍에미리트' && value === '아랍에미리트연합국');
    });
    setSelectedAgreement(agreement || null);

    if (onCountryChange) {
      onCountryChange(value);
    }
  };

  // Select 옵션 생성
  const countryOptions = locations
    .filter(loc => loc.country_kor && loc.country_kor !== '국가정보없음' && loc.country_kor !== '다중국가')
    .map(loc => ({
      label: `${loc.country_kor} (${loc.country_code})`,
      value: loc.country_kor,
      code: loc.country_code
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'));

  // 수출통제 체제 가입 개수 계산 (캐치올 제외 - 4개 체제만)
  const getRegimeCount = (info: CountryInfo): number => {
    return [info.NSG, info.AG, info.MTCR, info.WA].filter(Boolean).length;
  };

  // 핵보유국 여부
  const isNuclearState = selectedCountry ? nuclearStates.includes(selectedCountry) : false;

  // 날짜 포맷팅
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Card title="🌍 수출 대상국 정보">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 국가 선택 */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>대상국 선택:</div>
          <Select
            showSearch
            placeholder="국가명을 입력하거나 선택하세요"
            style={{ width: '100%' }}
            size="large"
            options={countryOptions}
            onChange={handleCountryChange}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* 원자력협정 정보 */}
        {selectedCountry && selectedCountry !== '대한민국' && (
          selectedAgreement ? (
            <Alert
              message={
                <Space>
                  <FileTextOutlined />
                  <span>원자력 평화적이용 협정 체결국</span>
                </Space>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  <div><strong>협정번호:</strong> {selectedAgreement.agreementNumber}</div>
                  <div><strong>서명일:</strong> {formatDate(selectedAgreement.signDate)}</div>
                  <div><strong>발효일:</strong> {formatDate(selectedAgreement.effectiveDate)}</div>
                </div>
              }
              type="info"
              showIcon
            />
          ) : (
            <Alert
              message="원자력 평화적이용 협정 미체결국"
              description={`${selectedCountry}은(는) 대한민국과 원자력 평화적이용 협정을 체결하지 않았습니다.`}
              type="warning"
              showIcon
            />
          )
        )}

        {/* 수출통제 체제 정보 */}
        {selectedCountryInfo ? (
          <div>
            <div style={{ marginBottom: 12, fontWeight: 'bold' }}>수출통제 체제 가입 현황:</div>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item 
                label={<span style={{ fontWeight: 'bold' }}>NSG (핵공급국그룹)</span>}
              >
                {selectedCountryInfo.NSG ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">가입</Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="default">미가입</Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item 
                label={<span style={{ fontWeight: 'bold' }}>MTCR (미사일기술통제체제)</span>}
              >
                {selectedCountryInfo.MTCR ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">가입</Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="default">미가입</Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item 
                label={<span style={{ fontWeight: 'bold' }}>WA (바세나르체제)</span>}
              >
                {selectedCountryInfo.WA ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">가입</Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="default">미가입</Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item 
                label={<span style={{ fontWeight: 'bold' }}>AG (호주그룹)</span>}
              >
                {selectedCountryInfo.AG ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">가입</Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="default">미가입</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* 참고: 캐치올 */}
            <div style={{ marginTop: 12 }}>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item 
                  label={<span style={{ fontWeight: 'normal', color: '#999' }}>CA (캐치올) - 참고</span>}
                >
                  {selectedCountryInfo.CA ? (
                    <Tag color="blue">적용</Tag>
                  ) : (
                    <Tag color="default">미적용</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* 요약 정보 */}
            <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 4 }}>
              <div style={{ fontSize: 13, color: '#666' }}>
                <strong>{selectedCountry}</strong>은(는)
                {' '}
                <strong style={{ color: '#1890ff' }}>
                  {getRegimeCount(selectedCountryInfo)}/4개
                </strong>
                의 수출통제 체제에 가입되어 있습니다.
              </div>
            </div>

            {/* 핵보유국 정보 */}
            {isNuclearState && (
              <Alert
                message="핵보유국"
                description={`${selectedCountry}은(는) 핵보유국입니다.`}
                type="warning"
                icon={<WarningOutlined />}
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        ) : selectedCountry ? (
          <Empty 
            description={`${selectedCountry}의 수출통제 체제 가입 정보가 없습니다.`}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Empty 
            description="국가를 선택하면 수출통제 체제 가입 정보가 표시됩니다."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}

        
        {/* 🗺️ 지도 - 국가만 선택되면 표시 */}
        {selectedCountry && (() => {
          const location = locations.find(loc => loc.country_kor === selectedCountry);
          if (location && location.latitude && location.longitude) {
            const mapCenter: [number, number] = location.longitude < -20
              ? [20, -100]
              : [20, 100];

            return (
              <div>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>위치:</div>
                <div style={{ height: 300, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
                  <MapContainer
                    key={selectedCountry}
                    center={mapCenter}
                    zoom={1.5}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    doubleClickZoom={false}
                    touchZoom={false}
                    minZoom={1.5}
                    maxZoom={1.5}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.latitude, location.longitude]}>
                      <Popup>
                        <div>
                          <h4 style={{ margin: 0 }}>{selectedCountry}</h4>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {location.country_eng}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
      </Space>
    </Card>
  );
};

export default CountrySelector;