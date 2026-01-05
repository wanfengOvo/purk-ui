import type { ReactNode } from "react";

export interface TreeDataItem {
    key: string | number;
    title: ReactNode;
    children?: TreeDataItem[];
    disabled?: boolean;
    icon?: ReactNode;
}

export interface TreeProps {
    data: TreeDataItem[];
    checkbox?: boolean;
}

export interface TreeNodeProps {
    node: TreeDataItem;
    level: number;
    expandedKeys: (string | number)[];
    selectedKeys: (string | number)[];
    onToggleExpand: (key: string | number) => void;
    onToggleSelect: (keys: (string | number)[]) => void;
    showCheckbox: boolean;
}