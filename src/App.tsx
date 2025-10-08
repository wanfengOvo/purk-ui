import './styles/global.less'
import { Collapse, type CollapseItemType } from './component/Collapse/Collapse';

export default function App() {
  const complexContent = (
    <div>
      <p>这里可以是任意 JSX 内容。</p>
      <p>比如图片、按钮、或者其他组件。</p>
      <button onClick={() => alert('Clicked!')} style={{ padding: '5px 10px' }}>
        点我
      </button>
    </div>
  );

  // 定义要渲染的数据数组
  const myItems: CollapseItemType[] = [
    {
      key: '1',
      label: <strong>面板标题 1 (加粗)</strong>,
      children: <p>这是面板 1 的内容。</p>,
    },
    {
      key: '2',
      label: '面板标题 2',
      children: complexContent, // 这里传入了复杂的 React 节点
    },
    {
      key: '3',
      label: '禁用的面板',
      children: <p>这段内容默认不可见。</p>,
      disabled: true,
    },
  ];
  
  const handleCollapseChange = (keys: string | string[]) => {
    console.log('当前激活的面板 key:', keys);
  };

  // 嵌套面板数据
  const nestedItems: CollapseItemType[] = [
    {
      key: 'parent-1',
      label: '父级面板 1',
      children: (
        <div>
          <p>这是父级面板 1 的内容。</p>
          <Collapse
            items={[
              {
                key: 'child-1-1',
                label: '子面板 1-1',
                children: (
                  <div>
                    <p>这是嵌套在父级面板 1 中的子面板 1-1 的内容。</p>
                    <Collapse
                      items={[
                        {
                          key: 'grandchild-1-1-1',
                          label: '孙面板 1-1-1',
                          children: <p>这是三级嵌套面板的内容</p>
                        },
                        {
                          key: 'grandchild-1-1-2',
                          label: '孙面板 1-1-2',
                          children: <p>另一个三级嵌套面板的内容</p>
                        }
                      ]}
                      defaultActiveKey="grandchild-1-1-1"
                    />
                  </div>
                )
              },
              {
                key: 'child-1-2',
                label: '子面板 1-2',
                children: <p>这是嵌套在父级面板 1 中的子面板 1-2 的内容。</p>
              }
            ]}
            defaultActiveKey="child-1-1"
          />
        </div>
      )
    },
    {
      key: 'parent-2',
      label: '父级面板 2',
      children: (
        <div>
          <p>这是父级面板 2 的内容。</p>
          <Collapse
            items={[
              {
                key: 'child-2-1',
                label: '子面板 2-1',
                children: (
                  <div>
                    <p>这是嵌套在父级面板 2 中的子面板 2-1 的内容。</p>
                    <Collapse
                      items={[
                        {
                          key: 'grandchild-2-1-1',
                          label: '孙面板 2-1-1',
                          children: (
                            <Collapse
                              items={[
                                {
                                  key: 'great-grandchild-2-1-1-1',
                                  label: '曾孙面板 2-1-1-1',
                                  children: <p>这是四级嵌套面板的内容</p>
                                }
                              ]}
                            />
                          )
                        }
                      ]}
                    />
                  </div>
                )
              }
            ]}
          />
        </div>
      )
    },
    {
      key: 'parent-3',
      label: '复杂内容面板',
      children: (
        <div>
          <p>这个面板包含复杂的内容和嵌套面板：</p>
          <ul>
            <li>列表项 1</li>
            <li>列表项 2</li>
            <li>列表项 3</li>
          </ul>
          <Collapse
            items={[
              {
                key: 'complex-child-1',
                label: '嵌套面板',
                children: (
                  <div>
                    <button onClick={() => alert('按钮被点击了！')}>交互按钮</button>
                    <p>嵌套面板中的内容</p>
                  </div>
                )
              }
            ]}
          />
        </div>
      )
    }
  ];

  // 自定义展开图标函数
  const customExpandIcon = ({ isActive }: { isActive: boolean }) => {
    const style = {
      transition: 'transform 0.2s ease-in-out',
      transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
      color: isActive ? '#00f0ff' : '#d900ff', // 激活时用主色，否则用次要颜色
      marginRight: '4px', // 给图标一点额外空间
      display: 'inline-block',
      fontSize: '18px',
      fontWeight: 'bold'
    };
    return <span style={style}>+</span>; // 用一个简单的 '+' 作为例子
  };

  // 使用自定义图标的面板数据
  const customIconItems: CollapseItemType[] = [
    {
      key: 'custom-1',
      label: '自定义图标面板 1',
      children: <p>这个面板使用了自定义的展开图标。</p>,
      showArrow: true
    },
    {
      key: 'custom-2',
      label: '无图标面板',
      children: <p>这个面板没有展开图标。</p>,
      showArrow: false
    },
    {
      key: 'custom-3',
      label: '另一个自定义图标面板',
      children: (
        <div>
          <p>这个面板也使用了自定义图标，并且包含嵌套面板：</p>
          <Collapse
            items={[
              {
                key: 'nested-custom-1',
                label: '嵌套面板',
                children: <p>嵌套面板内容</p>
              }
            ]}
            expandIcon={customExpandIcon}
          />
        </div>
      ),
      showArrow: true
    }
  ];

  return (
    <div>
      <h2>数据驱动的 Collapse 组件</h2>
      <Collapse
        items={myItems}
        defaultActiveKey="1"
        onChange={handleCollapseChange}
      />

      <h2 style={{ marginTop: '30px' }}>嵌套面板</h2>
      <Collapse
        items={nestedItems}
        defaultActiveKey="parent-1"
      />

      <h2 style={{ marginTop: '30px' }}>自定义图标面板</h2>
      <Collapse
        items={customIconItems}
        defaultActiveKey="custom-1"
        expandIcon={customExpandIcon}
      />
    </div>
  );
}