import React, { useState } from "react";
import styles from './Switch.module.less';

interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean, event: React.MouseEvent) => void;
    size?: 'small' | 'medium' | 'large';
    // 用于显示在开关内部的“开启”状态内容
    checkedChildren?: React.ReactNode;
    // 用于显示在开关内部的“关闭”状态内容
    uncheckedChildren?: React.ReactNode;
    className?: string;
}

export default function Switch(props: SwitchProps) {
    const {
        checked,
        defaultChecked = false,
        disabled = false,
        onChange,
        size = 'medium',
        checkedChildren,
        uncheckedChildren,
        className,
    } = props;

    const isControlled = checked !== undefined;
    const [internalActive, setInternalActive] = useState(defaultChecked);
    const active = isControlled ? checked : internalActive;

    const handleClick = (event: React.MouseEvent) => {
        if (disabled) {
            return;
        }
        const nextActive = !active;
        if (!isControlled) {
            setInternalActive(nextActive);
        }
        onChange?.(nextActive, event);
    };

    const rootClassName = `${styles.switch} ${styles[size]} ${disabled ? styles.disabled : ''} ${className || ''}`;
    const trackClassName = `${styles.switchTrack} ${active ? styles.active : ''}`;
    const thumbClassName = `${styles.switchThumb} ${active ? styles.active : ''}`;

    return (
        <div className={rootClassName} onClick={handleClick}>
            <div className={trackClassName}>
                {/*滑块 */}
                <div className={thumbClassName}></div>
                {/* 用于容纳内部文字的容器 */}
                {(checkedChildren || uncheckedChildren) && (
                    <div className={styles.switchInner}>
                        {active ? checkedChildren : uncheckedChildren}
                    </div>
                )}
            </div>
        </div>
    );
}