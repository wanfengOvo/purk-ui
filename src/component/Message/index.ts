

import type { ReactNode } from 'react';
import type { MessageApi, MessageConfig, MessageParams, MessageOptions, MessageType } from './type';
import { messageTypes } from './type';


interface GlobalConfig {
  placement: 'top' | 'bottom';
  duration: number;
}

// 组件的默认设置
export const globalConfig: GlobalConfig = {
  placement: 'top', // 默认从顶部弹出
  duration: 3000,   // 默认持续3秒
};

// 这个函数是唯一修改全局配置的方式
export const setGlobalConfig = (config: Partial<GlobalConfig>) => {
  Object.assign(globalConfig, config);
};

let messageHandlers: {
  add: (config: MessageConfig) => void;
  remove: (id: string) => void;
  removeAll: (type?: MessageType) => void;
} | null = null;


export const setMessageHandlers = (handlers: typeof messageHandlers) => {
  messageHandlers = handlers;
};

let seed = 0;
let zIndex = 2000;

const normalizeOptions = (params: MessageParams): MessageOptions => {
  if (typeof params === 'object' && params !== null && !('$$typeof' in params)) {
    return params as MessageOptions;
  }
  return { content: params as ReactNode };
};

const normalizeParams = (
  content: ReactNode | MessageOptions,
  duration?: number,
  placement?: 'top' | 'bottom',
  onClose?: () => void,
  onDurationEnd?: () => void,
): MessageOptions => {
  // 检查第一个参数是否为配置对象
  if (typeof content === 'object' && content !== null && !('$$typeof' in content)) {
    return content as MessageOptions;
  }

  // 否则，按顺序解析参数
  const options: MessageOptions = { content };
  if (duration !== undefined) {
    options.duration = duration;
  }
  if (placement !== undefined) {
    options.placement = placement;
  }
  if (onClose !== undefined) {
    options.onClose = onClose;
  }
  if (onDurationEnd !== undefined) {
    options.onDurationEnd = onDurationEnd;
  }
  return options;
};

const message: Partial<MessageApi> = (options: MessageParams) => {
  if (!messageHandlers) {
    console.warn('MessageProvider is not mounted. Messages will not be displayed.');
    return { close: () => { } };
  }

  const id = `message_${seed++}`;
  const normalizedOptions = normalizeOptions(options);

  const props: MessageConfig = {
    offset: 10,
    // 默认 duration 从全局配置读取
    duration: globalConfig.duration,
    // 关键逻辑：优先使用单次调用时传入的 placement，如果没有，就使用全局配置的 placement
    placement: normalizedOptions.placement || globalConfig.placement,
    // 展开 normalizedOptions，这样单次调用传入的 duration 或 content 就会覆盖掉默认值
    ...normalizedOptions,
    id,
    zIndex: zIndex++,
    onDestroy: () => messageHandlers?.remove(id),
  };

  messageHandlers.add(props);

  return { close: () => messageHandlers?.remove(id) };
};

message.config = setGlobalConfig;

message.closeAll = (type?: MessageType) => {
  messageHandlers?.removeAll(type);
};


messageTypes.forEach((type) => {
  message[type] = (
    content: ReactNode | MessageOptions,
    duration?: number,
    placement?: 'top' | 'bottom',
    onClose?: () => void,
    onDurationEnd?: () => void,

  ) => {
    const normalized = normalizeParams(content, duration, placement, onClose, onDurationEnd);
    return (message as MessageApi)({ ...normalized, type });
  };
});

export default message as MessageApi;