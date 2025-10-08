import {
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type FC,
} from 'react';
// 样式文件保持不变，我们仍然使用相同的类名
import styles from './Collapse.module.less'; 

// items 数组中每个对象的数据结构
export interface CollapseItemType {
  key: string; // 唯一标识符，必须提供
  label: ReactNode; // 头部标题，可以是任意 React 节点
  children: ReactNode; // 面板内容，可以是任意 React 节点
  disabled?: boolean; // 是否禁用
  className?: string; // 自定义单项的类名
  showArrow?: boolean;
}


type ActiveKey = string | string[];


interface CollapseProps {
  items: CollapseItemType[]; 
  accordion?: boolean;
  defaultActiveKey?: ActiveKey;
  onChange?: (activeKeys: ActiveKey) => void;
  className?: string;
  expandIcon?: (props: { isActive: boolean }) => ReactNode;
}


export const Collapse: FC<CollapseProps> = ({
  items,
  accordion = false,
  defaultActiveKey,
  onChange,
  className = '',
  expandIcon,
}) => {

  const [activeKeys, setActiveKeys] = useState<string[]>(() => {
    if (defaultActiveKey) {
      return Array.isArray(defaultActiveKey) ? defaultActiveKey : [defaultActiveKey];
    }
    return [];
  });


  useEffect(() => {
    if (onChange) {
      onChange(accordion ? activeKeys[0] || '' : activeKeys);
    }
  }, [activeKeys, accordion, onChange]);

  const handleItemClick = useCallback(
    (key: string) => {
      if (!items.find(item => item.key === key)?.disabled) {
        setActiveKeys((prevKeys) => {
          if (accordion) {
            return prevKeys.includes(key) ? [] : [key];
          } else {
            const newKeys = [...prevKeys];
            const index = newKeys.indexOf(key);
            if (index > -1) {
              newKeys.splice(index, 1);
            } else {
              newKeys.push(key);
            }
            return newKeys;
          }
        });
      }
    },
    [accordion, items], 
  );

  const containerClasses = [styles.collapseContainer, className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {items.map((item) => {
        const { showArrow = true } = item;
        const isActive = activeKeys.includes(item.key);
        
        // 动态计算每个 item 的 class
        const itemClasses = [
          styles.collapseItem,
          isActive ? styles.active : '',
          item.disabled ? styles.disabled : '',
          item.className, 
        ].filter(Boolean).join(' ');

          const renderIcon = () => {

          if (!showArrow) {
            return null;
          }

          if (expandIcon) {
            return (
              <span className={styles.collapseCustomIcon}>
                {expandIcon({ isActive })}
              </span>
            );
          }

          return <span className={styles.collapseArrow} />;
        };
        return (
          <div className={itemClasses} key={item.key}>
            <div
              className={styles.collapseHeader}
              onClick={() => handleItemClick(item.key)}
              role="button"
              aria-expanded={isActive}
              aria-controls={`content-${item.key}`}
              tabIndex={item.disabled ? -1 : 0}
            >
               {renderIcon()}
              {item.label}
            </div>
            <div
              id={`content-${item.key}`}
              className={styles.collapseContentWrapper}
            >
              <div className={styles.collapseContent}>
                <div className={styles.collapseContentPadding}>
                  {item.children}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};