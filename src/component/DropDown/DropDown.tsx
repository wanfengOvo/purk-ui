import React, { type ReactNode, useRef, useMemo, useState, useEffect } from 'react';

import useHover from '../../hooks/useHover'; 
import styles from './Dropdown.module.less';

export interface MenuItem {
  label: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
}

type Placement = 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';
type Trigger = 'hover' | 'click';

interface DropdownProps {
  children: ReactNode;
  menuItems: MenuItem[];
  offsetX?: number;
  offsetY?: number;
  placement?: Placement;
  trigger?: Trigger;
}

const MenuItemComponent: React.FC<{ item: MenuItem }> = ({ item }) => {
  const hasSubmenu = !!item.children && item.children.length > 0;

  const [isSubmenuOpen, setSubmenuOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 鼠标进入处理函数
  const handleMouseEnter = () => {
    // 如果存在关闭子菜单的定时器，清除它
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // 如果有子菜单，则打开它
    if (hasSubmenu) {
      setSubmenuOpen(true);
    }
  };

  // 鼠标离开处理函数
  const handleMouseLeave = () => {
    // 启动一个定时器，在短暂延迟后关闭子菜单
    timerRef.current = setTimeout(() => {
      setSubmenuOpen(false);
    }, 300); // 300ms 的延迟，足够用户移动鼠标
  };

  const menuItemClasses = [
    styles.menuItem,
    item.disabled ? styles.disabled : '',
    item.danger ? styles.danger : '',
  ].join(' ');

  return (
    // 将事件监听器绑定到包含菜单项和子菜单的整个包装器上
    <div
      className={styles.menuItemWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={menuItemClasses}
        onClick={(e) => {
          if (!hasSubmenu && !item.disabled) {
            e.stopPropagation();
            item.onClick?.();
          }
        }}
      >
        {item.label}
        {hasSubmenu && <span className={styles.arrow}>›</span>}
      </div>
      {isSubmenuOpen && hasSubmenu && (
        <div className={styles.submenu}>
          <Menu items={item.children!} />
        </div>
      )}
    </div>
  );
};


const Menu: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  return (
    <>
      {items.map((item, index) => (
        <MenuItemComponent key={index} item={item} />
      ))}
    </>
  );
};


const Dropdown: React.FC<DropdownProps> = ({
  children,
  menuItems,
  offsetX = 0,
  offsetY = 0,
  placement = 'bottomLeft',
  trigger = 'hover'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpenByClick, setIsOpenByClick] = useState(false);
  const isHovering = useHover(containerRef);
  const isMenuVisible = trigger === 'hover' ? isHovering : isOpenByClick;

  useEffect(() => {
    if (trigger !== 'click' || !isOpenByClick) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpenByClick(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpenByClick, trigger]);

  const menuPositionStyle = useMemo((): React.CSSProperties => {
    switch (placement) {
      case 'bottom': return { top: `calc(100% + ${offsetY}px)`, left: `calc(50% + ${offsetX}px)`, transform: 'translateX(-50%)' };
      case 'bottomRight': return { top: `calc(100% + ${offsetY}px)`, right: `${offsetX}px` };
      case 'top': return { bottom: `calc(100% + ${offsetY}px)`, left: `calc(50% + ${offsetX}px)`, transform: 'translateX(-50%)' };
      case 'topLeft': return { bottom: `calc(100% + ${offsetY}px)`, left: `${offsetX}px` };
      case 'topRight': return { bottom: `calc(100% + ${offsetY}px)`, right: `${offsetX}px` };
      case 'bottomLeft': default: return { top: `calc(100% + ${offsetY}px)`, left: `${offsetX}px` };
    }
  }, [placement, offsetX, offsetY]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onClick={() => {
        if (trigger === 'click') {
          setIsOpenByClick(prev => !prev);
        }
      }}
    >
      <div className={styles.trigger}>
        {children}
      </div>

      
      {isMenuVisible && (
        <div className={styles.menu} style={menuPositionStyle}>
          <Menu items={menuItems} />
        </div>
      )}
    </div>
  );
};

export default Dropdown;