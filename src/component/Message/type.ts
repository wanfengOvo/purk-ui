export const messageTypes = ["info", "success", "warning", "error", "loading"] as const;
export type MessageType = (typeof messageTypes)[number];

export interface MessageConfig {
    id: string;
    content?: React.ReactNode;
    type?: MessageType;
    icon?: React.ReactNode;
    duration?: number;
    //是否展示关闭按钮
    showClose?: boolean;
    zIndex: number;
    offset: number;
    placement?: 'top' | 'bottom'
    onClose?: () => void;
    onDurationEnd?: () => void;
    onDestroy: () => void;
}

interface MessageHandler {
    close: () => void;
}


export type MessageOptions = Partial<Omit<MessageConfig, 'id' | 'zIndex' | 'onDestroy'>>;
export type MessageParams = React.ReactNode | MessageOptions;
export type MessageFn = (config: MessageParams) => MessageHandler;
export type MessageTypeFn = (config: MessageParams) => MessageHandler;

export interface MessageApi extends MessageFn {
    info: MessageTypeFn;
    success: MessageTypeFn;
    warning: MessageTypeFn;
    error: MessageTypeFn;
    loading: MessageTypeFn;
    closeAll: (type?: MessageType) => void;
    config: (config: Partial<{ placement: 'top' | 'bottom'; duration: number; }>) => void;
}