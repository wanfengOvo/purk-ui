import { useState, useEffect, useRef } from 'react';
import styles from './Cascader.module.less';


export interface CascaderOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    children?: CascaderOption[];
}

interface CascaderProps {
    options: CascaderOption[];
    value: (string | number)[];
    onChange: (value: (string | number)[], selectedOptions: CascaderOption[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}


const areArraysEqual = (a: (string | number)[], b: (string | number)[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};


export default function Cascader(props: CascaderProps) {
    const { options, value, onChange, placeholder = "Select target...", disabled = false, className } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<(string | number)[]>([]);
    //展示当前选中的路径上的所有选项拼接的内容
    const [displayLabel, setDisplayLabel] = useState('');

    const [columns, setColumns] = useState<CascaderOption[][]>([options]);

    const cascaderRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cascaderRef.current && !cascaderRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    useEffect(() => {
        // 用于在选项树中查找指定值的完整路径
        const findPath = (
            nodes: CascaderOption[],           // 当前层级的选项列表
            targetValue: string | number,      // 要查找的目标值
            currentPath: CascaderOption[] = [] // 当前已找到的路径
        ): CascaderOption[] | null => {
            // 遍历当前层级的所有选项
            for (const node of nodes) {
                // 创建新路径，包含当前节点
                const newPath = [...currentPath, node];
                // 如果当前节点值匹配目标值，返回路径
                if (node.value === targetValue) {
                    return newPath;
                }
                // 如果当前节点有子节点，递归查找
                if (node.children) {
                    const foundPath = findPath(node.children, targetValue, newPath);
                    if (foundPath) return foundPath; // 找到路径则返回
                }
            }
            return null; // 未找到路径
        };

        // 用于存储找到的最深有效路径
        let deepestPathFound: CascaderOption[] = [];

        // 检查传入的 value 是否存在且非空
        if (value && value.length > 0) {
            // 遍历传入的 value 数组中的每一个值
            for (const val of value) {
                // 为每个值查找其在选项树中的完整路径
                const currentPath = findPath(options, val);

                // 如果找到了路径，并且这个路径比之前找到的任何路径都深（包含更多层级）
                if (currentPath && currentPath.length > deepestPathFound.length) {
                    // 更新最深路径为当前找到的路径
                    deepestPathFound = currentPath;
                }
            }
        }
        const finalPathValues = deepestPathFound.map(opt => opt.value);

        // 如果找到的路径与传入的值不一致，通知父组件更新
        // 这通常发生在传入的值不完整或无效时
        // 比如传入 ['arasaka'],UI显示：正确显示 "Corporations / Arasaka"
        // 父组件状态：仍然是 ['arasaka']，与组件显示不一致
        if (!areArraysEqual(finalPathValues, value)) {
            onChange(finalPathValues, deepestPathFound);
        }

        //设置为从根到计算出的最深层级的路径上的值
        setInternalValue(finalPathValues);

        if (finalPathValues.length > 0) {
            // 初始化列数组，第一列始终是根选项
            const newColumns: CascaderOption[][] = [options];
            // 当前层级的选项，初始为根选项
            let currentLevelOptions = options;

            // 遍历选中路径的每个值，构建每一列要显示的选项
            for (const val of finalPathValues) {
                // 在当前层级中找到匹配的选项
                const selectedOption = currentLevelOptions.find(opt => opt.value === val);
                if (selectedOption?.children) {
                    newColumns.push(selectedOption.children);
                    //进入到下一层
                    currentLevelOptions = selectedOption.children;
                }
            }

            setColumns(newColumns);
            setDisplayLabel(deepestPathFound.map(opt => opt.label).join(' / '));
        } else {
            // 如果没有找到有效路径，重置为初始状态
            setColumns([options]);     // 只显示根选项列
            setDisplayLabel('');       // 清空显示标签
            setInternalValue([]);      // 清空内部选中值
        }
    }, [value, options]); 


    const handleTriggerClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };


    const handleOptionClick = (option: CascaderOption, columnIndex: number) => {

        if (option.disabled) {
            return;
        }
        const newPathValues = internalValue.slice(0, columnIndex);
        newPathValues.push(option.value);

        const newSelectedOptions: CascaderOption[] = [];
        let currentLevelOptions: CascaderOption[] | undefined = options;
        for (const val of newPathValues) {
            const found: CascaderOption | undefined = currentLevelOptions?.find(opt => opt.value === val);
            if (found) {
                newSelectedOptions.push(found);
                currentLevelOptions = found.children;
            }
        }

        onChange(newPathValues, newSelectedOptions);

        if (!option.children || option.children.length === 0) {
            setIsOpen(false);
        }
    };

    const triggerClasses = [
        styles.trigger,
        isOpen ? styles.open : '',
        disabled ? styles.disabled : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={`${styles.cascader} ${className}`} ref={cascaderRef}>
            <div className={triggerClasses} onClick={handleTriggerClick}>
                <span className={displayLabel ? styles.value : styles.placeholder}>
                    {displayLabel || placeholder}
                </span>
                <span className={styles.arrow} />
            </div>

            {isOpen && !disabled && (
                <div className={styles.popup}>
                    {columns.map((column, colIndex) => (
                        <div key={colIndex} className={styles.column}>
                            {column.map(option => (
                                <div
                                    key={option.value}
                                    className={`${styles.option} ${internalValue[colIndex] === option.value ? styles.active : ''} ${option.disabled ? styles.disabled : ''}`}
                                    onClick={() => handleOptionClick(option, colIndex)}
                                >
                                    {option.label}
                                    {option.children && option.children.length > 0 && <span className={styles.nextIcon}>›</span>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}