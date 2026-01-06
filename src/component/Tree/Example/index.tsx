import React, { useState } from 'react';
import Tree from '../Tree';
import { type TreeDataItem } from '../interface';
const TreeExample: React.FC = () => {
    const initialData: TreeDataItem[] = [
        {
            title: '用户权限管理',
            key: '0-0',
            children: [
                {
                    title: '管理员设置',
                    key: '0-0-0',
                    children: [
                        { title: '新增用户', key: '0-0-0-0' },
                        { title: '禁用用户 (不可选)', key: '0-0-0-1', disabled: true },
                        { title: '角色分配', key: '0-0-0-2' },
                    ],
                },
                {
                    title: '审计日志',
                    key: '0-0-1',
                },
            ],
        },
        {
            title: '系统监控',
            key: '0-1',
            children: [
                { title: 'CPU 负载', key: '0-1-0' },
                { title: '内存占用', key: '0-1-1' },
            ],
        },
    ];

    const [gData, setGData] = useState<TreeDataItem[]>(initialData);

    // 辅助函数：在树中查找并操作节点
    const onDrop = (info: any) => {
        const { dragNode, node, dropPosition, dropToGap } = info;
        const dragKey = dragNode.key;
        const dropKey = node.key;

        // 1. 深度拷贝数据，避免引用污染
        const data = JSON.parse(JSON.stringify(gData));

        // 2. 查找并移除被拖拽的节点
        let dragObj: TreeDataItem | undefined;

        const removeNode = (list: TreeDataItem[], key: string | number) => {
            for (let i = 0; i < list.length; i++) {
                if (list[i].key === key) {
                    dragObj = list[i];
                    list.splice(i, 1);
                    return true;
                }
                if (list[i].children && removeNode(list[i].children!, key)) {
                    return true;
                }
            }
            return false;
        };

        removeNode(data, dragKey);
        if (!dragObj) return;

        // 3. 插入节点到新位置
        if (!dropToGap) {
            // 插入到节点内部
            const addNodeInside = (list: TreeDataItem[], key: string | number) => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].key === key) {
                        list[i].children = list[i].children || [];
                        list[i].children!.push(dragObj!);
                        return true;
                    }
                    if (list[i].children && addNodeInside(list[i].children!, key)) {
                        return true;
                    }
                }
                return false;
            }
            addNodeInside(data, dropKey);
        } else {
            // 插入到节点上方或下方（关键：这使得节点可以移动到父级同层）
            const addNodeAtGap = (list: TreeDataItem[], key: string | number) => {
                for (let i = 0; i < list.length; i++) {
                    if (list[i].key === key) {
                        const index = dropPosition === -1 ? i : i + 1;
                        list.splice(index, 0, dragObj!);
                        return true;
                    }
                    if (list[i].children && addNodeAtGap(list[i].children!, key)) {
                        return true;
                    }
                }
                return false;
            }
            addNodeAtGap(data, dropKey);
        }

        setGData(data);
    };

    return (
        <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>可拖拽层级树 (修复版)</h3>
            <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                padding: '20px',
                background: '#fff',
                width: '500px'
            }}>
                <Tree
                    data={gData}
                    checkbox
                    draggable
                    onDrop={onDrop}
                    switchIcon={'➡️'}
                />
            </div>
            <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
                提示：拖拽至标题<strong>中间</strong>变为子节点，拖拽至标题<strong>边缘</strong>进行同级排序或跨层级移动。
            </div>
        </div>
    );
};

export default TreeExample;