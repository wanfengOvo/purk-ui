import React, { useState } from 'react';
import Popover from '../Popover';



const PopoverExample: React.FC = () => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ padding: '100px' }}>
            <Popover
                title="Popover 标题"
                content={() => <div>这是 Popover 内容（函数式渲染）</div>}
                placement="top"
                arrow={true}
                open={open}
                trigger='click'
                mouseEnterDelay={100}
                mouseLeaveDelay={200}
                classNames={{
                    container: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }
                }}
            >
                <span onClick={() => setOpen(!open)}>哈机密</span>
            </Popover>

        </div>
    );
};

export default PopoverExample;