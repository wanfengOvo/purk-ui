// App.tsx


import { useMessage } from './component/Message/useMessage';


function App() {
  const message = useMessage();

  const showMessageWithCallback = () => {

    message.success({
      content: '操作成功！此消息关闭后会弹出一条新消息。',
      duration: 3000,
      placement: 'top',
      onClose: () => {
        console.log('第一条消息已关闭！');
        // 在回调中触发第二个消息
        message.info({
          content: '这是第一条消息关闭后触发的消息！',
          placement: 'bottom'
        });
      },
    });
  };

  const showInteractiveMessage = () => {
    message.info({
      content: '请在5秒内手动关闭我，或者等待它自己消失。',
      duration: 5000,
      showClose: true, // 显示关闭按钮
      placement: 'top',
      // 用户点击关闭按钮时触发
      onClose: () => {
        message.error({
          content: 'Callback: Message was CLOSED BY USER!',
          placement: 'bottom',
        });
      },
      // 计时器走完后触发
      onDurationEnd: () => {
        message.success({
          content: 'Callback: Message faded on its own (TIMER ENDED).',
          placement: 'bottom',
        });
      },
    });
  };
  const showDefault = () => {
    message.success('Show with default placement (top)');
  };

  const showFromBottom = () => {
    message.info({
      content: 'This message comes from the bottom!',
      duration: 5000,
      placement: 'bottom',
      showClose: true
    });
  };

  const showFromTopExplicitly = () => {
    message.warning({
      content: 'This message comes from the top!',
      duration: 5000,
      placement: 'top'
    });
  };

  const showFromBottomObject = () => {
    message.error({
      content: 'Error from bottom (using object API)',
      placement: 'bottom',
    });
  };

  const showBoth = () => {
    // 快速触发顶部和底部的消息，观察它们是否能和谐共存
    message.success({
      content: 'success!',
      duration: 5000,
      placement: 'bottom'
    });
    setTimeout(() => {
      message.error({
        content: 'A message at the bottom.',
        duration: 3000,
        placement: 'bottom'
      });
    }, 300);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Message Component Final Demo</h1>
        <p>
          Global default placement is set to <strong>'top'</strong> in{' '}
          <code>main.tsx</code>.
        </p>
      </header>

      <main>
        <div className="button-group">
          <h2>Click to trigger messages:</h2>
          <div className="action-buttons">
            <button onClick={showDefault}>Show Default (Top)</button>
            <button onClick={showFromBottom}>Show From Bottom</button>
            <button onClick={showFromTopExplicitly}>Show From Top</button>
            <button onClick={showFromBottomObject}>Show From Bottom (Object)</button>
            <button onClick={showBoth} className="special">Show Both Stacks</button>
            <button onClick={showMessageWithCallback}>Show With Callback</button>
            <button onClick={showInteractiveMessage}>Show Interactive</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;