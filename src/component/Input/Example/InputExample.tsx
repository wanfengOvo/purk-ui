import React, { useState } from 'react';
import Input from '../Input'; // 确保这里的路径指向你修复后的 Input 组件
import './InputExample.less'; // 引入示例的布局样式

const InputExample: React.FC = () => {
    const [textValue, setTextValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('12345');

    return (
        <div className="example-container">
            <h1>Input 组件功能演示</h1>

 
            <div className="showcase-section">
                <h3>尺寸 (Sizes)</h3>
                <Input size="small" placeholder="Small size (小号)" />
                <Input size="medium" placeholder="Medium size (中号 - 默认)" />
                <Input size="large" placeholder="Large size (大号)" />
            </div>

            <div className="showcase-section">
                <h3>状态 (Statuses)</h3>
                <Input status="success" defaultValue="Success (成功)" />
                <Input status="warning" defaultValue="Warning (警告)" />
                <Input status="error" defaultValue="Error (错误)" />
            </div>

            <div className="showcase-section">
                <h3>前缀和后缀 (Prefix & Suffix)</h3>
                <Input prefix="https:// " placeholder="输入网址" />
                <Input suffix=".com" placeholder="输入域名" />
                <Input prefix="¥" suffix="RMB" defaultValue="1024" />
            </div>

            <div className="showcase-section">
                <h3>密码框 (Password)</h3>
                <p>点击右侧图标切换密码可见性。</p>
                <Input 
                    type="password" 
                    placeholder="输入密码"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                />
            </div>


            <div className="showcase-section">
                <h3>禁用状态 (Disabled)</h3>
                <Input disabled placeholder="禁用的输入框" />
                <Input disabled type="textarea" placeholder="禁用的文本域" />
            </div>
            

            <div className="showcase-section">
                <h3>受控组件 (Controlled Component)</h3>
                <p>输入框的值由 React state 控制，右侧实时显示字符数。</p>
                <Input 
                    placeholder="在这里输入..."
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    suffix={<span>{`${textValue.length} / 100`}</span>}
                />
            </div>


            <div className="showcase-section">
                <h3>文本域 (Textarea)</h3>
                <p>下面的 Textarea 被包裹在一个高度为 200px 的 div 中，以演示高度继承：</p>
                <div style={{ height: '200px' }}>
                    <Input 
                        type="textarea"
                        placeholder="这个文本域会填满父容器的 200px 高度..." 
                    />
                </div>
            </div>
        </div>
    );
};

export default InputExample;