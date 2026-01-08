import React, {
    useRef,
    useState,
    useEffect,
    useMemo,
    Children,
    isValidElement,
    useCallback,
    type PropsWithChildren,
    type ReactNode,
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
    collapsibleIcon?: ReactNode;
    draggerIcon?: ReactNode;
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

    const dragRef = useRef<{
        startX: number;
        startSizes: (number | undefined)[];
        totalSize: number;
        index: number;
    } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal ? rect.width : rect.height;

        setPanelSizes((prev) => {
            if (prev.length !== panels.length) {
                return panels.map(p =>
                    pxToNumber(p.props.size ?? p.props.defaultSize, totalSize)
                );
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
        const panelProps = panels[targetIndex].props;
        const min = pxToNumber(panelProps.min, totalSize) ?? 0;
        const max = pxToNumber(panelProps.max, totalSize) ?? totalSize;
        return Math.max(min, Math.min(max, newSize));
    };

    const handleMouseDown = (e: React.MouseEvent, index: number) => {
        if (!containerRef.current) return;
        e.preventDefault();
        e.stopPropagation();

        const rect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal ? rect.width : rect.height;

        const currentNodes = containerRef.current.children;
        const prevNode = currentNodes[index * 2] as HTMLElement;
        const nextNode = currentNodes[index * 2 + 2] as HTMLElement;

        if (!prevNode || !nextNode) return;

        const prevSizePx = isHorizontal ? prevNode.offsetWidth : prevNode.offsetHeight;
        const nextSizePx = isHorizontal ? nextNode.offsetWidth : nextNode.offsetHeight;

        const newStartSizes = [...panelSizes];
        newStartSizes[index] = prevSizePx;
        newStartSizes[index + 1] = nextSizePx;

        dragRef.current = {
            startX: isHorizontal ? e.clientX : e.clientY,
            startSizes: newStartSizes,
            totalSize,
            index,
        };

        setIsDragging(true);
        setActiveResizerIndex(index);
        onResizeStart?.(newStartSizes.map(s => s || 0));

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragRef.current) return;

        const { startX, startSizes, totalSize, index } = dragRef.current;
        const currentPos = isHorizontal ? e.clientX : e.clientY;
        const delta = currentPos - startX;

        const prevIdx = index;
        const nextIdx = index + 1;

        const startPrev = startSizes[prevIdx] as number;
        const startNext = startSizes[nextIdx] as number;

        let newPrev = startPrev + delta;

        const constrainedPrev = getConstrainedSize(prevIdx, newPrev, totalSize);
        const validDeltaPrev = constrainedPrev - startPrev;

        let constrainedNext = startNext - validDeltaPrev;
        constrainedNext = getConstrainedSize(nextIdx, constrainedNext, totalSize);

        const finalNext = constrainedNext;
        const finalPrev = startPrev + (startNext - finalNext);

        if (!lazy) {
            setPanelSizes(prev => {
                const next = [...prev];
                next[prevIdx] = finalPrev;
                next[nextIdx] = finalNext;
                return next;
            });
            onResize?.([finalPrev, finalNext]);
        }
    }, [isHorizontal, lazy, panels]);

    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        setIsDragging(false);
        setActiveResizerIndex(null);
        if (dragRef.current) {
            onResizeEnd?.(panelSizes.map(s => s || 0));
        }
        dragRef.current = null;
    }, [handleMouseMove, panelSizes, onResizeEnd]);

    const handleCollapse = (index: number, type: 'prev' | 'next') => {
        if (!containerRef.current) return;

        const prevIdx = index;
        const nextIdx = index + 1;

        const isPrevCollapsed = collapsedIndices.has(prevIdx);
        const isNextCollapsed = collapsedIndices.has(nextIdx);

        const currentNodes = containerRef.current.children;
        const prevNode = currentNodes[prevIdx * 2] as HTMLElement;
        const nextNode = currentNodes[nextIdx * 2] as HTMLElement;

        const currentPrevSize = isHorizontal ? prevNode.offsetWidth : prevNode.offsetHeight;
        const currentNextSize = isHorizontal ? nextNode.offsetWidth : nextNode.offsetHeight;

        const doCollapse = (targetIdx: number, neighborIdx: number, currentTargetSize: number, currentNeighborSize: number) => {
            setCachedSizes(map => new Map(map).set(targetIdx, currentTargetSize));
            setCollapsedIndices(set => new Set(set).add(targetIdx));

            setPanelSizes(prev => {
                const next = [...prev];
                next[targetIdx] = 0;
                next[neighborIdx] = currentNeighborSize + currentTargetSize;
                return next;
            });
            onCollapse?.(targetIdx, true);
        };

        const doExpand = (targetIdx: number, neighborIdx: number, currentNeighborSize: number) => {
            const restoredSize = cachedSizes.get(targetIdx) ?? 50;
            const newNeighborSize = Math.max(0, currentNeighborSize - restoredSize);
            setCollapsedIndices(set => {
                const next = new Set(set);
                next.delete(targetIdx);
                return next;
            });

            setPanelSizes(prev => {
                const next = [...prev];
                next[targetIdx] = restoredSize;
                next[neighborIdx] = newNeighborSize;
                return next;
            });
            onCollapse?.(targetIdx, false);
        };

        if (type === 'prev') {
            // 点击左箭头：只有当右侧被折叠时，它才充当“展开右侧”的功能
            if (isNextCollapsed) {
                doExpand(nextIdx, prevIdx, currentPrevSize);
            } else {
                doCollapse(prevIdx, nextIdx, currentPrevSize, currentNextSize);
            }
        } else {
            // 点击右箭头：只有当左侧被折叠时，它才充当“展开左侧”的功能
            if (isPrevCollapsed) {
                doExpand(prevIdx, nextIdx, currentNextSize);
            } else {
                doCollapse(nextIdx, prevIdx, currentNextSize, currentPrevSize);
            }
        }
    };

    const isCollapsible = (panelIndex: number, type: 'start' | 'end') => {
        const panel = panels[panelIndex];
        if (!panel) return false;
        const { collapsible } = panel.props;

        if (collapsible === undefined || collapsible === false) return false;
        if (collapsible === true) return true;

        if (type === 'start') return !!collapsible.start;
        if (type === 'end') return !!collapsible.end;

        return false;
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
              ${isDragging ? styles.dragging : ''}
              ${isCollapsed ? styles.collapsed : ''}
              ${panel.props.className || ''}
            `}
                        style={panelStyle}
                    >
                        {panel.props.children}
                    </div>
                );

                const resizerNode = !isLast && (() => {
                    const nextPanel = panels[index + 1];
                    const prevCollapsed = collapsedIndices.has(index);
                    const nextCollapsed = collapsedIndices.has(index + 1);
                    // 当 Prev 面板 *没有* 被折叠时，才显示 Prev 按钮（左箭头）
                    const canCollapsePrev = isCollapsible(index, 'end') && !prevCollapsed;

                    // 当 Next 面板 *没有* 被折叠时，才显示 Next 按钮（右箭头）
                    const canCollapseNext = isCollapsible(index + 1, 'start') && !nextCollapsed;

                    const resizerResizable = panel.props.resizable !== false && nextPanel.props.resizable !== false;

                    const prevIconRaw = isHorizontal ? '<' : '∧';
                    const nextIconRaw = isHorizontal ? '>' : '∨';
                    const prevIcon = prevIconRaw;
                    const nextIcon = nextIconRaw;

                    return (
                        <div
                            key={`resizer-${index}`}
                            className={`
                ${styles.resizer} 
                ${isHorizontal ? styles.horizontal : styles.vertical}
                ${activeResizerIndex === index ? styles.active : ''}
              `}
                            onMouseDown={(e) => resizerResizable && handleMouseDown(e, index)}
                            style={{ cursor: !resizerResizable ? 'default' : undefined }}
                        >
                            {draggerIcon && <div className={styles['dragger-icon']}>{draggerIcon}</div>}

                            {canCollapsePrev && (
                                <div
                                    className={`${styles['collapse-trigger']} ${styles.prev}`}
                                    onMouseDown={(e) => { e.stopPropagation(); handleCollapse(index, 'prev'); }}
                                >
                                    {collapsibleIcon || prevIcon}
                                </div>
                            )}

                            {canCollapseNext && (
                                <div
                                    className={`${styles['collapse-trigger']} ${styles.next}`}
                                    onMouseDown={(e) => { e.stopPropagation(); handleCollapse(index, 'next'); }}
                                >
                                    {collapsibleIcon || nextIcon}
                                </div>
                            )}
                        </div>
                    );
                })();

                return [panelNode, resizerNode];
            })}
        </div>
    );
};

Splitter.Panel = SplitterPanel;

export default Splitter;