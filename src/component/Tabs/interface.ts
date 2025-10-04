export interface TabItem {
    key: string;
    title: string;
    content?: React.ReactNode;
    children?: TabItem[];
    closable?: boolean;
    disabled?: boolean;
}

