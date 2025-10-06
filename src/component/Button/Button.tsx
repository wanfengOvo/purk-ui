import React, { useState, useEffect, useMemo } from 'react';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import styles from './Button.module.less';


const LoadingIcon = () => (
    <span className={styles.loadingSpinner} />
);

// 合并 button 和 a 标签的属性
type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type NativeAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;
type MergedProps = Partial<NativeButtonProps & NativeAnchorProps>;

export interface ButtonProps extends MergedProps {
    color?: "primary" | "default" | "danger" | "link" | "text";
    size?: "small" | "middle" | "large";
    href?: string;
    shape?: "default" | "circle" | "round";
    icon?: React.ReactNode;
    loading?: boolean | { delay?: number; icon?: React.ReactNode };
    children?: React.ReactNode;
    className?: string;
}

export default function Button(props: ButtonProps) {
    const {
        color = "default",
        size = "middle",
        shape = "default",
        disabled = false,
        loading = false,
        href,
        icon,
        children,
        className,
        ...restProps
    } = props;

    const [innerLoading, setInnerLoading] = useState(false);

    const loadingConfig = useMemo(() => {
        if (typeof loading === 'object') {
            return {
                isLoading: true,
                delay: loading.delay || 0,
                // 如果用户传入自定义loading icon，就用用户的，否则用我们内置的
                icon: loading.icon || <LoadingIcon />, 
            };
        }
        return {
            isLoading: !!loading,
            delay: 0,
            icon: <LoadingIcon />, // 默认使用内置的 LoadingIcon
        };
    }, [loading]);

    // 处理带 delay 的 loading 状态
    useEffect(() => {
        if (loadingConfig.isLoading && loadingConfig.delay > 0) {
            const timer = setTimeout(() => {
                setInnerLoading(true);
            }, loadingConfig.delay);
            return () => clearTimeout(timer);
        } else {
            setInnerLoading(loadingConfig.isLoading);
        }
    }, [loadingConfig]);
    

    const classes = [
        styles.button,
        styles[`btn-${color}`],
        styles[`btn-${size}`],
        styles[`btn-${shape}`],
        (icon && !children) ? styles['icon-only'] : '',
        innerLoading ? styles.loading : '',
        className,
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || innerLoading;

    const iconNode = innerLoading 
        ? <span className={styles.loadingIcon}>{loadingConfig.icon}</span> 
        : icon 
        ? <span className={styles.icon}>{icon}</span> 
        : null;

    const childrenNode = children ? <span>{children}</span> : null;
    
    if (href && !isDisabled) {
        return (
            <a href={href} className={classes} {...(restProps as NativeAnchorProps)}>
                {iconNode}
                {childrenNode}
            </a>
        );
    }
    
    return (
        <button
            type="button"
            className={classes}
            disabled={isDisabled}
            {...(restProps as NativeButtonProps)}
        >
            {iconNode}
            {childrenNode}
        </button>
    );
}