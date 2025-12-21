import React from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';

interface ControlListTreeProps {
  onCheck: (checkedKeys: React.Key[]) => void;
}

const ControlListTree: React.FC<ControlListTreeProps> = ({ onCheck }) => {
  // 카테고리 트리 데이터
  const treeData: DataNode[] = [
    {
      title: 'NSG Part I',
      key: 'nsg-part1',
      children: [
        {
          title: '0A System, Equipment and Components',
          key: '0A',
        },
        {
          title: '0B Test, Inspection and Production Equipment',
          key: '0B',
        },
        {
          title: '0C Materials',
          key: '0C',
        },
        {
          title: '0D Software',
          key: '0D',
        },
        {
          title: '0E Technology',
          key: '0E',
        },
      ],
    },
    {
      title: 'NSG Part II',
      key: 'nsg-part2',
      children: [
        {
          title: '1 Special Materials and Equipments',
          key: '1',
          children: [
            { title: '1A System, Equipment and Components', key: '1A' },
            { title: '1B Test, Inspection and Production Equipment', key: '1B' },
            { title: '1C Materials', key: '1C' },
            { title: '1D Software', key: '1D' },
            { title: '1E Technology', key: '1E' },
          ],
        },
        {
          title: '2 Materials Processing',
          key: '2',
          children: [
            { title: '2A System, Equipment and Components', key: '2A' },
            { title: '2B Test, Inspection and Production Equipment', key: '2B' },
            { title: '2D Software', key: '2D' },
            { title: '2E Technology', key: '2E' },
          ],
        },
        {
          title: '3 Electronics',
          key: '3',
          children: [
            { title: '3A System, Equipment and Components', key: '3A' },
            { title: '3D Software', key: '3D' },
            { title: '3E Technology', key: '3E' },
          ],
        },
        {
          title: '6 Sensors and Lasers',
          key: '6',
          children: [
            { title: '6A System, Equipment and Components', key: '6A' },
            { title: '6E Technology', key: '6E' },
          ],
        },
      ],
    },
    {
      title: 'Other Dual-Use',
      key: 'other',
      children: [
        { title: '4 Computers', key: '4' },
        { title: '5 Telecommunications', key: '5' },
        { title: '7 Navigation and Avionics', key: '7' },
        { title: '8 Marine', key: '8' },
        { title: '9 Aerospace and Propulsion', key: '9' },
      ],
    },
  ];

  return (
    <Tree
      checkable
      defaultExpandAll
      defaultCheckedKeys={['nsg-part1', 'nsg-part2']}
      treeData={treeData}
      onCheck={(checkedKeys) => {
        onCheck(checkedKeys as React.Key[]);
      }}
      style={{ background: '#fafafa', padding: 8 }}
    />
  );
};

export default ControlListTree;