import React from 'react';
import styles from './TimeLine.module.less';

interface Items {
    color?: string;
    label: string;
    children?: React.ReactNode;
    position?: 'left' | 'right';
    // 节点自定义
    dot?: React.ReactNode;
}

interface TimeLineProps {
    items: Items[];
    // 时间轴点在左侧 | 交替 | 右侧
    mode?: 'left' | 'alternate' | 'right';
    pending?: React.ReactNode;
    reverse?: boolean;
}

export default function TimeLine(props: TimeLineProps) {
    const { items, mode = 'left', pending, reverse = false } = props;

    // 处理 reverse 逻辑
    const timelineItems = reverse ? [...items].reverse() : items;

    // 计算每个列表项的 class
    const getItemClass = (item: Items, index: number) => {
        const itemPosition = item.position || (mode === 'alternate' ? (index % 2 === 0 ? 'left' : 'right') : mode);
        
        let classes = styles.timelineItem;
        
        if (itemPosition === 'left') {
            classes += ` ${styles.timelineItemLeft}`;
        }
        if (itemPosition === 'right') {
            classes += ` ${styles.timelineItemRight}`;
        }
        if (index === items.length - 1 && !pending) {
            classes += ` ${styles.timelineItemLast}`;
        }
        
        return classes;
    };

    // 计算时间轴容器的类名
    const getTimelineClass = () => {
        let classes = styles.timeline;
        if (mode) {
            classes += ` ${styles[`timeline-${mode}`]}`;
        }
        return classes;
    };

    return (
        <div className={getTimelineClass()}>
            <ol>
                {timelineItems.map((item, index) => (
                    <li key={index} className={getItemClass(item, index)}>
                        {/* label: 时间或其他标签，根据 mode 决定位置 */}
                        <div className={styles.timelineItemLabel}>{item.label}</div>

                        {/* tail: 连接线 */}
                        <div className={styles.timelineItemTail}></div>

                        {/* head: 时间轴上的节点 */}
                        <div 
                            className={styles.timelineItemHead} 
                            style={{ 
                                borderColor: item.color, 
                                color: item.color 
                            }}
                        >
                            {item.dot || <div className={styles.timelineItemDot}></div>}
                        </div>

                        {/* content: 内容区域 */}
                        <div className={styles.timelineItemContent}>
                            {item.children}
                        </div>
                    </li>
                ))}
                {/* pending: 等待项/加载中 */}
                {pending && (
                    <li className={`${styles.timelineItem} ${styles.timelineItemPending}`}>
                         <div className={styles.timelineItemTail}></div>
                         <div className={styles.timelineItemHead}>
                             {/* 你可以自定义加载中的图标 */}
                             <div className={styles.timelineItemDot}></div>
                         </div>
                         <div className={styles.timelineItemContent}>
                             {pending}
                         </div>
                    </li>
                )}
            </ol>
        </div>
    );
}