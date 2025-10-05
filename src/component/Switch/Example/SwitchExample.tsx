import React, { useState } from 'react';
import Switch from '../Switch';
import styles from './SwitchExample.module.less';

const SwitchExample: React.FC = () => {
  const [controlledChecked, setControlledChecked] = useState(false);
  
  const handleSwitchChange = (checked: boolean) => {
    console.log('Switch state changed to:', checked);
    setControlledChecked(checked);
  };

  return (
    <div className={styles.exampleContainer}>
      <h2>Switch 组件示例</h2>
      
      <div className={styles.exampleItem}>
        <h3>基础用法</h3>
        <Switch />
      </div>
      
      <div className={styles.exampleItem}>
        <h3>默认选中</h3>
        <Switch defaultChecked />
      </div>
      
      <div className={styles.exampleItem}>
        <h3>受控组件</h3>
        <Switch 
          checked={controlledChecked}
          onChange={handleSwitchChange}
        />
        <p>当前状态: {controlledChecked ? '开启' : '关闭'}</p>
      </div>
      
      <div className={styles.exampleItem}>
        <h3>禁用状态</h3>
        <Switch disabled defaultChecked />
      </div>
      
      <div className={styles.exampleItem}>
        <h3>不同尺寸</h3>
        <div className={styles.sizeExamples}>
          <Switch size="small" />
          <Switch size="medium" />
          <Switch size="large" />
        </div>
      </div>
      
      <div className={styles.exampleItem}>
        <h3>带内部文字</h3>
        <div className={styles.contentExamples}>
          <Switch 
            checkedChildren="open the door" 
            uncheckedChildren="close the door"
            defaultChecked 
          />
          <Switch 
            checkedChildren="ON" 
            uncheckedChildren="OFF"
            size="large"
          />
        </div>
      </div>
      
      <div className={styles.exampleItem}>
        <h3>图标内容</h3>
        <div className={styles.contentExamples}>
          <Switch 
            checkedChildren="✓" 
            uncheckedChildren="✕"
            defaultChecked 
          />
        </div>
      </div>
    </div>
  );
};

export default SwitchExample;