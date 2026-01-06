import type { PropsWithChildren, MouseEvent, TouchEvent } from "react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from './Carousel.module.less';
import Button from "../Button/Button";

interface CarouselProps {
    arrows?: boolean;
    autoPlay?: boolean;
    autoplaySpeed?: number;
    draggable?: boolean;
    infinite?: boolean;
    dots?: boolean | { className?: string };
    dotsPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Carousel(props: PropsWithChildren<CarouselProps>) {
    const {
        arrows = false,
        autoPlay = false,
        autoplaySpeed = 3000,
        draggable = false,
        infinite = false,
        dots = true,
        dotsPlacement = 'bottom',
        children
    } = props;

    const slides = React.Children.toArray(children);
    const originalCount = slides.length;

    const clones = infinite && originalCount > 1
        ? [slides[originalCount - 1], ...slides, slides[0]]
        : slides;

    const [currentIndex, setCurrentIndex] = useState(infinite ? 1 : 0);
    // 是否开启 transition 动画（拖拽时、瞬移复位时需要关闭）
    const [isTransitioning, setIsTransitioning] = useState(false);

    const listRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 拖拽相关的数据 ref (不触发渲染)
    const dragInfo = useRef({
        isDown: false,
        startX: 0,
        currentTranslate: 0,
        startTime: 0
    });

    // 自动播放控制 ref
    const isPausedRef = useRef(false);

    const updateListStyle = useCallback((offset = 0, withAnimation = true) => {
        if (!listRef.current) return;
        const percent = currentIndex * 100;

        listRef.current.style.transition = withAnimation ? 'transform 0.5s ease' : 'none';
        listRef.current.style.transform = `translateX(calc(-${percent}% + ${offset}px))`;
    }, [currentIndex]);

    // 当 index 或 动画状态变化时，同步样式
    useEffect(() => {
        updateListStyle(0, isTransitioning);
    }, [currentIndex, isTransitioning, updateListStyle]);


    const moveTo = useCallback((index: number) => {
        setIsTransitioning(true); // 开启 CSS 动画
        setCurrentIndex(index);
    }, []);

    const next = useCallback(() => {
        // 如果正在动画中，拒绝操作（防止快速点击导致错位）
        if (isTransitioning) return;

        const target = currentIndex + 1;
        if (!infinite && target >= clones.length) return;
        moveTo(target);
    }, [currentIndex, infinite, clones.length, isTransitioning, moveTo]);

    const prev = useCallback(() => {
        if (isTransitioning) return;

        const target = currentIndex - 1;
        if (!infinite && target < 0) return;
        moveTo(target);
    }, [currentIndex, infinite, isTransitioning, moveTo]);



    const handleTransitionEnd = () => {
        setIsTransitioning(false); // 动画结束，关闭动画标记

        if (!infinite) return;

        // 检查边界，进行瞬间跳转（Teleport）
        if (currentIndex === 0) {
            // 到了 0 (替身：最后一张)，瞬间跳到 倒数第2张 (真实：最后一张)
            setCurrentIndex(clones.length - 2);
        } else if (currentIndex === clones.length - 1) {
            // 到了 最后 (替身：第一张)，瞬间跳到 1 (真实：第一张)
            setCurrentIndex(1);
        }
    };




    const nextRef = useRef(next);
    useEffect(() => {
        nextRef.current = next;
    }, [next]);

    useEffect(() => {
        if (!autoPlay) return;

        const timer = setInterval(() => {
            // 检查暂停条件
            if (isPausedRef.current || dragInfo.current.isDown) return;
            nextRef.current();
        }, autoplaySpeed);

        timerRef.current = timer;

        return () => clearInterval(timer);
    }, [autoPlay, autoplaySpeed]);



    const handleDragStart = (e: MouseEvent | TouchEvent) => {
        if (!draggable || isTransitioning) return;

        // 只有鼠标左键才触发
        if (e.type === 'mousedown' && (e as MouseEvent).button !== 0) return;

        dragInfo.current.isDown = true;
        dragInfo.current.startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        dragInfo.current.startTime = Date.now();
        dragInfo.current.currentTranslate = 0;

        // 拖拽开始，立即关闭 CSS 动画，保证跟手
        if (listRef.current) {
            listRef.current.style.transition = 'none';
        }
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!dragInfo.current.isDown) return;

        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = currentX - dragInfo.current.startX;
        dragInfo.current.currentTranslate = diff;

        //直接修改 DOM transform，不触发 React Render
        updateListStyle(diff, false);
    };

    const handleDragEnd = () => {
        if (!dragInfo.current.isDown) return;
        dragInfo.current.isDown = false;

        const diff = dragInfo.current.currentTranslate;
        const duration = Date.now() - dragInfo.current.startTime;
        const width = listRef.current?.clientWidth || 0;

        // 判定条件：拖动超过 30% 宽度，或者 快速滑动(Flick)且距离大于50px
        const threshold = width * 0.3;
        const isFlick = duration < 300 && Math.abs(diff) > 50;

        // 恢复动画状态（moveTo 会重新开启 transition）
        if (diff < -threshold || (isFlick && diff < 0)) {
            // 向左拖 -> 下一张
            if (!infinite && currentIndex === clones.length - 1) moveTo(currentIndex); // 边界回弹
            else moveTo(currentIndex + 1);
        } else if (diff > threshold || (isFlick && diff > 0)) {
            // 向右拖 -> 上一张
            if (!infinite && currentIndex === 0) moveTo(currentIndex); // 边界回弹
            else moveTo(currentIndex - 1);
        } else {
            // 没达到条件，回弹复位
            moveTo(currentIndex);
        }
    };


    // 获取指示器（Dots）当前激活的索引（映射回原始 slides 长度）
    const getActiveDotIndex = () => {
        if (!infinite) return currentIndex;
        if (currentIndex === 0) return originalCount - 1;
        if (currentIndex === clones.length - 1) return 0;
        return currentIndex - 1;
    };

    return (
        <div
            className={styles.carousel}
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
        >
            <div className={styles.slider}>
                <div
                    ref={listRef}
                    className={styles.list}
                    style={{
                        cursor: draggable ? 'grab' : 'auto',
                        touchAction: draggable ? 'pan-y' : 'auto'
                    }}
                    onTransitionEnd={handleTransitionEnd}
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                >
                    {clones.map((slide, index) => (
                        <div
                            className={styles.slide}
                            key={index}
                        >
                            {slide}
                        </div>
                    ))}
                </div>

                {arrows && (
                    <>
                        <Button
                            shape="circle"
                            className={`${styles.arrow} ${styles.prev}`}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={prev}
                        >
                            &lt;
                        </Button>
                        <Button
                            shape="circle"
                            className={`${styles.arrow} ${styles.next}`}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={next}
                        >
                            &gt;
                        </Button>
                    </>
                )}

                {dots && (
                    <div className={`${styles.dots} ${styles[dotsPlacement]}`}>
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                className={`${styles.dot} ${index === getActiveDotIndex() ? styles.active : ''}`}
                                onClick={() => {
                                    if (!isTransitioning) {
                                        // 映射逻辑：如果是无限模式，index 需要 +1（因为 0 是克隆位）
                                        moveTo(infinite ? index + 1 : index);
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}