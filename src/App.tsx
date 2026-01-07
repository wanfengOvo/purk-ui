import React, { useState } from 'react';
import Drawer from './component/Drawer/Drawer';

const App: React.FC = () => {
  // 控制抽屉开关状态
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  
  // 嵌套抽屉状态
  const [nestedOpen, setNestedOpen] = useState(false);
  const [childrenDrawer, setChildrenDrawer] = useState(false);

  // 演示可调整大小的抽屉状态
  const [resizableSize, setResizableSize] = useState(400);

  const showDrawer = () => {
    setNestedOpen(true);
  };

  const onClose = () => {
    setNestedOpen(false);
  };

  const showChildrenDrawer = () => {
    setChildrenDrawer(true);
  };

  const onChildrenDrawerClose = () => {
    setChildrenDrawer(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Drawer 组件功能演示</h1>
      
      {/* 基础抽屉按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setOpen(true)}>打开基础抽屉</button>
      </div>
      
      {/* 不同位置的抽屉按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setOpen2(true)} style={{ marginRight: '10px' }}>底部抽屉</button>
        <button onClick={() => setOpen3(true)} style={{ marginRight: '10px' }}>左侧抽屉</button>
      </div>
      
      {/* 可调整大小的抽屉按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setResizableSize(400)}>设置大小为400px</button>
        <span style={{ margin: '0 10px' }}>当前大小: {resizableSize}px</span>
      </div>

      {/* 嵌套抽屉按钮 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={showDrawer}>打开嵌套抽屉</button>
      </div>

      {/* 基础抽屉 - 右侧 */}
      <Drawer
        title="基础抽屉示例"
        placement="right"
        size="default"
        open={open}
        mask={true}
        maskClosable={true}
        closable={true}
        onClose={() => setOpen(false)}
        extra={
          <div style={{ fontSize: '14px', color: '#666' }}>
            额外信息
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setOpen(false)}>取消</button>
            <button onClick={() => setOpen(false)} style={{ backgroundColor: '#1890ff', color: 'white' }}>
              确认
            </button>
          </div>
        }
      >
        <div>
          <p>这是抽屉内容区域</p>
          <p>您可以在这里放置任何内容</p>
          <p>抽屉支持多种配置选项</p>
          <ul>
            <li>位置: 左、右、上、下</li>
            <li>尺寸: 预设(default/large)或自定义数值</li>
            <li>遮罩: 可控制是否显示及模糊效果</li>
            <li>可关闭: 可控制关闭按钮及位置</li>
          </ul>
        </div>
      </Drawer>

      {/* 底部抽屉 */}
      <Drawer
        title="底部抽屉"
        placement="bottom"
        size={300}
        open={open2}
        mask={{ enabled: true, blur: true }}
        maskClosable={true}
        closable={{ closeIcon: '✕', placement: 'start' }}
        onClose={() => setOpen2(false)}
      >
        <div>
          <p>这是一个从底部弹出的抽屉</p>
          <p>支持模糊遮罩效果</p>
          <p>关闭按钮在左侧</p>
        </div>
      </Drawer>

      {/* 左侧抽屉，带可调整大小功能 */}
      <Drawer
        title="可调整大小的抽屉"
        placement="left"
        size={resizableSize}
        open={open3}
        mask={true}
        maskClosable={true}
        closable={true}
        resizable={{
          onResize: (size) => setResizableSize(size),
          onResizeStart: () => console.log('开始调整大小'),
          onResizeEnd: () => console.log('调整大小结束')
        }}
        onClose={() => setOpen3(false)}
        extra={
          <div style={{ fontSize: '12px', color: '#999' }}>
            拖拽边缘可调整大小
          </div>
        }
      >
        <div>
          <p>当前尺寸: {resizableSize}px</p>
          <p>您可以拖拽边缘调整抽屉大小</p>
          <p>最小尺寸限制为200px</p>
          <div style={{ marginTop: '20px' }}>
            <h4>功能说明:</h4>
            <ul>
              <li>支持上下左右四个方向</li>
              <li>拖拽边缘可调整大小</li>
              <li>最小尺寸限制为200px</li>
              <li>支持调整时的回调函数</li>
            </ul>
          </div>
        </div>
      </Drawer>

      {/* 嵌套抽屉 - 类似 Ant Design 的示例 */}
      <Drawer 
        title="Multi-level drawer" 
        size={520} 
        closable={false} 
        onClose={onClose} 
        open={nestedOpen}
        placement="right"
      >
        <div>
          <button 
            onClick={showChildrenDrawer}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Two-level drawer
          </button>
          <p>这是外层抽屉的内容</p>
          <p>点击上面的按钮打开内层抽屉</p>
        </div>
        
        {/* 内层抽屉 - 嵌套在内容区域中 */}
        <Drawer
          title="Two-level Drawer"
          size={320}
          closable={false}
          onClose={onChildrenDrawerClose}
          open={childrenDrawer}
          placement="right"
        >
          <div>
            <p>This is two-level drawer</p>
            <p>这是内层抽屉的内容</p>
            <p>它正确地嵌套在外层抽屉内部</p>
            <p>层级管理正常工作</p>
          </div>
        </Drawer>
      </Drawer>

    </div>
  );
};

export default App;