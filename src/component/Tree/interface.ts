import type { ReactNode } from "react";

export interface TreeDataItem {
    key: string | number;
    title: ReactNode;
    children?: TreeDataItem[];
    disabled?: boolean;
    icon?: ReactNode;
    isLeaf?: boolean; // 显式标记叶子节点
}

export interface FlatNode {
    key: string | number;
    parentKey: string | number | null;
    childrenKeys: (string | number)[];
    item: TreeDataItem;
    disabled: boolean;
}
