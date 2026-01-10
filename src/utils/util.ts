// 解析尺寸，返回数值和单位类型
export const parseSize = (val: number | string | undefined): { value: number; type: 'px' | 'ratio' } => {
    if (typeof val === 'number') {
        return { value: val, type: 'px' };
    }
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.endsWith('%')) {
            return { value: parseFloat(trimmed), type: 'ratio' }; // 30% -> 30
        }
        if (trimmed.endsWith('px')) {
            return { value: parseFloat(trimmed), type: 'px' };
        }
        // 尝试解析纯数字字符串
        const floatVal = parseFloat(trimmed);
        if (!isNaN(floatVal)) return { value: floatVal, type: 'px' };
    }
    return { value: 0, type: 'px' }; // 默认兜底
};

export const pxToNumber = (val: number | string | undefined, total: number): number => {
    if (val === undefined) return 0;
    const { value, type } = parseSize(val);
    if (type === 'ratio') {
        return (value / 100) * total;
    }
    return value;
};