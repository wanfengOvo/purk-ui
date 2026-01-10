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
import { pxToNumber, parseSize } from '../../utils/util'; // 确保路径正确
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
    onResize?: (sizes: (number | string)[]) => void; // 注意：返回类型改了，可能包含百分比
    onResizeEnd?: (sizes: (number | string)[]) => void;
    onResizeStart?: (sizes: (number | string)[]) => void;
    lazy?: boolean;
}

const SplitterPanel = (props: PropsWithChildren<PanelProps>) => {
    const { children, className, style } = props;
    // Panel 自身只负责渲染内容，样式由父组件 cloneElement 注入或通过 className 控制
    // 这里的 style 需要透传，但 flex 属性由 Splitter 控制
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
    const requestRef = useRef<number>();

    // 过滤出有效的 Panel
    const panels = useMemo(() => {
        return Children.toArray(children).filter(
            (child): child is ReactElement<PropsWithChildren<PanelProps>> =>
                isValidElement(child) && child.type === SplitterPanel
        );
    }, [children]);

    // 核心状态：存储每个面板的大小 (可以是 number 也可以是 string "30%")
    const [panelSizes, setPanelSizes] = useState<(number | string)[]>([]);
    const [collapsedIndices, setCollapsedIndices] = useState<Set<number>>(new Set());
    const [cachedSizes, setCachedSizes] = useState<Map<number, number | string>>(new Map());

    const [isDragging, setIsDragging] = useState(false);
    const [activeResizerIndex, setActiveResizerIndex] = useState<number | null>(null);
    const [ghostPosition, setGhostPosition] = useState<number | null>(null);

    // 拖拽时的快照数据
    const dragRef = useRef<{
        startX: number;
        startSizes: (number | string)[]; // 初始状态 (包含 % 和 px)
        startSizesPx: number[];          // 初始像素值 (用于计算)
        totalSize: number;               // 容器总尺寸
        index: number;
        finalSizes?: (number | string)[]; // 最终计算结果
        initialResizerPos: number;
    } | null>(null);

    // --- 1. 初始化与受控同步逻辑 ---
    useEffect(() => {
        // 如果正在拖拽，暂停从 props 同步，防止受控模式下的抖动/冲突
        if (isDragging) return;

        setPanelSizes((prev) => {
            // 构造新的 sizes 数组
            const nextSizes: (number | string)[] = [];
            let hasChange = false;

            // 如果数量变了，重置
            if (prev.length !== panels.length) {
                return panels.map(p => p.props.size ?? p.props.defaultSize ?? '1'); // 默认 flex: 1
            }

            panels.forEach((panel, index) => {
                // 优先取 props.size (受控)，其次取 prev[index] (内部状态)，最后取 defaultSize
                const controlledSize = panel.props.size;
                const currentSize = prev[index];

                // 只有当受控属性存在且不等于当前状态时，才更新
                if (controlledSize !== undefined) {
                    if (controlledSize !== currentSize) {
                        nextSizes[index] = controlledSize;
                        hasChange = true;
                    } else {
                        nextSizes[index] = currentSize;
                    }
                } else {
                    // 非受控，保持原样
                    nextSizes[index] = currentSize ?? panel.props.defaultSize ?? '1';
                }
            });

            return hasChange ? nextSizes : prev;
        });
    }, [panels, isDragging]); // 依赖 isDragging


    // --- 2. 辅助函数：获取 Flex 样式 ---
    const getPanelStyle = (index: number, size: number | string | undefined, isCollapsed: boolean): CSSProperties => {
        if (isCollapsed) return {}; // CSS class handles display:none/width:0

        const { value, type } = parseSize(size);

        if (type === 'px') {
            // 固定像素模式: 不伸缩
            return {
                flexGrow: 0,
                flexShrink: 0,
                flexBasis: `${value}px`,
            };
        } else {
            // 百分比/比例模式: 利用 flex-grow 分配剩余空间
            // 如果是 "30%"，flex-grow = 30。如果总和不是100，flexbox 会自动按比例分配。
            return {
                flexGrow: value,
                flexShrink: value, // 也允许按比例缩小
                flexBasis: '0px',  // 关键：basis设为0，让grow完全控制大小
            };
        }
    };

    // --- 3. 约束计算 (Min/Max) ---
    // 注意：这里我们需要把所有的约束都转成 PX 来做判断
    const getConstrainedPx = (targetIndex: number, newSizePx: number, totalSize: number): number => {
        const panelProps = panels[targetIndex]?.props;
        if (!panelProps) return newSizePx;

        const minPx = pxToNumber(panelProps.min, totalSize) || 0; // 默认为0

        // max 稍微复杂，如果没有设置 max，理论上是无限大，但受限于容器
        let maxPx = totalSize;
        if (panelProps.max !== undefined) {
            maxPx = pxToNumber(panelProps.max, totalSize);
        }

        return Math.max(minPx, Math.min(maxPx, newSizePx));
    };


    // --- 4. 拖拽处理 ---

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
        if (!containerRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);

        const containerRect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal ? containerRect.width : containerRect.height;

        // 获取所有 Panel 的当前实际像素尺寸 (DOM读取)
        // 这样无论之前是 % 还是 px，我们都以当前的视觉像素为起点
        const currentNodes = containerRef.current.children;
        const startSizesPx: number[] = [];

        // 这里的 DOM 结构是 [Panel, Resizer, Panel, Resizer...]
        // Panel 的索引对应 DOM 的 index * 2
        panels.forEach((_, idx) => {
            const node = currentNodes[idx * 2] as HTMLElement;
            if (node) {
                startSizesPx[idx] = isHorizontal ? node.getBoundingClientRect().width : node.getBoundingClientRect().height;
            } else {
                startSizesPx[idx] = 0;
            }
        });

        const resizerRect = e.currentTarget.getBoundingClientRect();
        const initialResizerPos = isHorizontal
            ? resizerRect.left - containerRect.left
            : resizerRect.top - containerRect.top;

        dragRef.current = {
            startX: isHorizontal ? e.clientX : e.clientY,
            startSizes: [...panelSizes], // 记录原始状态 (包含单位)
            startSizesPx,                // 记录原始像素
            totalSize,
            index,
            initialResizerPos,
            finalSizes: [...panelSizes]
        };

        setActiveResizerIndex(index);
        setIsDragging(true);
        if (lazy) setGhostPosition(initialResizerPos);
        onResizeStart?.([...panelSizes]);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !dragRef.current) return;
        e.preventDefault();

        // 使用 requestAnimationFrame 节流，解决"疯狂触发"和性能问题
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        const currentPos = isHorizontal ? e.clientX : e.clientY;

        requestRef.current = requestAnimationFrame(() => {
            if (!dragRef.current) return;
            const { startX, startSizes, startSizesPx, totalSize, index, initialResizerPos } = dragRef.current;

            const delta = currentPos - startX;
            const prevIdx = index;
            const nextIdx = index + 1;

            // 1. 计算原本的像素值
            const startPrevPx = startSizesPx[prevIdx];
            const startNextPx = startSizesPx[nextIdx];

            // 2. 计算期望的像素值
            let newPrevPx = startPrevPx + delta;
            let newNextPx = startNextPx - delta;

            // 3. 应用约束 (Min/Max)
            // 先约束左边
            const constrainedPrevPx = getConstrainedPx(prevIdx, newPrevPx, totalSize);
            // 重新计算 delta (因为左边可能被限制了)
            const validDelta = constrainedPrevPx - startPrevPx;

            // 根据新的 delta 计算右边
            let constrainedNextPx = startNextPx - validDelta;
            // 约束右边
            constrainedNextPx = getConstrainedPx(nextIdx, constrainedNextPx, totalSize);

            // 最终的有效像素大小
            const finalNextPx = constrainedNextPx;
            const finalPrevPx = startPrevPx + (startNextPx - finalNextPx); // 保证总和不变

            // 4. 将像素值转换回原本的单位 (关键步骤)
            const convertBack = (pxVal: number, originalUnitVal: number | string): number | string => {
                const { type } = parseSize(originalUnitVal);
                if (type === 'px') {
                    return pxVal;
                } else {
                    // 如果原本是百分比/比例
                    // 我们需要计算现在的像素占"参与分配的总像素"的比例，或者直接转回相对于容器的百分比
                    // 简单的策略：直接转回相对于总容器的百分比
                    // 这样 "30%" 变成 "31.5%"
                    // 注意保留精度，否则多次拖拽会有误差
                    return parseFloat(((pxVal / totalSize) * 100).toFixed(2)) + '%';
                }
            };

            const nextSizes = [...startSizes];
            nextSizes[prevIdx] = convertBack(finalPrevPx, startSizes[prevIdx]);
            nextSizes[nextIdx] = convertBack(finalNextPx, startSizes[nextIdx]);

            dragRef.current.finalSizes = nextSizes;

            if (lazy) {
                setGhostPosition(initialResizerPos + validDelta);
            } else {
                setPanelSizes(nextSizes);
                onResize?.(nextSizes); // 回调
            }
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        e.currentTarget.releasePointerCapture(e.pointerId);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (dragRef.current) {
            const { finalSizes } = dragRef.current;
            if (lazy && finalSizes) {
                setPanelSizes(finalSizes);
                onResize?.(finalSizes);
            }
            onResizeEnd?.(finalSizes || []);
        }

        setIsDragging(false);
        setActiveResizerIndex(null);
        setGhostPosition(null);
        dragRef.current = null;
    };


    // --- 5. 折叠逻辑 ---
    // 辅助：将像素转换为指定单位（保持和 neighbor 一致的单位）
    const convertSizeToUnit = (pxValue: number, totalSize: number, targetUnitType: 'px' | 'ratio') => {
        if (targetUnitType === 'px') return pxValue;
        // 转换为百分比字符串
        const percent = (pxValue / totalSize) * 100;
        return `${parseFloat(percent.toFixed(2))}%`;
    };

    // 辅助：两个尺寸相加（处理 string/number 混合运算）
    const addSizes = (sizeA: number | string, sizeB: number | string, totalSize: number) => {
        const parsedA = parseSize(sizeA);
        const parsedB = parseSize(sizeB);

        // 如果两个都是像素，直接加
        if (parsedA.type === 'px' && parsedB.type === 'px') {
            return parsedA.value + parsedB.value;
        }

        // 如果有一个是百分比，建议统一转成百分比计算，保持响应式
        // 或者：统一追随 sizeA (邻居) 的单位
        const valAPx = pxToNumber(sizeA, totalSize);
        const valBPx = pxToNumber(sizeB, totalSize);
        const totalPx = valAPx + valBPx;

        // 依据第一个参数（通常是邻居面板）的类型返回
        return convertSizeToUnit(totalPx, totalSize, parsedA.type);
    };

    // 辅助：两个尺寸相减
    const subtractSizes = (baseSize: number | string, subtractSize: number | string, totalSize: number) => {
        const parsedBase = parseSize(baseSize);
        const basePx = pxToNumber(baseSize, totalSize);
        const subPx = pxToNumber(subtractSize, totalSize);
        const resultPx = Math.max(0, basePx - subPx);

        return convertSizeToUnit(resultPx, totalSize, parsedBase.type);
    };

    const handleCollapse = (index: number, type: 'prev' | 'next') => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const totalSize = isHorizontal ? containerRect.width : containerRect.height;

        const prevIdx = index;
        const nextIdx = index + 1;

        const isPrevCollapsed = collapsedIndices.has(prevIdx);
        const isNextCollapsed = collapsedIndices.has(nextIdx);

        // 获取当前状态中的尺寸（可能是 "30%" 也可能是 200）
        const currentPrevSize = panelSizes[prevIdx] ?? 0;
        const currentNextSize = panelSizes[nextIdx] ?? 0;

        const updateSizes = (tIdx: number, nIdx: number, tSize: number | string, nSize: number | string) => {
            setPanelSizes(prev => {
                const next = [...prev];
                next[tIdx] = tSize;
                next[nIdx] = nSize;
                return next;
            });
        };

        if (type === 'prev') {
            // 操作左侧/上方按钮
            if (isNextCollapsed) {
                // 【场景1】右侧已折叠 -> 展开右侧
                // 逻辑：恢复右侧，左侧减去右侧恢复的大小
                const restoredSize = cachedSizes.get(nextIdx) ?? 50; // 默认值兜底
                const newPrevSize = subtractSizes(currentPrevSize, restoredSize, totalSize);

                setCollapsedIndices(s => { const newSet = new Set(s); newSet.delete(nextIdx); return newSet; });
                updateSizes(nextIdx, prevIdx, restoredSize, newPrevSize);
                onCollapse?.(nextIdx, false);
            } else {
                // 【场景2】左侧未折叠 -> 折叠左侧
                // 逻辑：缓存左侧，左侧设为0，右侧加上左侧的大小
                setCachedSizes(m => new Map(m).set(prevIdx, currentPrevSize));
                setCollapsedIndices(s => new Set(s).add(prevIdx));

                // 计算新的右侧大小：原右侧 + 原左侧
                const newNextSize = addSizes(currentNextSize, currentPrevSize, totalSize);
                updateSizes(prevIdx, nextIdx, 0, newNextSize);
                onCollapse?.(prevIdx, true);
            }
        } else {
            // 操作右侧/下方按钮
            if (isPrevCollapsed) {
                // 【场景3】左侧已折叠 -> 展开左侧
                // 逻辑：恢复左侧，右侧减去左侧恢复的大小
                const restoredSize = cachedSizes.get(prevIdx) ?? 50;
                const newNextSize = subtractSizes(currentNextSize, restoredSize, totalSize);

                setCollapsedIndices(s => { const newSet = new Set(s); newSet.delete(prevIdx); return newSet; });
                updateSizes(prevIdx, nextIdx, restoredSize, newNextSize);
                onCollapse?.(prevIdx, false);
            } else {
                // 【场景4】右侧未折叠 -> 折叠右侧
                // 逻辑：缓存右侧，右侧设为0，左侧加上右侧的大小
                setCachedSizes(m => new Map(m).set(nextIdx, currentNextSize));
                setCollapsedIndices(s => new Set(s).add(nextIdx));

                // 计算新的左侧大小：原左侧 + 原右侧
                const newPrevSize = addSizes(currentPrevSize, currentNextSize, totalSize);
                updateSizes(nextIdx, prevIdx, 0, newPrevSize);
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

                // 计算样式
                const flexStyle = getPanelStyle(index, size, isCollapsed);
                const mergedStyle = { ...panel.props.style, ...flexStyle };

                const panelNode = (
                    <div
                        key={`panel-${index}`}
                        className={`
                            ${styles.panel} 
                            ${!isDragging ? styles.transition : ''} 
                            ${isCollapsed ? styles.collapsed : ''}
                            ${panel.props.className || ''}
                        `}
                        style={mergedStyle}
                    >
                        {panel.props.children}
                    </div>
                );

                if (isLast) return panelNode;

                const nextPanel = panels[index + 1];
                const prevCollapsed = collapsedIndices.has(index);
                const nextCollapsed = collapsedIndices.has(index + 1);
                const isSandwiched = prevCollapsed && nextCollapsed;
                if (isSandwiched) return panelNode;
                // 判断是否显示折叠按钮
                const showPrevBtn = (isCollapsible(index, 'end') && !prevCollapsed) || (isCollapsible(index + 1, 'start') && nextCollapsed);
                const showNextBtn = (isCollapsible(index + 1, 'start') && !nextCollapsed) || (isCollapsible(index, 'end') && prevCollapsed);
                const resizerResizable =
                    panel.props.resizable !== false &&
                    nextPanel.props.resizable !== false &&
                    !prevCollapsed &&
                    !nextCollapsed;

                return [
                    panelNode,
                    <div
                        key={`resizer-${index}`}
                        className={`
                        ${styles.resizer} 
                        ${isHorizontal ? styles.horizontal : styles.vertical}
                        ${activeResizerIndex === index ? styles.active : ''}
                        ${prevCollapsed ? styles['collapsed-prev'] : ''}  
                        ${nextCollapsed ? styles['collapsed-next'] : ''}  
                    `}
                        // 只有在没折叠且允许 resize 时才触发 pointerDown
                        onPointerDown={(e) => resizerResizable && handlePointerDown(e, index)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        style={{
                            cursor: !resizerResizable ? 'default' : undefined,
                        }}
                    >
                        {/* 只有在都没折叠的时候才显示拖拽把手，或者你可以一直显示，看设计需求 */}
                        {(!prevCollapsed && !nextCollapsed) && <div className={styles.handle} />}

                        {draggerIcon && (!prevCollapsed && !nextCollapsed) && <div className={styles['dragger-icon']}>{draggerIcon}</div>}

                        {showPrevBtn && (
                            <div className={`${styles['collapse-trigger']} ${styles.prev}`}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); handleCollapse(index, 'prev'); }}>
                                {/* 无论功能是收起还是展开，左侧按钮永远指向左 (<) */}
                                {collapsibleIcon || (isHorizontal ? '<' : '∧')}
                            </div>
                        )}
                        {showNextBtn && (
                            <div className={`${styles['collapse-trigger']} ${styles.next}`}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); handleCollapse(index, 'next'); }}>
                                {/* 无论功能是收起还是展开，右侧按钮永远指向右 (>) */}
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