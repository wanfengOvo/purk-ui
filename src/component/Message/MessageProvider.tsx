import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { MessageConfig, MessageType } from './type';
import Message from './Message';
import message,  { setMessageHandlers,globalConfig } from './index';
import MessageContext from './MessageContext';


type MessagePlacement = 'top' | 'bottom';

export const MessageProvider = ({
    children,
    placement = 'top' 
}: {
    children: ReactNode;
    placement?: MessagePlacement;
}) => {
    const providerPlacement = placement || globalConfig.placement;
    const [messages, setMessages] = useState<MessageConfig[]>([]);
    const [heights, setHeights] = useState<Record<string, number>>({});


    const add = useCallback((config: MessageConfig) => {

        const configWithPlacement = {
            ...config,
            placement: config.placement || providerPlacement,
        };
        setMessages((prev) => [...prev, configWithPlacement]);
    }, [providerPlacement]); 

    const remove = useCallback((id: string) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setHeights(prev => {
            const newHeights = { ...prev };
            delete newHeights[id];
            return newHeights;
        });
    }, []);

    const removeAll = useCallback((type?: MessageType) => {
        setMessages((prev) => {
            if (!type) {
                setHeights({});
                return [];
            }
            return prev.filter((m) => m.type !== type);
        });
    }, []);


    useEffect(() => {
        setMessageHandlers({ add, remove, removeAll });
        return () => {
            setMessageHandlers(null);
        };
    }, [add, remove, removeAll]);

    const handleHeightReady = useCallback((id: string, height: number) => {
        setHeights(prev => {
            if (prev[id] !== height) return { ...prev, [id]: height };
            return prev;
        });
    }, []);



    const getTopOffset = (index: number, arr: MessageConfig[]): number => {
        let offset = 0;
        const defaultSpacing = 10;
        for (let i = 0; i < index; i++) {
            const msg = arr[i]; // 从传入的 arr 中获取消息
            const messageHeight = heights[msg.id] || 0;
            offset += messageHeight + (msg.offset || defaultSpacing);
        }
        return offset + (arr[index]?.offset || defaultSpacing);
    };

    const getBottomOffset = (index: number, arr: MessageConfig[]): number => {
        let offset = 0;
        const defaultSpacing = 10;
        // 注意：这里的循环逻辑是倒序的，所以用 i > index
        for (let i = arr.length - 1; i > index; i--) {
            const msg = arr[i]; // 从传入的 arr 中获取消息
            const messageHeight = heights[msg.id] || 0;
            offset += messageHeight + (msg.offset || defaultSpacing);
        }
        return offset + (arr[index]?.offset || defaultSpacing);
    };
    const topMessages = messages.filter(m => m.placement === 'top');
    const bottomMessages = messages.filter(m => m.placement === 'bottom');
    return (
        <MessageContext.Provider value={message}>
            {children}
            {createPortal(
                <>
                    {/* 渲染顶部消息队列 */}
                    {topMessages.map((msg, index) => (
                        <Message
                            key={msg.id}
                            {...msg}
                            style={{ 
                                top: `${getTopOffset(index, topMessages)}px`, 
                                zIndex: msg.zIndex 
                            }}
                            placement='top'
                            onHeightReady={handleHeightReady}
                        />
                    ))}
                    {/* 渲染底部消息队列 */}
                    {bottomMessages.map((msg, index) => (
                        <Message
                            key={msg.id}
                            {...msg}
                            style={{ 
                                bottom: `${getBottomOffset(index, bottomMessages)}px`, 
                                zIndex: msg.zIndex 
                            }}
                            placement='bottom'
                            onHeightReady={handleHeightReady}
                        />
                    ))}
                </>,
                document.body
            )}
        </MessageContext.Provider>
    );
};