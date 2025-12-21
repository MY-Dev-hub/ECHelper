import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DatabaseOutlined,
  ExperimentOutlined,
  SearchOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = location.pathname.split('/')[1] || 'database';

  const menuItems = [
    { key: 'database', icon: <DatabaseOutlined />, label: 'Database' },
    { key: 'prediction', icon: <ExperimentOutlined />, label: 'Prediction' },
    { key: 'search', icon: <SearchOutlined />, label: 'Search' },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
        }}
      >
        <div style={{ 
          height: 80, 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {collapsed ? (
            'EC'
          ) : (
            <div style={{ textAlign: 'center', lineHeight: 1.5 }}>
              <div>EC Helper</div>
              <div style={{ fontSize: '0.8em', color: '#eaf1ffff' }}>
                (전략물자 판정지원 프로그램)
              </div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          style={{ fontSize: 16 }}
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={(e) => navigate(`/${e.key}`)}
        />
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: 0  // 높이만 유지
        }}>
        </Header>
        <Content style={{ 
          margin: 24, 
          padding: 24, 
          background: '#fff',
          minHeight: 280,
          borderRadius: 8
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;