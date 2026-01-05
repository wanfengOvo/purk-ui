import React, { useState, useMemo, useRef } from 'react';
import styles from './Tree.module.less';
import type { ReactNode, DragEvent } from 'react';

// --- 类型定义 ---

export interface TreeDataItem {
    key: string | number;
    title: ReactNode;
    children?: TreeDataItem[];
    disabled?: boolean;
    icon?: ReactNode;
    isLeaf?: boolean; // 显式标记叶子节点
}

interface TreeProps {
    data: TreeDataItem[];
    checkbox?: boolean;
    draggable?: boolean;
    // 拖拽相关回调
    onDragStart?: (info: { event: DragEvent; node: TreeDataItem }) => void;
    onDragEnter?: (info: { event: DragEvent; node: TreeDataItem; expandedKeys: (string | number)[] }) => void;
    onDragOver?: (info: { event: DragEvent; node: TreeDataItem }) => void;
    onDragLeave?: (info: { event: DragEvent; node: TreeDataItem }) => void;
    onDrop?: (info: {
        event: DragEvent;
        node: TreeDataItem; // 目标节点
        dragNode: TreeDataItem; // 被拖拽节点
        dragNodesKeys: (string | number)[];
        dropPosition: number; // 相对位置
        dropToGap: boolean; // 是否是间隙投递
    }) => void;
}

interface TreeNodeProps {
    node: TreeDataItem;
    level: number;
    expandedKeys: (string | number)[];
    selectedKeys: (string | number)[];
    onToggleExpand: (key: string | number) => void;
    onCheck: (key: string | number, checked: boolean) => void; // 这里的名字改为 Check 更语义化
    showCheckbox: boolean;
    draggable?: boolean;
    // 拖拽内部状态传递
    dragOverNodeKey: string | number | null;
    dropPosition: number | null;
    onNodeDragStart: (e: DragEvent, node: TreeDataItem) => void;
    onNodeDragEnter: (e: DragEvent, node: TreeDataItem) => void;
    onNodeDragOver: (e: DragEvent, node: TreeDataItem, position: number) => void;
    onNodeDragLeave: (e: DragEvent, node: TreeDataItem) => void;
    onNodeDrop: (e: DragEvent, node: TreeDataItem) => void;
}


interface FlatNode {
    key: string | number;
    parentKey: string | number | null;
    childrenKeys: (string | number)[];
    item: TreeDataItem;
    disabled: boolean;
}

const flattenTreeData = (data: TreeDataItem[], parentKey: string | number | null = null): Map<string | number, FlatNode> => {
    let map = new Map<string | number, FlatNode>();
    data.forEach(item => {
        const childrenKeys = (item.children || []).map(child => child.key);
        map.set(item.key, {
            key: item.key,
            parentKey,
            childrenKeys,
            item,
            disabled: !!item.disabled
        });
        if (item.children) {
            const childrenMap = flattenTreeData(item.children, item.key);
            map = new Map([...map, ...childrenMap]);
        }
    });
    return map;
};



const TreeNode: React.FC<TreeNodeProps> = ({
    node,
    level,
    expandedKeys,
    selectedKeys,
    onToggleExpand,
    onCheck,
    showCheckbox,
    draggable,
    dragOverNodeKey,
    dropPosition,
    onNodeDragStart,
    onNodeDragEnter,
    onNodeDragOver,
    onNodeDragLeave,
    onNodeDrop
}) => {
    const { key, title, children, disabled = false, icon, isLeaf } = node;
    const isExpanded = expandedKeys.includes(key);
    const isSelected = selectedKeys.includes(key);
    const hasChildren = children && children.length > 0;
    const isDisabled = disabled;

    // 拖拽样式计算
    const isDragOver = dragOverNodeKey === key;
    // dropPosition: -1 (top), 0 (inner), 1 (bottom)
    const dragOverClass = isDragOver ? (
        dropPosition === 0 ? styles['drag-over'] :
            dropPosition === -1 ? styles['drag-over-gap-top'] :
                styles['drag-over-gap-bottom']
    ) : '';

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDisabled || (!hasChildren && !isLeaf)) return; // 没孩子也不是显式叶子，不做展开
        onToggleExpand(key);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDisabled) return;
        // 传递当前点击的 key 和 目标状态（取反）
        onCheck(key, !isSelected);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!draggable) return;
        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const clientY = e.clientY;
        const offsetTop = clientY - rect.top;

        let position = 0;
        if (offsetTop < rect.height * 0.3) {
            position = -1;
        } else if (offsetTop > rect.height * 0.7) {
            position = 1;
        }
        onNodeDragOver(e, node, position);
    };

    return (
        <div
            className={styles['tree-node-container']}
        >
            <div
                className={`${styles['tree-node']} ${isSelected ? styles['tree-node-active'] : ''} ${isDisabled ? styles['tree-node-disabled'] : ''} ${dragOverClass}`}
                style={{ paddingLeft: `${level * 18}px` }}
                draggable={draggable && !isDisabled}
                onDragStart={(e) => onNodeDragStart(e, node)}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); onNodeDragEnter(e, node); }}
                onDragOver={(e) => handleDragOver(e)}
                onDragLeave={(e) => { e.stopPropagation(); onNodeDragLeave(e, node); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onNodeDrop(e, node); }}
                data-key={key} // 辅助定位
            >
                {showCheckbox && (
                    <span
                        className={`${styles['tree-checkbox']} ${isSelected ? styles['tree-checkbox-checked'] : ''} ${isDisabled ? styles['tree-checkbox-disabled'] : ''}`}
                        onClick={handleCheckboxClick}
                    >
                        {isSelected && !isDisabled ? '✓' : ''}
                    </span>
                )}

                {/* 展开/收缩图标 */}
                {(!isLeaf && hasChildren) ? (
                    <span
                        className={`${styles['tree-node-icon']} ${isExpanded ? styles['expanded'] : ''}`}
                        onClick={handleToggleExpand}
                    >
                        ▶
                    </span>
                ) : <span className={styles['tree-node-icon']} />}

                {/* 自定义图标 */}
                {icon && (
                    <span className={styles['tree-node-custom-icon']}>
                        {icon}
                    </span>
                )}

                <span className={styles['tree-node-title']}>{title}</span>
            </div>

            {hasChildren && isExpanded && (
                <div className={styles['tree-children-open']}>
                    {children.map((child) => (
                        <TreeNode
                            key={child.key}
                            node={child}
                            level={level + 1}
                            expandedKeys={expandedKeys}
                            selectedKeys={selectedKeys}
                            onToggleExpand={onToggleExpand}
                            onCheck={onCheck}
                            showCheckbox={showCheckbox}
                            draggable={draggable}
                            dragOverNodeKey={dragOverNodeKey}
                            dropPosition={dropPosition}
                            onNodeDragStart={onNodeDragStart}
                            onNodeDragEnter={onNodeDragEnter}
                            onNodeDragOver={onNodeDragOver}
                            onNodeDragLeave={onNodeDragLeave}
                            onNodeDrop={onNodeDrop}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const Tree: React.FC<TreeProps> = ({
    data,
    checkbox = false,
    draggable = false,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop
}) => {
    const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);

    // 拖拽内部状态
    const [dragNode, setDragNode] = useState<TreeDataItem | null>(null);
    const [dragOverNodeKey, setDragOverNodeKey] = useState<string | number | null>(null);
    const [dropPosition, setDropPosition] = useState<number | null>(null); // -1: 上, 0: 内, 1: 下

    // 1. 扁平化数据，用于 Checkbox 向上联动计算
    const flatDataMap = useMemo(() => flattenTreeData(data), [data]);

    const toggleExpand = (key: string | number) => {
        setExpandedKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const handleCheck = (key: string | number, checked: boolean) => {
        const newSelectedKeys = new Set(selectedKeys);
        const targetNode = flatDataMap.get(key);
        if (!targetNode) return;

        // 1. 向下递归（处理子节点）
        const updateChildren = (nodeKey: string | number, status: boolean) => {
            const node = flatDataMap.get(nodeKey);
            if (!node || node.disabled) return;

            if (status) newSelectedKeys.add(nodeKey);
            else newSelectedKeys.delete(nodeKey);

            node.childrenKeys.forEach(childKey => updateChildren(childKey, status));
        };
        updateChildren(key, checked);

        // 2. 向上递归（处理父节点）
        let currentParentKey = targetNode.parentKey;
        while (currentParentKey) {
            const parentNode = flatDataMap.get(currentParentKey);
            if (!parentNode || parentNode.disabled) break;

            // 检查该父节点下的所有子节点（忽略禁用的）是否都被选中
            const allChildrenChecked = parentNode.childrenKeys.every(childKey => {
                const child = flatDataMap.get(childKey);
                // 如果子节点禁用，跳过检查（视为通过，或者根据需求视为未中）
                // 通常逻辑：如果子节点禁用，我们只看可用的子节点是否全选
                if (child?.disabled) return true;
                return newSelectedKeys.has(childKey);
            });

            if (allChildrenChecked) {
                newSelectedKeys.add(currentParentKey);
            } else {
                newSelectedKeys.delete(currentParentKey);
            }
            currentParentKey = parentNode.parentKey;
        }

        setSelectedKeys(Array.from(newSelectedKeys));
    };


    const handleDragStart = (e: DragEvent, node: TreeDataItem) => {
        if (!draggable) return;
        e.dataTransfer.effectAllowed = 'move';
        setDragNode(node);
        onDragStart?.({ event: e, node });
    };

    const handleDragEnter = (e: DragEvent, node: TreeDataItem) => {
        if (!draggable) return;
        e.preventDefault(); // 允许 drop
        onDragEnter?.({ event: e, node, expandedKeys });
    };

    const handleDragOver = (e: DragEvent, node: TreeDataItem, position: number) => {
        if (!draggable || dragNode?.key === node.key) return;

        setDragOverNodeKey(node.key);
        setDropPosition(position);

        // 如果外部需要这个 position，可以包含在回调里
        onDragOver?.({ event: e, node });
    };
    const handleDragLeave = (e: DragEvent, node: TreeDataItem) => {
        if (!draggable) return;
        onDragLeave?.({ event: e, node });
    };

    const handleDrop = (e: DragEvent, node: TreeDataItem) => {
        if (!draggable || !dragNode || dropPosition === null) return;
        e.preventDefault();
        e.stopPropagation();

        const dropInfo = {
            event: e,
            node: node, // 放置的目标节点
            dragNode: dragNode, // 被拖动的节点
            dragNodesKeys: [dragNode.key], // 这里简化，只传当前节点key
            dropPosition: dropPosition === -1 || dropPosition === 1 ? dropPosition : 0,
            dropToGap: dropPosition !== 0, // 如果不是 0，就是插在缝隙里
        };

        // 清理状态
        setDragOverNodeKey(null);
        setDropPosition(null);
        setDragNode(null);

        onDrop?.(dropInfo);
    };

    return (
        <div className={styles['tree-container']}>
            {data.map((node) => (
                <TreeNode
                    key={node.key}
                    node={node}
                    level={0}
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                    onToggleExpand={toggleExpand}
                    onCheck={handleCheck}
                    showCheckbox={checkbox}
                    draggable={draggable}
                    dragOverNodeKey={dragOverNodeKey}
                    dropPosition={dropPosition}
                    onNodeDragStart={handleDragStart}
                    onNodeDragEnter={handleDragEnter}
                    onNodeDragOver={handleDragOver}
                    onNodeDragLeave={handleDragLeave}
                    onNodeDrop={handleDrop}
                />
            ))}
        </div>
    );
};

export default Tree;