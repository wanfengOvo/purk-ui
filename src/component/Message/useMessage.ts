import { useContext } from 'react';
import MessageContext from './MessageContext';
import type { MessageApi } from './type';

export const useMessage = (): MessageApi => {
  const messageApi = useContext(MessageContext);
  return messageApi;
};