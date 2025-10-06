import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MessageProvider } from './component/Message/MessageProvider.tsx'
import App from './App.tsx'
import message from './component/Message/index.ts'

message.config({
  placement: 'top',
  duration: 3000, // 默认3秒
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MessageProvider>
      <App />
    </MessageProvider>
  </StrictMode>
)
