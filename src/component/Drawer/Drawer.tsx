import React, {
    type PropsWithChildren,
    useEffect,
    useRef,
    useState,
    createContext,
    useContext
} from "react";
import { createPortal } from "react-dom";
import styles from './Drawer.module.less';


// 用于存储当前层级的 z-index，初始值为 undefined
const DrawerContext = createContext<number | undefined>(undefined);

type ResizableConfig = {
    onResizeStart?: () => void;
    onResize?: (size: number) => void;
    onResizeEnd?: () => void;
}

interface DrawerProps {
    size?: 'default' | 'large' | number;
    title?: React.ReactNode;
    placement?: 'left' | 'right' | 'top' | 'bottom';
    extra?: React.ReactNode;
    footer?: React.ReactNode;
    mask?: boolean | { enabled?: boolean, blur?: boolean };
    open?: boolean;
    maskClosable?: boolean;
    closable?: boolean | { closeIcon?: React.ReactNode; disabled?: boolean; placement?: 'start' | 'end' };
    resizable?: boolean | ResizableConfig;
    zIndex?: number; // 用户仍然可以强制指定，优先级最高
    onClose?: () => void;
}

const PRESET_SIZE = {
    default: 378,
    large: 736
};

export default function Drawer(props: PropsWithChildren<DrawerProps>) {
    const {
        size = 'default',
        title,
        placement = 'right',
        extra,
        footer,
        mask = true,
        open = false,
        maskClosable = true,
        closable = true,
        resizable = false,
        zIndex: customZIndex, // 获取用户手动传入的 zIndex
        onClose,
        children
    } = props;

    // --- 自动 Z-Index 逻辑 ---
    // 获取父级 Drawer 的 z-index
    const parentZIndex = useContext(DrawerContext);

    // 计算当前 Drawer 的 z-index
    // 规则：
    // - 如果用户传了 props.zIndex，以用户为准
    // - 如果有父级，当前 = 父级 + 10 (加10是为了给 Drawer 内部的 Tooltip/Popover 留点空间)
    // - 如果是顶层，默认 1000
    const currentZIndex = customZIndex ?? (parentZIndex ? parentZIndex + 10 : 1000);


    const getInitialSize = () => {
        if (typeof size === 'number') return size;
        return PRESET_SIZE[size] || PRESET_SIZE.default;
    };

    const [currentSize, setCurrentSize] = useState<number>(getInitialSize());
    const [isResizing, setIsResizing] = useState(false);

    const propsRef = useRef(props);
    propsRef.current = props;

    useEffect(() => {
        if (!isResizing) {
            setCurrentSize(getInitialSize());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size, isResizing]);

    const resizingRef = useRef({ startSize: 0, startPos: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!resizable) return;
        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as Element).setPointerCapture(e.pointerId);

        const config = typeof resizable === 'object' ? resizable : {};
        config.onResizeStart?.();

        setIsResizing(true);
        resizingRef.current = {
            startSize: currentSize,
            startPos: (propsRef.current.placement === 'left' || propsRef.current.placement === 'right') ? e.clientX : e.clientY
        };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!(e.currentTarget as Element).hasPointerCapture(e.pointerId)) return;

        const { startSize, startPos } = resizingRef.current;
        const currentPlacement = propsRef.current.placement || 'right';
        const currentResizable = propsRef.current.resizable;
        let delta = 0;

        switch (currentPlacement) {
            case 'right': delta = startPos - e.clientX; break;
            case 'left': delta = e.clientX - startPos; break;
            case 'bottom': delta = startPos - e.clientY; break;
            case 'top': delta = e.clientY - startPos; break;
        }

        const newSize = Math.max(200, startSize + delta);
        if (typeof currentResizable === 'object' && currentResizable?.onResize) {
            currentResizable.onResize(newSize);
        }
        setCurrentSize(newSize);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isResizing) return;
        setIsResizing(false);
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        const currentResizable = propsRef.current.resizable;
        if (typeof currentResizable === 'object') {
            currentResizable.onResizeEnd?.();
        }
    };


    const maskEnabled = typeof mask === 'object' ? (mask.enabled ?? true) : mask;
    const maskBlur = typeof mask === 'object' ? mask.blur : false;
    const isClosable = typeof closable === 'object' ? true : closable;
    const closeIcon = (typeof closable === 'object' && closable.closeIcon) ? closable.closeIcon : 'x';
    const closeBtnDisabled = typeof closable === 'object' ? closable.disabled : false;
    const closeBtnPlacement = (typeof closable === 'object' && closable.placement) ? closable.placement : 'end';

    const handleClose = () => onClose?.();
    const handleMaskClick = () => { if (maskClosable) handleClose(); };

    const isHorizontal = placement === 'left' || placement === 'right';
    const wrapperStyle: React.CSSProperties = {
        width: isHorizontal ? `${currentSize}px` : '100%',
        height: isHorizontal ? '100%' : `${currentSize}px`,
        transition: isResizing ? 'none' : undefined
    };

    const wrapperClasses = `
        ${styles.wrapper} 
        ${styles[placement]} 
        ${open ? styles.wrapperOpen : ''}
        ${isResizing ? styles.resizing : ''}
    `.trim();

    const maskClasses = `
        ${styles.mask} 
        ${open ? styles.maskVisible : ''}
        ${maskBlur ? styles.maskBlur : ''}
    `.trim();

    // 内联样式覆盖 z-index
    // 如果关闭，设为 -1 双重保险；如果开启，使用计算好的 currentZIndex
    const drawerStyle: React.CSSProperties = {
        zIndex: open ? currentZIndex : -1,
    };

    const drawerRoot = (
        <div className={`${styles.drawer} ${open ? styles.open : ''}`} style={drawerStyle}>
            {maskEnabled && (
                <div className={maskClasses} onClick={handleMaskClick} />
            )}

            <div className={wrapperClasses} style={wrapperStyle}>
                {resizable && (
                    <div
                        className={styles.resizableDragger}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    />
                )}

                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            {isClosable && closeBtnPlacement === 'start' && (
                                <button className={styles.closeBtn} onClick={handleClose} disabled={closeBtnDisabled} style={{ marginRight: 12 }}>
                                    {closeIcon}
                                </button>
                            )}
                            <div className={styles.title}>{title}</div>
                            {extra && <div style={{ marginLeft: 'auto' }}>{extra}</div>}
                            {isClosable && closeBtnPlacement === 'end' && (
                                <button className={styles.closeBtn} onClick={handleClose} disabled={closeBtnDisabled} style={{ marginLeft: 12 }}>
                                    {closeIcon}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.body}>
                        <DrawerContext.Provider value={currentZIndex}>
                            {children}
                        </DrawerContext.Provider>
                    </div>

                    {footer && <div className={styles.footer}>{footer}</div>}
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(drawerRoot, document.body);
}