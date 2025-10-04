import React from 'react';
import Dropdown, { MenuItem } from './component/DropDown/DropDown';
import './App.css';
import ExampleSwitch from './component/Switch/Example/ExampleSwitch';

function App() {
  // 定义多层嵌套菜单项
  const menuItems: MenuItem[] = [
    {
      label: '选项1',
      onClick: () => console.log('选项1被点击')
    },
    {
      label: '选项2',
      disabled: true
    },
    {
      label: '危险选项',
      danger: true,
      onClick: () => console.log('危险选项被点击')
    },
    {
      label: '多级子菜单',
      children: [
        {
          label: '二级菜单1',
          onClick: () => console.log('二级菜单1被点击')
        },
        {
          label: '二级菜单2',
          children: [
            {
              label: '三级菜单1',
              onClick: () => console.log('三级菜单1被点击')
            },
            {
              label: '三级菜单2',
              children: [
                {
                  label: '四级菜单1',
                  onClick: () => console.log('四级菜单1被点击')
                },
                {
                  label: '四级菜单2',
                  onClick: () => console.log('四级菜单2被点击')
                }
              ]
            }
          ]
        },
        {
          label: '二级菜单3',
          danger: true,
          children: [
            {
              label: '危险的三级菜单',
              danger: true,
              onClick: () => console.log('危险的三级菜单被点击')
            }
          ]
        }
      ]
    },
    {
      label: '另一个二级菜单',
      children: [
        {
          label: '普通选项',
          onClick: () => console.log('普通选项被点击')
        },
        {
          label: '禁用选项',
          disabled: true
        }
      ]
    }
  ];

  return (
    <div className="App">
      <ExampleSwitch />
    </div>
  );
}

export default App;