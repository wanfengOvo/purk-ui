import React, { useState } from 'react';
import Tabs, { type TabItem } from '../Tabs'; 
import '../Tabs.module.less';            
import './Example.css';                   



// 1. 基础数据，用于非受控和位置演示
const basicTabsData: TabItem[] = [
  { key: 'basic-1', title: '概览', content: '这是“概览”标签页的内容。' },
  { key: 'basic-2', title: '规格', content: '这里是“规格”的详细信息。' },
  { key: 'basic-3', title: '日志', content: '系统运行日志。', closable: true },
  { key: 'basic-4', title: '终端', content: '这是一个被禁用的终端。', disabled: true },
];

// 2. 嵌套数据，用于嵌套和关闭功能演示
const createNestedTabsData = (): TabItem[] => [
  {
    key: 'dash',
    title: '仪表盘',
    content: '主仪表盘，显示关键性能指标。',
  },
  {
    key: 'sys',
    title: '系统管理',
    closable: true,
    children: [
      { key: 'sys-users', title: '用户配置', content: '管理系统用户权限。', closable: true },
      { key: 'sys-logs', title: '系统日志', content: '查看详细系统日志。' },
      {
        key: 'sys-net',
        title: '网络',
        closable: true,
        children: [
          { key: 'net-firewall', title: '防火墙', content: '配置网络防火墙规则。', closable: true },
          { key: 'net-vpn', title: 'VPN', content: '设置 VPN 连接。' },
        ],
      },
    ],
  },
  { key: 'db', title: '数据库', content: '数据库连接和状态。' },
];


/**
 * 一个功能完备的 Tabs 组件展示页面
 */
const TabsExample: React.FC = () => {
  // --- 为受控组件准备 State ---
  const [controlledKey, setControlledKey] = useState<string | null>('basic-2');

  // --- 为嵌套和关闭功能准备 State ---
  const [interactiveTabs, setInteractiveTabs] = useState<TabItem[]>(createNestedTabsData());

  // --- 为动态位置演示准备 State ---
  const [dynamicPosition, setDynamicPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  return (
    <div className="tabs-example-container">
      <h1>Tabs 组件功能展示</h1>

      {/* --- 1. 非受控组件演示 --- */}
      <div className="example-section">
        <h2>非受控模式 (Uncontrolled)</h2>
        <p>组件内部管理自己的状态。通过 `defaultActiveKey` 设置初始选中的标签。</p>
        <Tabs
          tabs={basicTabsData}
          defaultActiveKey="basic-1"
        />
      </div>

      {/* --- 2. 受控组件演示 --- */}
      <div className="example-section">
        <h2>受控模式 (Controlled)</h2>
        <p>由父组件通过 `activeKey` 和 `onChange` 控制状态。当前选中: <strong>{controlledKey}</strong></p>
        <div className="controls">
          <button onClick={() => setControlledKey('basic-1')}>激活 "概览"</button>
          <button onClick={() => setControlledKey('basic-2')}>激活 "规格"</button>
          <button onClick={() => setControlledKey('basic-3')}>激活 "日志"</button>
        </div>
        <Tabs
          tabs={basicTabsData}
          activeKey={controlledKey}
          onChange={setControlledKey}
        />
      </div>
      
      {/* --- 3. 嵌套与关闭功能演示 --- */}
      <div className="example-section">
        <h2>嵌套 & 可关闭 (Nested & Closable)</h2>
        <p>展示多层级嵌套的 Tabs，并可通过 `onTabsChange` 回调来响应关闭事件。</p>
        <Tabs
          tabs={interactiveTabs}
          defaultActiveKey="sys"
          onTabsChange={setInteractiveTabs}
        />
      </div>

      {/* --- 4. 四个方向演示 --- */}
      <div className="example-section">
        <h2>四个方向 (Positions)</h2>
        <p>动态切换 `position` prop 来改变标签栏的位置。</p>
        <div className="controls">
          <button onClick={() => setDynamicPosition('top')}>Top</button>
          <button onClick={() => setDynamicPosition('bottom')}>Bottom</button>
          <button onClick={() => setDynamicPosition('left')}>Left</button>
          <button onClick={() => setDynamicPosition('right')}>Right</button>
        </div>
        {/* 当 position 切换时，使用 key 来强制重新挂载组件，以获得最干净的渲染效果 */}
        <Tabs
          key={dynamicPosition} 
          tabs={basicTabsData}
          defaultActiveKey="basic-1"
          position={dynamicPosition}
        />
      </div>
    </div>
  );
};

export default TabsExample;