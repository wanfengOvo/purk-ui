import type { ReactNode, PropsWithChildren } from "react";
import { useState, useRef } from "react";
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    arrow as floatingArrow,
    useHover,
    useFocus,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
    FloatingPortal,
    FloatingArrow,
    type Placement
} from "@floating-ui/react";
import styles from './Popover.module.less';
import React from "react";

type SemanticDOM = 'container' | 'content' | 'title' | 'arrow';


interface ClassNamesConfig {
    container?: string | React.CSSProperties;
    content?: string | React.CSSProperties;
    title?: string | React.CSSProperties;
    arrow?: string | React.CSSProperties;
}

export interface PopoverProps {
    content: ReactNode | (() => ReactNode);
    title?: ReactNode | (() => ReactNode);
    trigger?: 'hover' | 'click' | 'focus';
    placement?: Placement;
    arrow?: boolean;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    classNames?: ClassNamesConfig | ((info: { props: PopoverProps }) => ClassNamesConfig);
}

export default function Popover(props: PropsWithChildren<PopoverProps>) {
    const {
        content,
        title,
        trigger = 'hover',
        placement = 'top',
        arrow = true,
        mouseEnterDelay = 100,
        mouseLeaveDelay = 100,
        open: propsOpen,
        onOpenChange,
        children,
        classNames
    } = props;


    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isControlled = propsOpen !== undefined;
    const open = isControlled ? propsOpen : uncontrolledOpen;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!isControlled) {
            setUncontrolledOpen(nextOpen);
        }
        onOpenChange?.(nextOpen);
    };

    const arrowRef = useRef(null);

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: handleOpenChange,
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(10),
            flip(),
            shift(),
            arrow && floatingArrow({ element: arrowRef })
        ].filter(Boolean)
    });

    const hover = useHover(context, {
        enabled: trigger === 'hover',
        delay: { open: mouseEnterDelay, close: mouseLeaveDelay },
        move: false
    });

    const click = useClick(context, {
        enabled: trigger === 'click' && !isControlled,
        toggle: !isControlled
    });

    const focus = useFocus(context, {
        enabled: trigger === 'focus'
    });

    const dismiss = useDismiss(context, {
        enabled: !isControlled
    });

    const role = useRole(context, { role: 'tooltip' });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        hover,
        click,
        focus,
        dismiss,
        role
    ]);

    const renderNode = (node: ReactNode | (() => ReactNode)) => {
        return typeof node === 'function' ? node() : node;
    };

    // 处理 classNames
    const getClassNames = (): ClassNamesConfig => {
        if (!classNames) return {};

        if (typeof classNames === 'function') {
            return classNames({ props });
        }

        return classNames;
    };

    const customClassNames = getClassNames();

    // 合并默认样式和自定义样式
    const mergeStyles = (semantic: SemanticDOM, defaultClassName: string) => {
        const customConfig = customClassNames[semantic];

        if (!customConfig) {
            return { className: defaultClassName };
        }

        if (typeof customConfig === 'string') {
            // 字符串类名
            return { className: `${defaultClassName} ${customConfig}` };
        } else {
            // 样式对象
            return {
                className: defaultClassName,
                style: customConfig
            };
        }
    };

    return (
        <>
            {React.cloneElement(children as React.ReactElement, {
                ref: refs.setReference,
                ...getReferenceProps()
            })}

            <FloatingPortal>
                {open && (
                    <div
                        className={styles.popover}
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {arrow && (
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                fill="#fff"
                                stroke="#f0f0f0"
                                strokeWidth={0}
                                {...(typeof customClassNames.arrow === 'string'
                                    ? { className: customClassNames.arrow }
                                    : { style: customClassNames.arrow as React.CSSProperties }
                                )}
                            />
                        )}
                        <div {...mergeStyles('container', styles.container)}>
                            {title && (
                                <div {...mergeStyles('title', styles.title)}>
                                    {renderNode(title)}
                                </div>
                            )}
                            <div {...mergeStyles('content', styles.content)}>
                                {renderNode(content)}
                            </div>
                        </div>
                    </div>
                )}
            </FloatingPortal>
        </>
    );
}