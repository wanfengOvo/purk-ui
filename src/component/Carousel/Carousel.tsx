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
    const slideCount = slides.length;

    const clones = infinite && slideCount > 1
        ? [slides[slideCount - 1], ...slides, slides[0]]
        : slides;

    const [currentIndex, setCurrentIndex] = useState(infinite ? 1 : 0);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    //当前拖拽的距离
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState<number | null>(null);

    //是否正在进行过渡动画
    const isAnimatingRef = useRef(false);
    const listRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const forceUnlock = useCallback(() => {
        isAnimatingRef.current = false;
        if (safetyTimerRef.current) {
            clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = null;
        }
    }, []);


    const moveTo = useCallback((index: number, needTransition = true) => {
        // 如果正在动画中，且不是“无动画跳转(瞬移)”，则拒绝操作
        if (isAnimatingRef.current && needTransition) return;

        setTransitionEnabled(needTransition);
        setCurrentIndex(index);

        if (needTransition) {
            isAnimatingRef.current = true;
            // 如果 onTransitionEnd 没有触发，这个定时器会强制解锁，防止死锁
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = setTimeout(() => {
                forceUnlock();
            }, 600);
        }
    }, [forceUnlock]);


    const next = useCallback(() => {
        if (isAnimatingRef.current) return;
        if (!infinite && currentIndex === slideCount - 1) return;
        moveTo(currentIndex + 1);
    }, [currentIndex, infinite, slideCount, moveTo]);

    const prev = useCallback(() => {
        if (isAnimatingRef.current) return;
        if (!infinite && currentIndex === 0) return;
        moveTo(currentIndex - 1);
    }, [currentIndex, infinite, moveTo]);

    const nextRef = useRef(next);
    useEffect(() => {
        nextRef.current = next;
    }, [next]);


    const handleTransitionEnd = () => {
        // 正常结束，执行解锁
        forceUnlock();

        if (!infinite) return;
        if (currentIndex === clones.length - 1) {
            // 跳回 index 1，不需要动画
            moveTo(1, false);
        } else if (currentIndex === 0) {
            // 跳回倒数第2个，不需要动画
            moveTo(clones.length - 2, false);
        }
    };


    useEffect(() => {
        if (!autoPlay || isDragging) return;

        const startTimer = () => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                nextRef.current();
            }, autoplaySpeed);
        };

        startTimer();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        };
    }, [autoPlay, isDragging, autoplaySpeed]);



    const handleDragStart = (e: MouseEvent | TouchEvent) => {
        if (!draggable || isAnimatingRef.current) return;
        if (e.type === 'mousedown') e.preventDefault();

        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setStartX(clientX);

        setTransitionEnabled(false); // 拖拽时关闭动画
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || startX === null) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setTranslateX(clientX - startX);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        setStartX(null);
        setTranslateX(0);

        const threshold = listRef.current ? listRef.current.clientWidth / 4 : 100;

        // 恢复动画
        if (translateX < -threshold) {
            // 向左拖，下一张
            if (!infinite && currentIndex === slideCount - 1) moveTo(currentIndex); // 边界回弹
            else moveTo(currentIndex + 1);
        } else if (translateX > threshold) {
            // 向右拖，上一张
            if (!infinite && currentIndex === 0) moveTo(currentIndex); // 边界回弹
            else moveTo(currentIndex - 1);
        } else {
            // 没拖动多少，回弹复位
            moveTo(currentIndex);
        }
    };

    const getActiveDotIndex = () => {
        if (!infinite) return currentIndex;
        if (currentIndex === 0) return slideCount - 1;
        if (currentIndex === clones.length - 1) return 0;
        return currentIndex - 1;
    };

    return (
        <div
            className={styles.carousel}
            onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
            onMouseLeave={() => {
                // 鼠标离开，恢复自动播放
                if (autoPlay && !isDragging) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    timerRef.current = setInterval(() => nextRef.current(), autoplaySpeed);
                }
            }}
        >
            <div className={styles.slider}>
                <div
                    ref={listRef}
                    className={styles.list}
                    style={{
                        transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
                        // 只有在非拖拽 且 需要过渡时 才开启 CSS 动画
                        transition: transitionEnabled ? 'transform 0.5s ease' : 'none',
                        cursor: draggable ? 'grab' : 'auto'
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
                        <div className={styles.slide} key={index} style={{ width: '100%', flexShrink: 0 }}>
                            {slide}
                        </div>
                    ))}
                </div>

                {arrows && (
                    <>
                        <Button shape="circle" className={`${styles.arrow} ${styles.prev}`} onClick={prev}>&lt;</Button>
                        <Button shape="circle" className={`${styles.arrow} ${styles.next}`} onClick={next}>&gt;</Button>
                    </>
                )}

                {dots && (
                    <div className={`${styles.dots} ${styles[dotsPlacement]}`}>
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                className={`${styles.dot} ${index === getActiveDotIndex() ? styles.active : ''}`}
                                onClick={() => {
                                    if (!isAnimatingRef.current) {
                                        moveTo(infinite ? index + 1 : index)
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