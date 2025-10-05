import { createContext } from 'react';
import type { MessageApi } from './type';
import message from './index';

const MessageContext = createContext<MessageApi>(message);

export default MessageContext;