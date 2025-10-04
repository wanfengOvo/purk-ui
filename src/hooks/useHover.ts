import type { RefObject } from "react";
import { useEffect, useState } from "react";
export interface HoverOptions {
    onEnter?: () => void;
    onLeave?: () => void;
    onChange?: (isHovering: boolean) => void;
}
export default function useHover(ref: RefObject<HTMLElement>, options?: HoverOptions) {
    const { onEnter, onLeave, onChange } = options || {};
    const [isHover, setIsHover] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleMouseEnter = () => {
            onEnter?.();
            setIsHover(true);
            onChange?.(true);
        };

        const handleMouseLeave = () => {
            onLeave?.();
            setIsHover(false);
            onChange?.(false);
        };

        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);

        // 清理函数：组件卸载或依赖变化时，移除事件监听
        return () => {
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [ref, onEnter, onLeave, onChange]);
    return isHover;
}