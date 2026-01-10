import React, { useState } from 'react';
import Splitter from '../Splitter';

const SplitterExample: React.FC = () => {
  // 受控模式的状态
  const [controlledSizes, setControlledSizes] = useState<number[]>([200, 200]);
  const [verticalSizes, setVerticalSizes] = useState<number[]>([150, 150]);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* 水平分割示例 */}
      <div>
        <h2>水平分割示例</h2>
        <Splitter
          orientation="horizontal"
          style={{ height: '300px' }}
          onResize={(sizes) => console.log('水平面板大小变化:', sizes)}
          onResizeEnd={(sizes) => console.log('水平拖拽结束:', sizes)}
        >
          <Splitter.Panel
            defaultSize="30%"
            min="100px"
            style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            左侧面板
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="40%"
            min="100px"
            style={{ backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            右侧面板
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* 垂直分割示例 */}
      <div>
        <h2>垂直分割示例</h2>
        <Splitter
          orientation="vertical"
          lazy={true}
          style={{ height: '400px' }}
          onResize={(sizes) => setVerticalSizes(sizes)}
          onResizeEnd={(sizes) => console.log('垂直拖拽结束:', sizes)}
        >
          <Splitter.Panel
            defaultSize="150px"
            min="80px"
            max="300px"
            style={{ backgroundColor: '#d0f0d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            上方面板
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="150px"
            min="80px"
            max="300px"
            style={{ backgroundColor: '#b0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            下方面板
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* 受控模式示例 */}
      <div>
        <h2>受控模式示例</h2>
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setControlledSizes([100, 300])}
            style={{ marginRight: '10px' }}
          >
            设置左小右大
          </button>
          <button
            onClick={() => setControlledSizes([300, 100])}
          >
            设置左大右小
          </button>
        </div>
        <Splitter
          orientation="horizontal"
          style={{ height: '200px' }}
          onResize={(sizes) => setControlledSizes(sizes)}
          onResizeEnd={(sizes) => console.log('受控模式拖拽结束:', sizes)}
        >
          <Splitter.Panel
            size={controlledSizes[0]}
            min="50px"
            max="400px"
            style={{ backgroundColor: '#ffe0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            受控面板 1 (当前: {controlledSizes[0]}px)
          </Splitter.Panel>
          <Splitter.Panel
            size={controlledSizes[1]}
            min="50px"
            max="400px"
            style={{ backgroundColor: '#e0e0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            受控面板 2 (当前: {controlledSizes[1]}px)
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* 快速折叠示例 - start/end 配置 */}
      <div>
        <h2>快速折叠示例 (start/end 配置)</h2>
        <Splitter
          orientation="horizontal"
          style={{ height: '250px' }}
          onCollapse={(index, collapsed) => console.log(`面板 ${index} 折叠状态:`, collapsed)}
        >
          <Splitter.Panel
            defaultSize="200px"
            collapsible={{ start: false, end: true }} // 只在右侧显示折叠按钮
            style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            面板1 (右侧可折叠)
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="200px"
            collapsible={{ start: true, end: true }} // 两侧都可折叠
            style={{ backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            面板2 (两侧可折叠)
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="200px"
            collapsible={{ start: true, end: false }} // 只在左侧显示折叠按钮
            style={{ backgroundColor: '#d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            面板3 (左侧可折叠)
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* 测试 resizable 功能 - 一个面板不可拖拽 */}
      <div>
        <h2>测试 Resizable 功能</h2>
        <p>当一个面板设置 <code>resizable={false}</code> 时，分隔条将不可拖拽</p>
        <Splitter
          orientation="horizontal"
          style={{ height: '200px' }}
          onResize={(sizes) => console.log('可拖拽面板变化:', sizes)}
          onResizeEnd={(sizes) => console.log('拖拽结束:', sizes)}
        >
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            resizable={false} // 此面板不可拖拽
            style={{ 
              backgroundColor: '#ffe0e0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid red'
            }}
          >
            不可拖拽面板 (红色边框)<br/>resizable=false
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            resizable={true} // 此面板可拖拽，但因为对面面板不可拖拽，所以整体不能拖拽
            style={{ 
              backgroundColor: '#e0e0ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid blue'
            }}
          >
            可拖拽面板 (蓝色边框)<br/>resizable=true<br/>
            <small>但由于左侧面板resizable=false，整个分隔条不可拖拽</small>
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* 测试两个面板都可拖拽的情况 */}
      <div>
        <h2>测试两个面板都可拖拽</h2>
        <p>当两个相邻面板都设置 <code>resizable={true}</code> 时，分隔条可拖拽</p>
        <Splitter
          orientation="horizontal"
          style={{ height: '200px' }}
          onResize={(sizes) => console.log('两个面板都可拖拽:', sizes)}
          onResizeEnd={(sizes) => console.log('拖拽结束:', sizes)}
        >
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            resizable={true} // 此面板可拖拽
            style={{ 
              backgroundColor: '#d4edda', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid green'
            }}
          >
            可拖拽面板 (绿色边框)<br/>resizable=true
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            resizable={true} // 此面板也可拖拽
            style={{ 
              backgroundColor: '#d1ecf1', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid green'
            }}
          >
            可拖拽面板 (绿色边框)<br/>resizable=true
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* 测试混合情况 - 第二个面板不可拖拽 */}
      <div>
        <h2>测试混合情况</h2>
        <p>第一个面板可拖拽，第二个面板不可拖拽</p>
        <Splitter
          orientation="horizontal"
          style={{ height: '200px' }}
          onResize={(sizes) => console.log('混合情况变化:', sizes)}
          onResizeEnd={(sizes) => console.log('拖拽结束:', sizes)}
        >
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            resizable={true} // 此面板可拖拽
            style={{ 
              backgroundColor: '#e0e0ff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid blue'
            }}
          >
            可拖拽面板 (蓝色边框)<br/>resizable=true
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            resizable={false} // 此面板不可拖拽
            style={{ 
              backgroundColor: '#ffe0e0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid red'
            }}
          >
            不可拖拽面板 (红色边框)<br/>resizable=false<br/>
            <small>由于此面板resizable=false，整个分隔条不可拖拽</small>
          </Splitter.Panel>
        </Splitter>
      </div>

      {/* 全功能示例 */}
      <div>
        <h2>全功能示例</h2>
        <Splitter
          orientation="horizontal"
          style={{ height: '300px' }}
          draggerIcon={<div style={{ width: '4px', height: '50%', backgroundColor: '#999', borderRadius: '2px' }} />}
          collapsibleIcon={<span>⚡</span>}
          onResize={(sizes) => console.log('全功能面板大小变化:', sizes)}
          onResizeEnd={(sizes) => console.log('全功能拖拽结束:', sizes)}
          onCollapse={(index, collapsed) => console.log(`全功能面板 ${index} 折叠:`, collapsed)}
        >
          <Splitter.Panel
            defaultSize="25%"
            min="100px"
            max="60%"
            collapsible={true}
            style={{ backgroundColor: '#fff3cd', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffeaa7' }}
          >
            百分比面板 (25%)
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            collapsible={{ start: true, end: true }}
            resizable={false} // 禁用拖拽
            style={{ backgroundColor: '#d1ecf1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bee5eb' }}
          >
            固定大小面板 (不可拖拽)
          </Splitter.Panel>
          <Splitter.Panel
            defaultSize="200px"
            min="100px"
            max="400px"
            collapsible={true}
            style={{ backgroundColor: '#d4edda', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #c3e6cb' }}
          >
            可折叠面板
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
};

export default SplitterExample;