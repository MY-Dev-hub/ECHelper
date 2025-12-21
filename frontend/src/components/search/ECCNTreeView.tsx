import React, { useState, useEffect, useRef } from 'react';
import { Tree, Input, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

interface ECCNTreeViewProps {
  onSelect: (eccn: string, item: any) => void;
}

const ECCNTreeView: React.FC<ECCNTreeViewProps> = ({ onSelect }) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<any[]>([]);
  const [searchTimer, setSearchTimer] = useState<number | null>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/data/control_list.json');
        const jsonData = await response.json();
        setAllData(jsonData);

        // 전체 트리를 한 번에 생성
        const tree = buildFullTree(jsonData);
        setTreeData(tree);

        const defaultExpandedKeys = ['0', '1', '2', '3', '6'];
        setExpandedKeys(defaultExpandedKeys);
        
        message.success(`${jsonData.length}개 항목을 불러왔습니다.`);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        message.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 재귀적으로 전체 트리 생성
  const buildFullTree = (data: any[]): DataNode[] => {
    const categoryNames: Record<string, string> = {
      '0': '⚛️ Nuclear',
      '1': '🔬 Special Materials',
      '2': '🧪 Materials Processing',
      '3': '💻 Electronics',
      '6': '📡 Sensors and Lasers'
    };

    const subcategoryNames: Record<string, string> = {
      'A': 'System, Equipment and Components',
      'B': 'Test, Inspection and Production Equipment',
      'C': 'Materials',
      'D': 'Software',
      'E': 'Technology'
    };

    // 재귀 함수: 특정 부모의 자식들을 찾아서 트리 생성
    const buildChildren = (parentEccn: string | null): DataNode[] => {
      return data
        .filter(item => item.parent === parentEccn)
        .map(item => {
          const children = buildChildren(item.eccn);
          
          // 🔥 level 1 이상이면 description 사용
          const displayTitle = item.level >= 1 && item.description 
            ? item.description 
            : item.title || item.eccn;
          
          return {
            key: item.eccn,
            title: displayTitle,
            children: children.length > 0 ? children : undefined,
            isLeaf: children.length === 0,
            item: item
          };
        });
    };

    // 메인 카테고리별로 그룹화
    const mainCategories = ['0', '1', '2', '3', '6'];
    const tree: DataNode[] = [];

    mainCategories.forEach(mainCat => {
      const subCats = [...new Set(
        data
          .filter(item => item.mainCategory === mainCat)
          .map(item => item.subCategory)
      )];

      const subCatNodes: DataNode[] = subCats.map(subCat => {
        const level0Items = data.filter(
          item => item.mainCategory === mainCat && 
                  item.subCategory === subCat && 
                  item.level === 0
        );

        const children: DataNode[] = level0Items.map(item => {
          const itemChildren = buildChildren(item.eccn);
          
          // 🔥 level 0은 title 사용
          const displayTitle = item.title || item.eccn;
          
          return {
            key: item.eccn,
            title: displayTitle,
            children: itemChildren.length > 0 ? itemChildren : undefined,
            isLeaf: itemChildren.length === 0,
            item: item
          };
        });

        return {
          key: subCat,
          title: `${subCat} - ${subcategoryNames[subCat[1]] || ''}`,
          children: children
        };
      });

      tree.push({
        key: mainCat,
        title: categoryNames[mainCat] || mainCat,
        children: subCatNodes
      });
    });

    return tree;
  };

  const onSelectNode = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0] as string;
      
      let item = info.node.item;
      
      if (!item) {
        item = allData.find(d => d.eccn === selectedKey);
      }
      
      if (item) {
        onSelect(selectedKey, item);
      }
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    const timer = setTimeout(() => {
      performSearch(value);
    }, 500) as unknown as number;

    setSearchTimer(timer);
  };

  const performSearch = (value: string) => {
    if (!value) {
      setExpandedKeys(['0', '1', '2', '3', '6']);
      setAutoExpandParent(false);
      return;
    }

    const searchText = value.toLowerCase();
    const matchedKeys: React.Key[] = [];
    const expandKeys: React.Key[] = [];

    allData.forEach(item => {
      const fields = [
        item.eccn,
        item.title,
        item.description,
        item.note,
        item.techInfo,
        item.keywordKor,
        item.keywordEng
      ].map(f => (f || '').toLowerCase());

      if (fields.some(f => f.includes(searchText))) {
        matchedKeys.push(item.eccn);
        
        expandKeys.push(item.mainCategory);
        expandKeys.push(item.subCategory);
        
        const parts = item.eccn.split('.');
        for (let i = 1; i < parts.length; i++) {
          expandKeys.push(parts.slice(0, i).join('.'));
        }
      }
    });

    setExpandedKeys([...new Set(expandKeys)]);
    setAutoExpandParent(true);

    if (matchedKeys.length > 0) {
      message.success(`${matchedKeys.length}개 항목이 검색되었습니다.`);
    } else {
      message.info('검색 결과가 없습니다.');
    }
  };

  if (loading) {
    return <Spin tip="로딩 중..." />;
  }

  return (
    <div>
      <Input
        placeholder="ECCN, 제목, 키워드, 설명으로 검색"
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={onSearchChange}
        style={{ marginBottom: 16 }}
        allowClear
      />
      
      <Tree
        showLine
        showIcon
        treeData={treeData}
        onSelect={onSelectNode}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onExpand={(keys) => {
          setExpandedKeys(keys);
          setAutoExpandParent(false);
        }}
        titleRender={(node: any) => (
          <span
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              
              // 자식이 있으면 펼치기/접기
              if (node.children && node.children.length > 0) {
                const key = node.key;
                if (expandedKeys.includes(key)) {
                  setExpandedKeys(expandedKeys.filter(k => k !== key));
                } else {
                  setExpandedKeys([...expandedKeys, key]);
                }
              }
              
              // 상세 정보 표시
              if (node.item) {
                onSelect(node.key as string, node.item);
              }
            }}
          >
            {node.title}
          </span>
        )}
        style={{ background: '#fafafa', padding: 8, borderRadius: 4 }}
      />
    </div>
  );
};

export default ECCNTreeView;