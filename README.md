# Punk UI - 朋克风React组件库

一个具有朋克风格设计的React组件库，提供了一系列现代化且富有个性的UI组件。

## 🎨 组件库特色

- **霓虹风格设计**: 基于霓虹色的视觉风格，营造出动态和活力的感觉。
- **模块化设计**: 每个组件独立封装，按需引入



## 🚀 快速开始

### 1. 基本使用

```tsx



function App() {
  return (
    <div>
      <Input placeholder="请输入内容" />
      <Switch />
      <Button>点击我</Button>
    </div>
  );
}
```

### 2. 使用Message全局提示

需要在应用根部包裹 [MessageProvider]

```tsx


function App() {
  return (
    <MessageProvider>
      <MyComponent />
    </MessageProvider>
  );
}

function MyComponent() {
  const message = useMessage();
  
  const handleClick = () => {
    message.success('操作成功！');
  };
  
  return <button onClick={handleClick}>显示消息</button>;
}
```

## 🧩 组件列表

### 表单组件
- [Input] - 输入框组件
- [Switch] - 开关组件
- [Button] - 按钮组件

### 反馈组件
- [Message] - 全局提示组件
  - 支持多种类型：info、success、warning、error
  - 可自定义持续时间、位置
  - 支持手动关闭

### 导航组件
- [Tabs]- 标签页组件
- [Dropdown]- 下拉菜单组件

### 其他组件
- 更多组件持续添加中...

