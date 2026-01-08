import React, {
    useRef,
    useState,
    useEffect,
    useMemo,
    Children,
    isValidElement,
    type PropsWithChildren,
    type ReactElement,
    type CSSProperties,
} from 'react';
import styles from './Splitter.module.less';
import { pxToNumber } from '../../utils/util';
import type { CollapsibleType, Orientation } from './interface';


export interface PanelProps {
    className?: string;
    style?: CSSProperties;
    collapsible?: CollapsibleType;
    defaultSize?: number | string;
    max?: number | string;
    min?: number | string;
    resizable?: boolean;
    size?: number | string;
}

export interface SplitterProps {
    className?: string;
    style?: CSSProperties;
    collapsibleIcon?: React.ReactNode;
    draggerIcon?: React.ReactNode;
    onCollapse?: (index: number, collapsed: boolean) => void;
    orientation?: Orientation;
    onResize?: (sizes: number[]) => void;
    onResizeEnd?: (sizes: number[]) => void;
    onResizeStart?: (sizes: number[]) => void;
    lazy?: boolean;
}

const SplitterPanel = (props: PropsWithChildren<PanelProps>) => {
    const { children, className, style } = props;
    return (
        <div className={`${styles.panel} ${className || ''}`} style={style}>
            {children}
        </div>
    );
};

const Splitter: React.FC<PropsWithChildren<SplitterProps>> & { Panel: typeof SplitterPanel } = (props) => {
    const {
        children,
        orientation = 'horizontal',
        lazy = false,
        className,
        style,
        draggerIcon,
        collapsibleIcon,
        onResizeStart,
        onResize,
        onResizeEnd,
        onCollapse,
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const isHorizontal = orientation === 'horizontal';

    const panels = useMemo(() => {
        return Children.toArray(children).filter(
            (child): child is ReactElement<PropsWithChildren<PanelProps>> =>
                isValidElement(child) && child.type === SplitterPanel
        );
    }, [children]);

    const [panelSizes, setPanelSizes] = useState<(number | undefined)[]>([]);
    const [collapsedIndices, setCollapsedIndices] = useState<Set<number>>(new Set());
    const [cachedSizes, setCachedSizes] = useState<Map<number, number>>(new Map());

    const [isDragging, setIsDragging] = useState(false);
    const [activeResizerIndex, setActiveResizerIndex] = useState<number | null>(null);
    const [ghostPosition, setGhostPosition] = useState<number | null>(null);

    const dragRef = useRef<{
        startX: number;
        startSizes: (number | undefined)[];
        totalSize: number;
        index: number;
        finalSizes?: (number | undefined)[];
        initialResizerPos: number;
    } | null>(null);

    // 初始化尺寸逻辑
    useEffect(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal ? rect.width : rect.height;

        setPanelSizes((prev) => {
            if (prev.length !== panels.length) {
                return panels.map(p => pxToNumber(p.props.size ?? p.props.defaultSize, totalSize));
            }
            const next = [...prev];
            let hasChange = false;
            panels.forEach((panel, index) => {
                if (panel.props.size !== undefined) {
                    const newSizePx = pxToNumber(panel.props.size, totalSize);
                    if (newSizePx !== next[index]) {
                        next[index] = newSizePx;
                        hasChange = true;
                    }
                }
            });
            return hasChange ? next : prev;
        });
    }, [panels, isHorizontal]);

    const getConstrainedSize = (targetIndex: number, newSize: number, totalSize: number): number => {
        const panelProps = panels[targetIndex]?.props;
        if (!panelProps) return newSize;
        const min = pxToNumber(panelProps.min, totalSize) ?? 0;
        const max = pxToNumber(panelProps.max, totalSize) ?? totalSize;
        return Math.max(min, Math.min(max, newSize));
    };


    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
        if (!containerRef.current) return;
        e.preventDefault();
        e.stopPropagation();

        // 设置指针捕获，后续的 move/up 事件都会发给这个元素，即使鼠标移出去了
        e.currentTarget.setPointerCapture(e.pointerId);

        const containerRect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal ? containerRect.width : containerRect.height;

        const currentNodes = containerRef.current.children;
        const prevNode = currentNodes[index * 2] as HTMLElement;
        const nextNode = currentNodes[index * 2 + 2] as HTMLElement;
        const resizerNode = e.currentTarget; // 直接使用触发事件的元素

        if (!prevNode || !nextNode) return;

        const prevSizePx = isHorizontal ? prevNode.offsetWidth : prevNode.offsetHeight;
        const nextSizePx = isHorizontal ? nextNode.offsetWidth : nextNode.offsetHeight;

        const resizerRect = resizerNode.getBoundingClientRect();
        const initialResizerPos = isHorizontal
            ? resizerRect.left - containerRect.left
            : resizerRect.top - containerRect.top;

        const newStartSizes = [...panelSizes];
        newStartSizes[index] = prevSizePx;
        newStartSizes[index + 1] = nextSizePx;

        dragRef.current = {
            startX: isHorizontal ? e.clientX : e.clientY,
            startSizes: newStartSizes,
            totalSize,
            index,
            initialResizerPos,
            finalSizes: newStartSizes,
        };

        setActiveResizerIndex(index);
        setIsDragging(true);
        if (lazy) setGhostPosition(initialResizerPos);
        onResizeStart?.(newStartSizes.map(s => s || 0));
    };


    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !dragRef.current) return;

        const { startX, startSizes, totalSize, index, initialResizerPos, finalSizes } = dragRef.current;
        const currentPos = isHorizontal ? e.clientX : e.clientY;
        const delta = currentPos - startX;

        const prevIdx = index;
        const nextIdx = index + 1;
        const startPrev = startSizes[prevIdx] as number;
        const startNext = startSizes[nextIdx] as number;

        // 计算原始值
        let newPrevRaw = startPrev + delta;
        const constrainedPrevRaw = getConstrainedSize(prevIdx, newPrevRaw, totalSize);
        const validDeltaPrev = constrainedPrevRaw - startPrev;

        let constrainedNextRaw = startNext - validDeltaPrev;
        constrainedNextRaw = getConstrainedSize(nextIdx, constrainedNextRaw, totalSize);

        const finalNextRaw = constrainedNextRaw;
        const finalPrevRaw = startPrev + (startNext - finalNextRaw);


        const finalPrev = Math.round(finalPrevRaw);
        const finalNext = Math.round(finalNextRaw);

        // 防抖/脏检查：如果取整后的值和上一次记录的值一样，直接忽略，不触发 React 渲染和回调
        if (finalSizes && finalSizes[prevIdx] === finalPrev && finalSizes[nextIdx] === finalNext) {
            return;
        }

        // 构造新的尺寸数组
        const nextSizes = [...(finalSizes || startSizes)];
        nextSizes[prevIdx] = finalPrev;
        nextSizes[nextIdx] = finalNext;

        // 更新 ref 中的记录
        dragRef.current.finalSizes = nextSizes;

        if (lazy) {
            setGhostPosition(Math.round(initialResizerPos + validDeltaPrev));
        } else {
            setPanelSizes(prev => {
                const next = [...prev];
                if (next[prevIdx] === finalPrev && next[nextIdx] === finalNext) return prev;
                next[prevIdx] = finalPrev;
                next[nextIdx] = finalNext;
                return next;
            });
            onResize?.(nextSizes.map(s => s || 0));
        }
    };


    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        e.currentTarget.releasePointerCapture(e.pointerId);

        if (dragRef.current) {
            const { finalSizes } = dragRef.current;
            if (lazy && finalSizes) {
                setPanelSizes(finalSizes);
                onResize?.(finalSizes.map(s => s || 0));
            }
            // 确保结束时也是整洁的整数
            onResizeEnd?.(finalSizes ? finalSizes.map(s => s || 0) : []);
        }

        setIsDragging(false);
        setActiveResizerIndex(null);
        setGhostPosition(null);
        dragRef.current = null;
    };


    const handleCollapse = (index: number, type: 'prev' | 'next') => {
        if (!containerRef.current) return;
        const prevIdx = index;
        const nextIdx = index + 1;

        const isPrevCollapsed = collapsedIndices.has(prevIdx);
        const isNextCollapsed = collapsedIndices.has(nextIdx);

        const currentNodes = containerRef.current.children;
        const prevNode = currentNodes[prevIdx * 2] as HTMLElement;
        const nextNode = currentNodes[nextIdx * 2] as HTMLElement;
        const currentPrevSize = isHorizontal ? prevNode?.offsetWidth : prevNode?.offsetHeight;
        const currentNextSize = isHorizontal ? nextNode?.offsetWidth : nextNode?.offsetHeight;


        const updateSizes = (tIdx: number, nIdx: number, tSize: number, nSize: number) => {
            setPanelSizes(prev => {
                const next = [...prev];
                next[tIdx] = tSize;
                next[nIdx] = nSize;
                return next;
            });
        };

        if (type === 'prev') {
            if (isNextCollapsed) {
                // 展开右侧
                const restoredSize = cachedSizes.get(nextIdx) ?? 50;
                const newPrevSize = Math.max(0, currentPrevSize - restoredSize);
                setCollapsedIndices(s => { const newSet = new Set(s); newSet.delete(nextIdx); return newSet; });
                updateSizes(nextIdx, prevIdx, restoredSize, newPrevSize);
                onCollapse?.(nextIdx, false);
            } else {
                // 折叠左侧
                setCachedSizes(m => new Map(m).set(prevIdx, currentPrevSize));
                setCollapsedIndices(s => new Set(s).add(prevIdx));
                updateSizes(prevIdx, nextIdx, 0, currentNextSize + currentPrevSize);
                onCollapse?.(prevIdx, true);
            }
        } else {
            if (isPrevCollapsed) {
                // 展开左侧
                const restoredSize = cachedSizes.get(prevIdx) ?? 50;
                const newNextSize = Math.max(0, currentNextSize - restoredSize);
                setCollapsedIndices(s => { const newSet = new Set(s); newSet.delete(prevIdx); return newSet; });
                updateSizes(prevIdx, nextIdx, restoredSize, newNextSize);
                onCollapse?.(prevIdx, false);
            } else {
                // 折叠右侧
                setCachedSizes(m => new Map(m).set(nextIdx, currentNextSize));
                setCollapsedIndices(s => new Set(s).add(nextIdx));
                updateSizes(nextIdx, prevIdx, 0, currentPrevSize + currentNextSize);
                onCollapse?.(nextIdx, true);
            }
        }
    };

    const isCollapsible = (panelIndex: number, type: 'start' | 'end') => {
        const panel = panels[panelIndex];
        if (!panel) return false;
        const { collapsible } = panel.props;
        if (collapsible === undefined || collapsible === false) return false;
        if (collapsible === true) return true;
        return type === 'start' ? !!collapsible.start : !!collapsible.end;
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.splitter} ${isHorizontal ? styles.horizontal : styles.vertical} ${className || ''}`}
            style={style}
        >
            {panels.map((panel, index) => {
                const isLast = index === panels.length - 1;
                const size = panelSizes[index];
                const isCollapsed = collapsedIndices.has(index);
                const panelStyle: CSSProperties = {
                    ...panel.props.style,
                    flexBasis: size !== undefined ? size : undefined,
                    flexGrow: size !== undefined ? 0 : 1,
                    flexShrink: size !== undefined ? 0 : 1,
                };

                const panelNode = (
                    <div
                        key={`panel-${index}`}
                        className={`
                            ${styles.panel} 
                            ${!isDragging ? styles.transition : ''} 
                            ${isCollapsed ? styles.collapsed : ''}
                            ${panel.props.className || ''}
                        `}
                        style={panelStyle}
                    >
                        {panel.props.children}
                    </div>
                );

                if (isLast) return panelNode;

                const nextPanel = panels[index + 1];
                const prevCollapsed = collapsedIndices.has(index);
                const nextCollapsed = collapsedIndices.has(index + 1);
                const showPrevBtn = (isCollapsible(index, 'end') && !prevCollapsed) || (isCollapsible(index + 1, 'start') && nextCollapsed);
                const showNextBtn = (isCollapsible(index + 1, 'start') && !nextCollapsed) || (isCollapsible(index, 'end') && prevCollapsed);
                const resizerResizable = panel.props.resizable !== false && nextPanel.props.resizable !== false;

                return [
                    panelNode,
                    <div
                        key={`resizer-${index}`}
                        className={`
                            ${styles.resizer} 
                            ${isHorizontal ? styles.horizontal : styles.vertical}
                            ${activeResizerIndex === index ? styles.active : ''}
                        `}
                        onPointerDown={(e) => resizerResizable && handlePointerDown(e, index)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}

                        style={{ cursor: !resizerResizable ? 'default' : undefined }}
                    >
                        <div className={styles.handle} />
                        {draggerIcon && <div className={styles['dragger-icon']}>{draggerIcon}</div>}

                        {showPrevBtn && (
                            <div className={`${styles['collapse-trigger']} ${styles.prev}`}
                                onPointerDown={(e) => { e.stopPropagation(); /* 阻止冒泡防止触发拖拽 */ }}
                                onClick={(e) => { e.stopPropagation(); handleCollapse(index, 'prev'); }}>
                                {collapsibleIcon || (isHorizontal ? '<' : '∧')}
                            </div>
                        )}
                        {showNextBtn && (
                            <div className={`${styles['collapse-trigger']} ${styles.next}`}
                                onPointerDown={(e) => { e.stopPropagation(); }}
                                onClick={(e) => { e.stopPropagation(); handleCollapse(index, 'next'); }}>
                                {collapsibleIcon || (isHorizontal ? '>' : '∨')}
                            </div>
                        )}
                    </div>
                ];
            })}

            {lazy && isDragging && ghostPosition !== null && (
                <div
                    className={`${styles['ghost-bar']} ${isHorizontal ? styles.horizontal : styles.vertical}`}
                    style={{ [isHorizontal ? 'left' : 'top']: ghostPosition }}
                />
            )}
        </div>
    );
};

Splitter.Panel = SplitterPanel;

export default Splitter;