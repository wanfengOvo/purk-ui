import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MessageConfig } from "./type";
import styles from "./Message.module.less";


const Icon = ({ name, spin }: { name: string; spin?: boolean }) => {
    const iconMap: { [key: string]: string } = {
        info: "ℹ️", success: "✅", warning: "⚠️",
        error: "❌", loading: "🔄", close: "✖️",
    };
    return <span className={spin ? styles.loadingIcon : styles.icon}>{iconMap[name]}</span>;
};


interface MessageProps extends MessageConfig {
    style: React.CSSProperties;
    placement: 'top' | 'bottom';
    onHeightReady: (id: string, height: number) => void;
}

const Message: React.FC<MessageProps> = (props) => {
    const {
        id,
        content,
        type = "info",
        duration = 3000,
        showClose,
        style,
        placement,
        onDestroy,
        onHeightReady,
        onClose,
        onDurationEnd,
    } = props;

    const [visible, setVisible] = useState(false);
    const timerRef = useRef<number | null>(null);
    const messageRef = useRef<HTMLDivElement>(null);


    useLayoutEffect(() => {
        if (messageRef.current) {
            const height = messageRef.current.offsetHeight;
            if (height > 0) {
                onHeightReady(id, height);
            }
        }
    }, [id, onHeightReady]);


    const handleManualClose = () => {
        onClose?.(); // 立即触发 onClose
        setVisible(false); // 然后开始退场动画
    };

    // 处理计时器自然结束
    const handleDurationEnd = () => {
        onDurationEnd?.(); // 立即触发 onDurationEnd
        setVisible(false); // 然后开始退场动画
    };

    const startTimer = () => {
        if (duration === 0) return;
        // 定时器结束时调用 handleDurationEnd
        timerRef.current = window.setTimeout(handleDurationEnd, duration);
    };
    const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

    useEffect(() => {
        setVisible(true);
        startTimer();

        // Escape 键关闭应被视作“手动关闭”
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Escape") {
                handleManualClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            clearTimer();
        };
    }, []);

    const typeIconName = { info: "info", success: "success", warning: "warning", error: "error", loading: "loading" }[type];

    const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
        if (event.propertyName !== 'opacity') return;
        if (!visible) {
            onDestroy();
        }
    };


    const cssClasses = [
        styles.punkMessage,
        styles[type],
        styles[placement],
        showClose ? styles.closable : '',
        visible ? styles.visible : ''
    ].join(' ');

    return (
        <div
            ref={messageRef}
            id={id}
            className={cssClasses}
            style={style}
            role="alert"
            onMouseEnter={clearTimer}
            onMouseLeave={startTimer}
            onTransitionEnd={handleTransitionEnd}
        >
            <Icon name={typeIconName} spin={type === "loading"} />
            <div className={styles.content}>{content}</div>
            {showClose && (
                <div className={styles.close} onClick={handleManualClose}>
                    <Icon name="close" />
                </div>
            )}
        </div>
    );
};

export default Message;