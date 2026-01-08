export const pxToNumber = (val: number | string | undefined, total: number): number | undefined => {
    if (val === undefined) return undefined;
    if (typeof val === 'number') return val;
    const str = val.trim();
    if (str.endsWith('%')) {
        return (parseFloat(str) / 100) * total;
    }
    return parseFloat(str);
};