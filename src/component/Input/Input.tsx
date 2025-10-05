import React, { useState, useMemo } from 'react';
import styles from './Input.module.less';


interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size' | 'prefix'> {
    size?: 'small' | 'medium' | 'large';
    status?: 'success' | 'warning' | 'error';
    type?: 'text' | 'password' | 'textarea';
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    defaultValue?: string;
    className?: string;
}

const Input: React.FC<InputProps> = (props) => {
    const {
        size = 'medium',
        status,
        type = 'text',
        prefix,
        suffix,
        placeholder,
        defaultValue,
        disabled,
        className,
        ...rest
    } = props;

    const [passwordVisible, setPasswordVisible] = useState(false);

    // 密码可见性切换逻辑
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    // 动态决定 input 的 type
    const inputType = useMemo(() => {
        if (type === 'password') {
            return passwordVisible ? 'text' : 'password';
        }
        return type;
    }, [type, passwordVisible]);
    
    // 密码框的切换图标
    const passwordIcon = useMemo(() => {
        if (type !== 'password') return null;
        // 在实际项目中，你会用图标组件替换这里的文字
        return (
            <span onClick={togglePasswordVisibility} className={styles.passwordIcon}>
                {passwordVisible ? '👁️' : '👁️‍🗨️'} 
            </span>
        );
    }, [type, passwordVisible]);
    
    // 组合根元素的 className
    const rootClassName = [
        styles.inputWrapper,
        styles[size],
        status ? styles[status] : '',
        type === 'textarea' ? styles.isTextarea : '',
        disabled ? styles.disabled : '',
        className || ''
    ].join(' ').trim();


    const renderInput = () => {
        if (type === 'textarea') {
            return (
                <textarea
                    className={styles.inputElement}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            );
        }
        return (
            <input
                className={styles.inputElement}
                type={inputType}
                placeholder={placeholder}
                defaultValue={defaultValue}
                disabled={disabled}
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            />
        );
    };

    return (
        <div className={rootClassName}>
            {prefix && <span className={styles.prefix}>{prefix}</span>}
            {renderInput()}
            {/* 密码图标和后缀可以共存 */}
            {passwordIcon}
            {suffix && <span className={styles.suffix}>{suffix}</span>}
        </div>
    );
};

export default Input;