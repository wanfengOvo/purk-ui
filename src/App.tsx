import { useState } from 'react';
import Cascader, { CascaderOption } from './component/Cascader/Cascader';
import Button from './component/Button/Button';
import Modal from './component/Modal/Modal';
import './styles/global.less'
const cyberOptions: CascaderOption[] = [
  {
    value: 'corp',
    label: 'Corporations',
    children: [
      {
        value: 'arasaka',
        label: 'Arasaka',
        children: [
          { value: 'arasaka-security', label: 'Security' },
          { value: 'arasaka-rd', label: 'R&D' },
        ],
      },
      { value: 'militech', label: 'Militech' },
    ],
  },
  {
    value: 'gang',
    label: 'Gangs',
    children: [
      { value: 'maelstrom', label: 'Maelstrom' },
      { value: 'voodoo-boys', label: 'Voodoo Boys' },
      { value: 'valentinos', label: 'Valentinos' },
    ],
  },
];

export default function MyPage() {
  // 初始值只传入 'arasaka'，而不包括父级路径
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalData, setModalData] = useState<string | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsLoading(true);
    setModalData(null); // 清空旧数据

    // 模拟一个2秒的API请求
    setTimeout(() => {
      setModalData("这里是从服务器加载的详细信息。加载完成！");
      setIsLoading(false);
    }, 2000);
  };
  
  const handleOk = () => {
    console.log("点击了确定");
    setIsModalOpen(false);
  };
  
  const handleClose = () => {
    console.log("关闭模态框");
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button color="primary" onClick={() => setOpen(true)}>
        Open Custom Styled Modal
      </Button>

      <Modal
        open={open}
        onOk={() => setOpen(false)}
        onClose={() => setOpen(false)}
        title="Custom Styled Modal"
        content={<p>You can style every part of this modal individually.</p>}
        styles={{
          mask: {
            backgroundColor: 'rgba(50, 150, 50, 0.2)', // Greenish transparent mask
          },
          header: {
            backgroundColor: '#f0f9ff', // Light blue header
            borderBottom: '2px solid #1890ff',
          },
          body: {
            fontSize: '16px',
            minHeight: '100px',
          },
          footer: {
            textAlign: 'center', // Center the footer buttons
          },
          content: {
            borderRadius: '16px', // More rounded corners
          }
        }}
      />

      <Button color="primary" onClick={handleOpenModal}>
        打开模态框 (带加载效果)
      </Button>

      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onClose={handleClose}
        title="加载数据示例"
        // 关键：将 loading 状态传递给 Modal
        loading={isLoading} 
        content={
          <div>
            <p>{modalData}</p>
          </div>
        }
      />
    </div>
  );
}