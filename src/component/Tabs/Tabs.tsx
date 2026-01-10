import React, { useCallback, useEffect, useState } from 'react';
import styles from './Tabs.module.less';
import type { TabItem } from './interface';




interface TabsProps {
  tabs: TabItem[];
  level?: number;
  activeKey?: string | null;
  defaultActiveKey?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  onTabsChange?: (newTabs: TabItem[]) => void;
  onChange?: (key: string) => void;
  // 内部使用的 prop，用于事件冒泡 
  _internalOnClose?: (key: string) => void;
}


const removeTabByKey = (tabs: TabItem[], keyToRemove: string): TabItem[] => {
  return tabs
    .filter(tab => tab.key !== keyToRemove)
    .map(tab => {
      if (tab.children) {
        return { ...tab, children: removeTabByKey(tab.children, keyToRemove) };
      }
      return tab;
    });
};

const Tabs: React.FC<TabsProps> = ({
  tabs,
  level = 0,
  activeKey: activeKeyFromProps,
  defaultActiveKey,
  position = 'top',
  onTabsChange,
  onChange,
  _internalOnClose,
}) => {

  console.log(`%c[Tabs Render] Level ${level}`, 'color: lightblue; font-weight: bold;', { props: { activeKeyFromProps, defaultActiveKey, tabs } });

  const isControlled = activeKeyFromProps !== undefined;
  const [internalActiveKey, setInternalActiveKey] = useState<string | null>(() => {
    return defaultActiveKey || tabs.find(tab => !tab.disabled)?.key || null;
  });
  const activeKey = isControlled ? activeKeyFromProps : internalActiveKey;

  useEffect(() => {
    const activeKeyExists = tabs.some(tab => tab.key === activeKey);
    if (!activeKeyExists && !isControlled && tabs.length > 0) {
      const newActiveKey = tabs.find(tab => !tab.disabled)?.key || null;
      setInternalActiveKey(newActiveKey);
    }
  }, [tabs, activeKey, isControlled]);



  /*
  若为子标签（存在_internalOnClose），则将关闭事件向上传递给父组件
  若为顶层标签（存在onTabsChange），则通过removeTabByKey函数递归过滤掉要删除的标签（包括子标签中的目标标签），
  再通过onTabsChange将新标签数组返回给外部
  */
  const handleClose = useCallback((keyToClose: string) => {
    // 如果存在 _internalOnClose，说明自己是子组件，继续向上冒泡
    if (_internalOnClose) {
      _internalOnClose(keyToClose);
    }
    // 如果存在 onTabsChange，说明自己是顶层组件，处理逻辑
    else if (onTabsChange) {
      const newTabs = removeTabByKey(tabs, keyToClose);
      onTabsChange(newTabs);
    }
  }, [_internalOnClose, onTabsChange, tabs]);



  //切换选中的标签
  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;

    // 如果不是受控模式，就更新自己的内部状态
    if (!isControlled) {
      setInternalActiveKey(tab.key);
    }

    // 无论哪种模式，只要有 onChange，就调用它通知父组件
    onChange?.(tab.key);
  };

  const activeTab = tabs.find(tab => tab.key === activeKey);
  const containerClass = `${styles.multiLevelTabs} ${styles[position]}`;

  return (
    <div className={containerClass}>
      <div className={styles.tabHeader} style={{ marginLeft: `${level * 20}px` }}>
        {tabs.map(tab => (
          <div
            key={tab.key}
            onClick={() => handleTabClick(tab)}
            className={`
              ${styles.tabButton}
              ${activeKey === tab.key ? styles.active : ''}
              ${tab.disabled ? styles.disabled : ''}
            `}
          >
            <span>{tab.title}</span>
            {tab.closable && (onTabsChange || _internalOnClose) && (
              <span
                className={styles.closeIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(tab.key); // 点击时调用统一的处理器
                }}
              >
                ×
              </span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab && !activeTab.disabled && activeTab.content}

        {activeTab && !activeTab.disabled && activeTab.children && activeTab.children.length > 0 && (
          //渲染子tabs
          <Tabs
            key={activeTab.key}
            tabs={activeTab.children}
            level={level + 1}
            position={position}
            _internalOnClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default Tabs;